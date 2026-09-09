import React, { useState, useEffect, useCallback } from 'react';
import { ErpSyncStatus, ErpWebhookPayload, ErpSystem, ErpSyncState } from '../types';
import { ERP_SYSTEMS, INITIAL_ERP_SYNC_STATUSES, RECENT_ERP_WEBHOOKS } from '../data/mockData';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  WifiOff,
  Clock,
  Zap,
  Package,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Webhook,
  Activity,
  Database,
  ArrowDownToLine,
} from 'lucide-react';

interface ErpSyncViewProps {
  partnerId: string;
  partnerName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function stateConfig(state: ErpSyncState): { label: string; icon: React.ReactNode; badge: string } {
  switch (state) {
    case 'connected':
      return { label: 'Connected', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'syncing':
      return { label: 'Syncing…', icon: <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />, badge: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'error':
      return { label: 'Error', icon: <XCircle className="w-4 h-4 text-rose-600" />, badge: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'disconnected':
      return { label: 'Disconnected', icon: <WifiOff className="w-4 h-4 text-neutral-400" />, badge: 'bg-neutral-100 text-neutral-600 border-neutral-300' };
    case 'pending':
      return { label: 'Pending', icon: <Clock className="w-4 h-4 text-amber-500" />, badge: 'bg-amber-100 text-amber-800 border-amber-300' };
  }
}

function eventTypeColor(type: ErpWebhookPayload['eventType']): string {
  switch (type) {
    case 'STOCK_UPDATE':       return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'PRICE_UPDATE':       return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'NEW_SALE':           return 'bg-violet-100 text-violet-800 border-violet-200';
    case 'BATCH_EXPIRY_ALERT': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'REORDER_TRIGGER':    return 'bg-orange-100 text-orange-800 border-orange-200';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ErpSyncView: React.FC<ErpSyncViewProps> = ({ partnerId, partnerName }) => {
  const [statuses, setStatuses] = useState<ErpSyncStatus[]>([]);
  const [webhookLog, setWebhookLog] = useState<ErpWebhookPayload[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'connectors' | 'catalogue' | 'webhook-log'>('connectors');
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/erp/sync-status/${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.statuses?.length) setStatuses(data.statuses);
        if (data.webhookLog?.length) setWebhookLog(data.webhookLog);
      }
    } catch {
      // fallback to seed data
      setStatuses(INITIAL_ERP_SYNC_STATUSES.filter(s => s.partnerId === partnerId));
      setWebhookLog(RECENT_ERP_WEBHOOKS.filter(w => w.partnerId === partnerId));
    }
  }, [partnerId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // If no statuses for this partner yet, show all available + unseeded placeholder
  const displayStatuses = statuses.length > 0
    ? statuses
    : INITIAL_ERP_SYNC_STATUSES.filter(s => s.partnerId === partnerId);

  const displayWebhooks = webhookLog.length > 0
    ? webhookLog
    : RECENT_ERP_WEBHOOKS.filter(w => w.partnerId === partnerId);

  const handleToggleAuto = async (statusId: string) => {
    try {
      const res = await fetch(`/api/erp/sync-status/${statusId}/toggle-auto`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setStatuses(prev => prev.map(s => s.id === statusId ? data.status : s));
        showToast('Auto-sync preference updated.');
      }
    } catch {
      setStatuses(prev => prev.map(s => s.id === statusId ? { ...s, autoSyncEnabled: !s.autoSyncEnabled } : s));
      showToast('Auto-sync preference updated (offline mode).');
    }
  };

  const handleSimulateWebhook = async (status: ErpSyncStatus) => {
    setSimulatingId(status.id);
    const payload: ErpWebhookPayload = {
      eventType: 'STOCK_UPDATE',
      partnerId,
      erpSystem: status.erpSystemName,
      timestamp: new Date().toISOString(),
      items: [
        { medicineId: 'med-paracetamol-650', medicineName: 'Paracetamol 650mg IP', batchNumber: `BT-SIM-${Date.now().toString().slice(-4)}`, expiryDate: '12/2028', stockCount: Math.floor(Math.random() * 500) + 100, basePrice: 1.15 },
        { medicineId: 'med-metformin-500', medicineName: 'Metformin HCl 500mg IP', batchNumber: `BT-SIM-${Date.now().toString().slice(-4)}`, expiryDate: '10/2028', stockCount: Math.floor(Math.random() * 400) + 50, basePrice: 2.10 },
      ],
    };
    try {
      const res = await fetch('/api/erp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setWebhookLog(prev => [payload, ...prev]);
        setStatuses(prev => prev.map(s => s.id === status.id
          ? { ...s, state: 'connected', lastSyncAt: new Date().toISOString(), itemsSyncedTotal: s.itemsSyncedTotal + 2, itemsPendingSync: Math.max(0, s.itemsPendingSync - 2) }
          : s
        ));
        showToast(`Simulated ${status.erpSystemName} webhook delivered — 2 items synced.`);
      }
    } catch {
      showToast('Webhook simulation failed (server offline).');
    }
    setSimulatingId(null);
  };

  const handleConnect = async (system: ErpSystem) => {
    setConnectingId(system.id);
    await new Promise(r => setTimeout(r, 1400));
    const newStatus: ErpSyncStatus = {
      id: `sync-new-${Date.now()}`,
      partnerId,
      erpSystemId: system.id,
      erpSystemName: system.name,
      state: 'connected',
      lastSyncAt: new Date().toISOString(),
      nextSyncAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      itemsSyncedTotal: 0,
      itemsPendingSync: 0,
      webhookUrl: 'https://genericmed.app/api/erp/webhook',
      apiKeyMasked: `••••••••${Math.random().toString(36).slice(-4)}`,
      autoSyncEnabled: true,
      syncIntervalMinutes: 15,
    };
    setStatuses(prev => [...prev, newStatus]);
    setConnectingId(null);
    setActiveTab('connectors');
    showToast(`${system.name} connected successfully to ${partnerName}.`);
  };

  const connectedSystemIds = new Set(displayStatuses.map(s => s.erpSystemId));

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">POS / ERP Bidirectional Sync</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Inventory, batch, billing &amp; stock data synced from {partnerName} via webhook
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-violet-100/70 p-1 rounded-xl">
          {(['connectors', 'catalogue', 'webhook-log'] as const).map(tab => (
            <button
              key={tab}
              id={`erp-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                activeTab === tab ? 'bg-violet-600 text-white shadow-xs' : 'text-neutral-600 hover:text-violet-900'
              }`}
            >
              {tab === 'webhook-log' ? 'Webhook Log' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Active Connectors ───────────────────────────────────────────── */}
      {activeTab === 'connectors' && (
        <div className="space-y-4">
          {displayStatuses.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center text-neutral-500 space-y-2">
              <Database className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-medium text-neutral-700">No ERP systems connected</p>
              <p className="text-xs">Switch to the Catalogue tab to connect Marg ERP, Mediman, POSibolt, or Vyapar.</p>
            </div>
          ) : (
            displayStatuses.map(status => {
              const cfg = stateConfig(status.state);
              const isExpanded = expandedId === status.id;
              return (
                <div key={status.id} id={`erp-connector-${status.id}`} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                  {/* Connector Header */}
                  <div className="p-4 flex flex-wrap items-center gap-3">
                    {/* ERP Logo */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                      ERP_SYSTEMS.find(e => e.id === status.erpSystemId)?.color || 'bg-neutral-500'
                    }`}>
                      {ERP_SYSTEMS.find(e => e.id === status.erpSystemId)?.logoInitials || status.erpSystemName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-neutral-900">{status.erpSystemName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        {status.itemsPendingSync > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            {status.itemsPendingSync} pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-neutral-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last sync: {relativeTime(status.lastSyncAt)}
                        </span>
                        {status.nextSyncAt && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-500" />
                            Next: {relativeTime(status.nextSyncAt)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {status.itemsSyncedTotal.toLocaleString('en-IN')} items synced total
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Auto-sync toggle */}
                      <button
                        id={`erp-toggle-auto-${status.id}`}
                        onClick={() => handleToggleAuto(status.id)}
                        className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-violet-700 transition-colors"
                        title="Toggle auto-sync"
                      >
                        {status.autoSyncEnabled
                          ? <ToggleRight className="w-5 h-5 text-emerald-600" />
                          : <ToggleLeft className="w-5 h-5 text-neutral-400" />
                        }
                        <span className="hidden sm:inline text-[11px]">Auto</span>
                      </button>

                      {/* Simulate webhook */}
                      <button
                        id={`erp-simulate-${status.id}`}
                        onClick={() => handleSimulateWebhook(status)}
                        disabled={simulatingId === status.id}
                        className="px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {simulatingId === status.id
                          ? <RefreshCw className="w-3 h-3 animate-spin" />
                          : <Activity className="w-3 h-3" />
                        }
                        Simulate
                      </button>

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : status.id)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error message */}
                  {status.state === 'error' && status.lastErrorMessage && (
                    <div className="mx-4 mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{status.lastErrorMessage}</span>
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 p-4 bg-neutral-50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Connection Config</div>
                        <div className="flex justify-between p-2.5 bg-white rounded-lg border border-neutral-200">
                          <span className="text-neutral-500">Webhook URL</span>
                          <span className="font-mono text-neutral-700 text-[10px] truncate max-w-[140px]">{status.webhookUrl}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-white rounded-lg border border-neutral-200">
                          <span className="text-neutral-500">API Key</span>
                          <span className="font-mono text-neutral-700">{status.apiKeyMasked}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-white rounded-lg border border-neutral-200">
                          <span className="text-neutral-500">Sync Interval</span>
                          <span className="font-semibold text-neutral-800">Every {status.syncIntervalMinutes} min</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Sync Statistics</div>
                        <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Total Synced</span>
                            <span className="font-bold text-emerald-700">{status.itemsSyncedTotal.toLocaleString('en-IN')} items</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Pending</span>
                            <span className={`font-bold ${status.itemsPendingSync > 0 ? 'text-amber-700' : 'text-neutral-400'}`}>
                              {status.itemsPendingSync} items
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Auto-Sync</span>
                            <span className={`font-bold ${status.autoSyncEnabled ? 'text-emerald-700' : 'text-neutral-400'}`}>
                              {status.autoSyncEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: ERP Catalogue ───────────────────────────────────────────────── */}
      {activeTab === 'catalogue' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ERP_SYSTEMS.map(system => {
            const isConnected = connectedSystemIds.has(system.id);
            const isConnecting = connectingId === system.id;
            return (
              <div key={system.id} id={`erp-catalogue-${system.id}`} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 ${system.color}`}>
                    {system.logoInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-neutral-900">{system.name}</span>
                      <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">v{system.version}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{system.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Webhook className="w-3.5 h-3.5" />
                    <span className="font-mono truncate max-w-[140px]">{system.webhookEndpoint}</span>
                  </div>
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <button
                      id={`erp-connect-${system.id}`}
                      onClick={() => handleConnect(system)}
                      disabled={isConnecting}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-60"
                    >
                      {isConnecting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowDownToLine className="w-3 h-3" />}
                      {isConnecting ? 'Connecting…' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Webhook Log ─────────────────────────────────────────────────── */}
      {activeTab === 'webhook-log' && (
        <div className="space-y-3">
          {displayWebhooks.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center text-neutral-500 text-sm">
              No webhook events received yet for this partner.
            </div>
          ) : (
            displayWebhooks.map((wh, idx) => (
              <div key={idx} id={`erp-webhook-${idx}`} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${eventTypeColor(wh.eventType)}`}>
                    {wh.eventType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{wh.erpSystem}</span>
                  <span className="ml-auto text-[11px] text-neutral-400">{relativeTime(wh.timestamp)}</span>
                </div>
                <div className="space-y-1.5">
                  {wh.items.map((item, i) => (
                    <div key={i} className="flex flex-wrap items-center justify-between p-2 bg-neutral-50 rounded-lg text-xs gap-2">
                      <span className="font-semibold text-neutral-800">{item.medicineName}</span>
                      <div className="flex items-center gap-3 text-neutral-500">
                        <span>Batch: <span className="font-mono text-neutral-700">{item.batchNumber}</span></span>
                        <span>Exp: {item.expiryDate}</span>
                        <span className="font-bold text-neutral-800">Qty: {item.stockCount}</span>
                        {item.basePrice && <span className="text-emerald-700 font-bold">₹{item.basePrice.toFixed(2)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
