/**
 * GenericMed — Express API Server (backend/src/index.ts)
 * Separated from the Vite frontend — serves only /api/* routes.
 * Frontend runs independently on its own dev server (port 5173 by default).
 */

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

import {
  checkDatabaseConnection,
  seedDatabase,
  getMedicinesRepository,
  getMedicineByIdRepository,
  getPharmacyPartnersRepository,
  getOffersRepository,
  updateOfferStockRepository,
  getPrescriptionsRepository,
  reviewPrescriptionRepository,
  getOrdersRepository,
  createOrderRepository,
  getAuditEventsRepository,
  createAuditEventRepository,
} from './db.js';

import {
  ERP_SYSTEMS,
  INITIAL_ERP_SYNC_STATUSES,
  RECENT_ERP_WEBHOOKS,
  COLD_CHAIN_SENSORS,
  COLD_CHAIN_READINGS,
  INITIAL_COLD_CHAIN_ALERTS,
} from '../../frontend/src/data/mockData.js';

import type {
  ErpSyncStatus,
  ErpWebhookPayload,
  ColdChainSensor,
  ColdChainReading,
  ColdChainAlert,
} from '../../frontend/src/types.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// ── Phase 3 in-memory state ───────────────────────────────────────────────────
const erpSyncStatuses: ErpSyncStatus[] = JSON.parse(JSON.stringify(INITIAL_ERP_SYNC_STATUSES));
const erpWebhookLog: ErpWebhookPayload[] = JSON.parse(JSON.stringify(RECENT_ERP_WEBHOOKS));
const coldChainSensors: ColdChainSensor[] = JSON.parse(JSON.stringify(COLD_CHAIN_SENSORS));
const coldChainReadings: ColdChainReading[] = JSON.parse(JSON.stringify(COLD_CHAIN_READINGS));
const coldChainAlerts: ColdChainAlert[] = JSON.parse(JSON.stringify(INITIAL_COLD_CHAIN_ALERTS));

// ── Gemini client ─────────────────────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'genericmed-backend' } },
    });
  }
  return aiClient;
}

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Database ──────────────────────────────────────────────────────────────────
app.get('/api/db-status', async (_req, res) => {
  try {
    res.json(await checkDatabaseConnection());
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Unknown error' });
  }
});

app.post('/api/db-seed', async (_req, res) => {
  try {
    res.json(await seedDatabase());
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Seed failed' });
  }
});

// ── Medicines ─────────────────────────────────────────────────────────────────
app.get('/api/medicines', async (req, res) => {
  try {
    const { q, schedule } = req.query as Record<string, string>;
    res.json({ medicines: await getMedicinesRepository(q, schedule) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.get('/api/medicines/:id', async (req, res) => {
  try {
    const medicine = await getMedicineByIdRepository(req.params.id);
    if (!medicine) { res.status(404).json({ error: 'Medicine not found' }); return; }
    res.json({ medicine });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ── Partners ──────────────────────────────────────────────────────────────────
app.get('/api/partners', async (req, res) => {
  try {
    const { city, pincode } = req.query as Record<string, string>;
    res.json({ partners: await getPharmacyPartnersRepository(city, pincode) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ── Offers ────────────────────────────────────────────────────────────────────
app.get('/api/offers', async (req, res) => {
  try {
    const { medicineId, pincode } = req.query as Record<string, string>;
    res.json({ offers: await getOffersRepository(medicineId, pincode) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.patch('/api/offers/:id/stock', async (req, res) => {
  try {
    const { stockState, stockCount, batchNumber, expiryDate } = req.body;
    if (!stockState || stockCount === undefined) {
      res.status(400).json({ error: 'stockState and stockCount are required' }); return;
    }
    const updated = await updateOfferStockRepository(
      req.params.id, stockState, Number(stockCount), batchNumber, expiryDate,
    );
    if (!updated) { res.status(404).json({ error: 'Offer not found' }); return; }
    res.json({ offer: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ── Prescriptions ─────────────────────────────────────────────────────────────
app.get('/api/prescriptions', async (req, res) => {
  try {
    const { status } = req.query as Record<string, string>;
    res.json({ prescriptions: await getPrescriptionsRepository(status) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.patch('/api/prescriptions/:id/review', async (req, res) => {
  try {
    const { status, notes, reviewedBy } = req.body;
    if (!status || !reviewedBy) {
      res.status(400).json({ error: 'status and reviewedBy are required' }); return;
    }
    const updated = await reviewPrescriptionRepository(req.params.id, status, notes || '', reviewedBy);
    if (!updated) { res.status(404).json({ error: 'Prescription not found' }); return; }
    res.json({ prescription: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const { userId } = req.query as Record<string, string>;
    res.json({ orders: await getOrdersRepository(userId) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { order } = req.body;
    if (!order) { res.status(400).json({ error: 'order payload required' }); return; }
    res.status(201).json({ order: await createOrderRepository(order) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ── Audit Events ──────────────────────────────────────────────────────────────
app.get('/api/audit-events', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 200;
    res.json({ events: await getAuditEventsRepository(limit) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/audit-events', async (req, res) => {
  try {
    const { event } = req.body;
    if (!event) { res.status(400).json({ error: 'event payload required' }); return; }
    res.status(201).json({ event: await createAuditEventRepository(event) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ── Phase 3: ERP / POS Webhook Sync ──────────────────────────────────────────
app.get('/api/erp/systems', (_req, res) => {
  res.json({ systems: ERP_SYSTEMS });
});

app.get('/api/erp/sync-status', (_req, res) => {
  res.json({ statuses: erpSyncStatuses, recentWebhooks: erpWebhookLog.slice(0, 20) });
});

app.get('/api/erp/sync-status/:partnerId', (req, res) => {
  const { partnerId } = req.params;
  res.json({
    statuses: erpSyncStatuses.filter(s => s.partnerId === partnerId),
    webhookLog: erpWebhookLog.filter(w => w.partnerId === partnerId),
  });
});

app.post('/api/erp/webhook', (req, res) => {
  try {
    const payload = req.body as ErpWebhookPayload;
    if (!payload?.partnerId || !payload?.erpSystem || !payload?.eventType) {
      res.status(400).json({ error: 'partnerId, erpSystem, and eventType are required' }); return;
    }
    const inbound: ErpWebhookPayload = { ...payload, timestamp: new Date().toISOString() };
    erpWebhookLog.unshift(inbound);
    if (erpWebhookLog.length > 100) erpWebhookLog.pop();
    const idx = erpSyncStatuses.findIndex(s => s.partnerId === payload.partnerId);
    if (idx >= 0) {
      erpSyncStatuses[idx] = {
        ...erpSyncStatuses[idx],
        state: 'connected',
        lastSyncAt: new Date().toISOString(),
        nextSyncAt: new Date(Date.now() + erpSyncStatuses[idx].syncIntervalMinutes * 60 * 1000).toISOString(),
        itemsSyncedTotal: erpSyncStatuses[idx].itemsSyncedTotal + payload.items.length,
        itemsPendingSync: Math.max(0, erpSyncStatuses[idx].itemsPendingSync - payload.items.length),
        lastErrorMessage: undefined,
      };
    }
    res.status(200).json({ received: true, itemsProcessed: payload.items.length, timestamp: inbound.timestamp });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.patch('/api/erp/sync-status/:id/toggle-auto', (req, res) => {
  const idx = erpSyncStatuses.findIndex(s => s.id === req.params.id);
  if (idx < 0) { res.status(404).json({ error: 'Sync status not found' }); return; }
  erpSyncStatuses[idx] = { ...erpSyncStatuses[idx], autoSyncEnabled: !erpSyncStatuses[idx].autoSyncEnabled };
  res.json({ status: erpSyncStatuses[idx] });
});

// ── Phase 3: IoT Cold-Chain Telemetry ─────────────────────────────────────────
app.get('/api/cold-chain/sensors', (req, res) => {
  const { partnerId } = req.query as Record<string, string>;
  res.json({ sensors: partnerId ? coldChainSensors.filter(s => s.partnerId === partnerId) : coldChainSensors });
});

app.get('/api/cold-chain/readings/:sensorId', (req, res) => {
  res.json({
    readings: coldChainReadings
      .filter(r => r.sensorId === req.params.sensorId)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
  });
});

app.get('/api/cold-chain/readings-by-order/:orderId', (req, res) => {
  res.json({
    readings: coldChainReadings
      .filter(r => r.orderId === req.params.orderId)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
    sensor: coldChainSensors.find(s => s.orderId === req.params.orderId) || null,
  });
});

app.get('/api/cold-chain/alerts', (req, res) => {
  const { resolved } = req.query as Record<string, string>;
  let alerts = coldChainAlerts;
  if (resolved === 'false') alerts = alerts.filter(a => !a.resolvedAt);
  if (resolved === 'true')  alerts = alerts.filter(a => !!a.resolvedAt);
  res.json({ alerts: alerts.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()) });
});

app.post('/api/cold-chain/alert', (req, res) => {
  try {
    const { sensorId, tempC, message, severity } = req.body;
    if (!sensorId || tempC === undefined) {
      res.status(400).json({ error: 'sensorId and tempC are required' }); return;
    }
    const sensor = coldChainSensors.find(s => s.id === sensorId);
    if (!sensor) { res.status(404).json({ error: 'Sensor not found' }); return; }

    const sIdx = coldChainSensors.findIndex(s => s.id === sensorId);
    coldChainSensors[sIdx] = {
      ...coldChainSensors[sIdx],
      currentTempC: tempC,
      status: tempC > coldChainSensors[sIdx].maxThresholdC || tempC < coldChainSensors[sIdx].minThresholdC
        ? 'Breach' : tempC >= coldChainSensors[sIdx].maxThresholdC - 0.5 ? 'Warning' : 'Active',
      lastPingAt: new Date().toISOString(),
    };

    const reading: ColdChainReading = {
      id: `rdg-live-${Date.now()}`,
      sensorId,
      orderId: sensor.orderId,
      tempC,
      recordedAt: new Date().toISOString(),
      isBreachEvent: tempC > sensor.maxThresholdC || tempC < sensor.minThresholdC,
    };
    coldChainReadings.push(reading);

    if (reading.isBreachEvent) {
      const alert: ColdChainAlert = {
        id: `alert-live-${Date.now()}`,
        sensorId,
        sensorLabel: sensor.label,
        orderId: sensor.orderId,
        severity: severity || 'Critical',
        message: message || `Temperature ${tempC}°C outside safe range (${sensor.minThresholdC}–${sensor.maxThresholdC}°C).`,
        tempC,
        thresholdC: tempC > sensor.maxThresholdC ? sensor.maxThresholdC : sensor.minThresholdC,
        triggeredAt: new Date().toISOString(),
      };
      coldChainAlerts.unshift(alert);
      res.status(201).json({ alert, reading }); return;
    }
    res.status(200).json({ reading });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.patch('/api/cold-chain/alerts/:id/acknowledge', (req, res) => {
  const { acknowledgedBy } = req.body;
  const idx = coldChainAlerts.findIndex(a => a.id === req.params.id);
  if (idx < 0) { res.status(404).json({ error: 'Alert not found' }); return; }
  coldChainAlerts[idx] = {
    ...coldChainAlerts[idx],
    resolvedAt: new Date().toISOString(),
    acknowledgedBy: acknowledgedBy || 'Duty Pharmacist',
  };
  res.json({ alert: coldChainAlerts[idx] });
});

// ── Google Maps Grounded Logistics Intelligence ───────────────────────────────
app.post('/api/regional-logistics-intel', async (req, res) => {
  const { regionName, state, latitude, longitude } = req.body || {};
  if (!regionName) { res.status(400).json({ error: 'regionName is required' }); return; }

  const fallbackGroundingLinks = [
    { title: `PM Jan Aushadhi Kendra (${regionName})`, uri: `https://www.google.com/maps/search/Jan+Aushadhi+Kendra+${encodeURIComponent(regionName)}+${encodeURIComponent(state || 'India')}` },
    { title: `Apollo Pharmacy (${regionName})`, uri: `https://www.google.com/maps/search/Apollo+Pharmacy+${encodeURIComponent(regionName)}` },
    { title: `MedPlus Chemist (${regionName})`, uri: `https://www.google.com/maps/search/MedPlus+Pharmacy+${encodeURIComponent(regionName)}` },
    { title: `Hospital Dispensary (${regionName})`, uri: `https://www.google.com/maps/search/Hospitals+and+Dispensaries+${encodeURIComponent(regionName)}` },
  ];

  const client = getGeminiClient();
  if (!client) {
    res.json({ source: 'fallback', insights: `**${regionName} Logistics Overview**: High delivery corridor with Jan Aushadhi Kendras. Standard fulfillment 45–90 mins.`, groundingLinks: fallbackGroundingLinks, location: { latitude, longitude, regionName } });
    return;
  }

  try {
    const config: any = { tools: [{ googleMaps: {} }] };
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      config.toolConfig = { retrievalConfig: { latLng: { latitude, longitude } } };
    }
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Identify real licensed pharmacies, Jan Aushadhi Kendras, and cold-chain hubs in ${regionName}, ${state || 'India'}. Summarize logistics coverage for prescription medicine fulfillment.`,
      config,
    });
    const responseText = response.text || 'Logistics verification completed.';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const extractedLinks: Array<{ title: string; uri: string; reviewSnippet?: string }> = [];
    for (const chunk of groundingChunks) {
      const mapData = (chunk as any).maps;
      if (mapData?.uri) extractedLinks.push({ title: mapData.title || `Map location in ${regionName}`, uri: mapData.uri, reviewSnippet: mapData.placeAnswerSources?.reviewSnippets?.[0] });
    }
    res.json({ source: 'google-maps-grounded', insights: responseText, groundingLinks: extractedLinks.length > 0 ? extractedLinks : fallbackGroundingLinks, location: { latitude, longitude, regionName } });
  } catch (error: any) {
    console.error('Logistics intel error:', error?.message);
    res.json({ source: 'fallback', insights: `**${regionName} Logistics Overview**: Active Form 20B/21B licensed partners. Fast-track 2-wheeler delivery with cold-pack validation.`, groundingLinks: fallbackGroundingLinks, location: { latitude, longitude, regionName } });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`GenericMed API server running on http://0.0.0.0:${PORT}`);
  console.log(`CORS allowed origin: ${CORS_ORIGIN}`);
});
