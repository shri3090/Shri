import React, { useState, useMemo } from 'react';
import { PharmacyPartner, Offer, Medicine, Order } from '../types';
import { Store, ShieldCheck, CheckCircle2, AlertTriangle, Package, RefreshCw, Edit3, Truck, Search, User, X, Filter, Database, Thermometer } from 'lucide-react';
import { PeakHoursHeatmap } from './PeakHoursHeatmap';
import { ErpSyncView } from './ErpSyncView';
import { ColdChainMonitorView } from './ColdChainMonitorView';

interface PartnerPharmacyViewProps {
  partner: PharmacyPartner;
  allPartners: PharmacyPartner[];
  onSelectPartner: (partner: PharmacyPartner) => void;
  offers: Offer[];
  medicines: Medicine[];
  orders: Order[];
  onUpdateOfferStock: (offerId: string, newStock: number, state: 'In Stock' | 'Low Stock' | 'Out of Stock') => void;
  onUpdateOfferPrice: (offerId: string, newBasePrice: number) => void;
  onPackOrder: (orderId: string) => void;
}

export const PartnerPharmacyView: React.FC<PartnerPharmacyViewProps> = ({
  partner,
  allPartners,
  onSelectPartner,
  offers,
  medicines,
  orders,
  onUpdateOfferStock,
  onUpdateOfferPrice,
  onPackOrder,
}) => {
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'dispatched'>('all');
  const [activePartnerTab, setActivePartnerTab] = useState<'inventory' | 'orders' | 'erp-sync' | 'cold-chain'>('inventory');

  // Filter offers for this partner
  const partnerOffers = offers.filter((o) => o.partnerId === partner.id);
  const partnerOrders = orders.filter((o) => o.partner?.id === partner.id);

  // Filtered orders by search query (Order # or Customer name) and status
  const filteredOrders = useMemo(() => {
    return partnerOrders.filter((ord) => {
      // Status filter
      if (orderStatusFilter === 'pending' && (ord.fulfillmentStatus === 'Dispatched' || ord.fulfillmentStatus === 'Delivered')) {
        return false;
      }
      if (orderStatusFilter === 'dispatched' && ord.fulfillmentStatus !== 'Dispatched' && ord.fulfillmentStatus !== 'Delivered') {
        return false;
      }

      // Search query filter (Order number or Customer name)
      if (!orderSearchQuery.trim()) return true;
      const q = orderSearchQuery.toLowerCase().trim();
      const matchOrderNum = ord.orderNumber.toLowerCase().includes(q);
      const matchCustomer = (ord.customerName || '').toLowerCase().includes(q);
      const matchAddress =
        ord.deliveryAddress?.street.toLowerCase().includes(q) ||
        ord.deliveryAddress?.label.toLowerCase().includes(q) ||
        ord.deliveryAddress?.pincode.includes(q);

      return matchOrderNum || matchCustomer || matchAddress;
    });
  }, [partnerOrders, orderSearchQuery, orderStatusFilter]);

  const pendingPackCount = partnerOrders.filter(
    (o) => o.fulfillmentStatus !== 'Dispatched' && o.fulfillmentStatus !== 'Delivered'
  ).length;
  const dispatchedCount = partnerOrders.filter(
    (o) => o.fulfillmentStatus === 'Dispatched' || o.fulfillmentStatus === 'Delivered'
  ).length;

  const startEditPrice = (offer: Offer) => {
    setEditingOfferId(offer.id);
    setEditPrice(offer.basePrice);
  };

  const saveEditPrice = (offerId: string) => {
    onUpdateOfferPrice(offerId, editPrice);
    setEditingOfferId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Pharmacy Credentials & Switcher */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900">
                {partner.name}
              </h2>
              {partner.isJanAushadhiKendra && (
                <span className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                  Pradhan Mantri Jan Aushadhi Kendra
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Drug License: <span className="font-mono">{partner.licenseNumber}</span>
              </span>
              <span>• GSTIN: <span className="font-mono">{partner.gstin}</span></span>
              <span>• Rating: ⭐ {partner.rating}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 hidden sm:inline">Pilot Store (50 Live):</span>
          <select
            id="select-partner-kendra"
            value={partner.id}
            onChange={(e) => {
              const p = allPartners.find((x) => x.id === e.target.value);
              if (p) onSelectPartner(p);
            }}
            className="bg-white border border-purple-300 rounded-lg p-2 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-purple-600 shadow-xs max-w-xs"
          >
            {['Mumbai', 'Pune', 'Delhi', 'Bengaluru', 'Hyderabad'].map((city) => {
              const cityPartners = allPartners.filter((x) => x.city === city);
              if (cityPartners.length === 0) return null;
              return (
                <optgroup key={city} label={`📍 ${city} (${cityPartners.length} Stores)`}>
                  {cityPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} • {p.pincode}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Catalogued Medicines
          </span>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {partnerOffers.length} Active Feeds
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Real-time inventory sync enabled</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Assigned Orders
          </span>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {partnerOrders.length} Orders
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {partnerOrders.filter((o) => o.fulfillmentStatus === 'Pharmacy Processing').length} awaiting packing
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Compliance SLA
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            99.4% On-Time
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Batch logging & cold-chain verified</p>
        </div>
      </div>

      {/* D3-based Weekly Peak Order Volume & Staffing Optimization Heatmap */}
      <PeakHoursHeatmap partner={partner} />

      {/* Phase 3 Tab Switcher */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-semibold w-fit flex-wrap">
        {([
          { id: 'inventory',  label: 'Inventory & Orders', icon: <Package className="w-3.5 h-3.5" /> },
          { id: 'erp-sync',   label: 'ERP / POS Sync',    icon: <Database className="w-3.5 h-3.5" /> },
          { id: 'cold-chain', label: 'Cold-Chain IoT',     icon: <Thermometer className="w-3.5 h-3.5" /> },
        ] as const).map(tab => (
          <button
            key={tab.id}
            id={`partner-tab-${tab.id}`}
            onClick={() => setActivePartnerTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activePartnerTab === tab.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-purple-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Inventory Management & Orders ───────────────────────────────── */}
      {activePartnerTab === 'inventory' && (<>
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-neutral-900">
              Live Stock & Real-Time Price Ingestion (FR-PART-03)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Updates to base price immediately update the customer comparison engine. Low-stock triggers restocking alerts.
            </p>
          </div>
        </div>

        {partnerOffers.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            No offers listed for this partner yet.
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-neutral-100/70 border-b border-neutral-200 text-[11px] font-semibold text-neutral-700">
                  <th className="p-3">Medicine & Composition</th>
                  <th className="p-3">Batch & Expiry</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3">State</th>
                  <th className="p-3 text-right">Base Price (INR)</th>
                  <th className="p-3 text-right">Total Delivered</th>
                  <th className="p-3 text-center">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {partnerOffers.map((offer) => {
                  const med = medicines.find((m) => m.id === offer.medicineId);

                  return (
                    <tr key={offer.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-neutral-900">{med?.name}</div>
                        <div className="text-neutral-500 text-[11px]">
                          {med?.composition} ({med?.strength})
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-neutral-700">
                        {offer.batchNumber} <br />
                        <span className="text-neutral-400">Exp: {offer.expiryDate}</span>
                      </td>
                      <td className="p-3 font-semibold text-neutral-900">
                        {offer.stockCount} units
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            offer.stockState === 'In Stock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : offer.stockState === 'Low Stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {offer.stockState}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {editingOfferId === offer.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.5"
                              value={editPrice}
                              onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                              className="w-18 p-1 border rounded text-right text-xs"
                            />
                            <button
                              onClick={() => saveEditPrice(offer.id)}
                              className="px-2 py-1 bg-purple-600 text-white rounded text-[11px]"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 font-mono font-bold text-neutral-900">
                            <span>₹{offer.basePrice.toFixed(2)}</span>
                            <button
                              onClick={() => startEditPrice(offer)}
                              className="text-neutral-400 hover:text-neutral-700 p-0.5"
                              title="Edit Price"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        ₹{offer.totalPayableCost.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onUpdateOfferStock(offer.id, offer.stockCount + 50, 'In Stock')}
                            className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium"
                            title="Restock +50 units"
                          >
                            +50 Restock
                          </button>
                          <button
                            onClick={() => onUpdateOfferStock(offer.id, 0, 'Out of Stock')}
                            className="px-2 py-1 rounded bg-neutral-100 hover:bg-rose-100 text-rose-700 text-[11px] font-medium"
                            title="Mark Out of Stock"
                          >
                            0
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders To Pack & Dispatch */}
      <div id="partner-order-backlog" className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-base text-neutral-900">
                Partner Fulfillment Dispatch Desk
              </h3>
              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2.5 py-0.5 rounded-full font-mono">
                {partnerOrders.length} Total
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Orders assigned to your retail store. Verify tamper-evident seal, check batch numbers, and dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              {pendingPackCount} Ready to Pack
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {dispatchedCount} Dispatched
            </span>
          </div>
        </div>

        {/* Backlog Search Bar & Quick Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="input-partner-order-search"
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search backlog by Order # (e.g. GM-2026-8801) or Customer Name (e.g. Rajesh, Priya)..."
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-purple-600 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all shadow-xs"
              />
              {orderSearchQuery && (
                <button
                  id="btn-clear-order-search"
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl shrink-0">
              <button
                id="filter-order-all"
                onClick={() => setOrderStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  orderStatusFilter === 'all'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All ({partnerOrders.length})
              </button>
              <button
                id="filter-order-pending"
                onClick={() => setOrderStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  orderStatusFilter === 'pending'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                To Pack ({pendingPackCount})
              </button>
              <button
                id="filter-order-dispatched"
                onClick={() => setOrderStatusFilter('dispatched')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  orderStatusFilter === 'dispatched'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Dispatched ({dispatchedCount})
              </button>
            </div>
          </div>

          {/* Search suggestions & Results summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">Quick filters:</span>
              {['Rajesh Sharma', 'Priya Kulkarni', 'Vikram Malhotra', 'Sunita Nair'].map((name) => (
                <button
                  key={name}
                  onClick={() => setOrderSearchQuery(name)}
                  className={`px-2 py-0.5 rounded-md text-[11px] border transition-colors ${
                    orderSearchQuery.toLowerCase() === name.toLowerCase()
                      ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}
                >
                  {name.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-medium text-neutral-500">
              Showing <span className="font-bold text-neutral-900">{filteredOrders.length}</span> of {partnerOrders.length} orders
            </div>
          </div>
        </div>

        {partnerOrders.length === 0 ? (
          <div className="text-center py-10 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-neutral-400 text-xs">
            No active orders assigned to this pharmacy store.
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 px-4 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 space-y-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-neutral-800">No orders match your search</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No backlog orders found matching &ldquo;<span className="font-semibold text-neutral-700">{orderSearchQuery}</span>&rdquo; in order number or customer name.
              </p>
            </div>
            <button
              onClick={() => {
                setOrderSearchQuery('');
                setOrderStatusFilter('all');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-medium transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                id={`backlog-order-${ord.id}`}
                className="p-4 rounded-xl border border-neutral-200 hover:border-purple-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs bg-neutral-50/60 hover:bg-neutral-50"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-bold text-neutral-900 font-mono text-sm bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        ord.fulfillmentStatus === 'Dispatched' || ord.fulfillmentStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.fulfillmentStatus === 'Rx Verification'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {ord.fulfillmentStatus}
                    </span>
                    {ord.prescriptionStatus && (
                      <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                        Rx: {ord.prescriptionStatus}
                      </span>
                    )}
                    <span className="text-neutral-400 text-[11px] ml-auto md:ml-0 font-mono">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ord.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Customer Details Badge */}
                  <div className="flex items-center gap-2 text-neutral-700 bg-white/80 p-2 rounded-lg border border-neutral-200/80">
                    <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-neutral-900">
                        {ord.customerName || 'Rajesh Sharma'}
                      </span>
                      <span className="text-neutral-400 mx-1.5">•</span>
                      <span className="text-neutral-600">
                        {ord.deliveryAddress.label}: {ord.deliveryAddress.street}
                      </span>
                      <span className="text-neutral-400 mx-1 font-mono text-[11px]">
                        (PIN: {ord.deliveryAddress.pincode})
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="text-neutral-600 text-[11px]">
                    <span className="font-medium text-neutral-700">Items: </span>
                    {ord.items.map((i) => `${i.medicine.name} (x${i.quantity})`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-neutral-200">
                  <div className="text-left md:text-right">
                    <div className="font-bold text-sm text-neutral-900 font-mono">
                      ₹{ord.totalPayable.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {ord.paymentMethod} • {ord.paymentStatus}
                    </div>
                  </div>

                  {ord.fulfillmentStatus !== 'Dispatched' && ord.fulfillmentStatus !== 'Delivered' ? (
                    <button
                      id={`btn-pack-${ord.id}`}
                      onClick={() => onPackOrder(ord.id)}
                      className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Pack & Dispatch</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Dispatched
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>) /* end inventory tab */}

      {/* ── Tab: ERP / POS Sync (Phase 3) ──────────────────────────────────── */}
      {activePartnerTab === 'erp-sync' && (
        <ErpSyncView partnerId={partner.id} partnerName={partner.name} />
      )}

      {/* ── Tab: Cold-Chain IoT (Phase 3) ───────────────────────────────────── */}
      {activePartnerTab === 'cold-chain' && (
        <ColdChainMonitorView partnerId={partner.id} />
      )}
    </div>
  );
};
