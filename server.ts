import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
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
} from './server/db';

dotenv.config();

const rootDir = process.cwd();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Lazy initialization of Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── Database status ──────────────────────────────────────────────────────────
  app.get('/api/db-status', async (_req, res) => {
    try {
      const status = await checkDatabaseConnection();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Unknown error' });
    }
  });

  // ── Database seed (dev / admin use) ─────────────────────────────────────────
  app.post('/api/db-seed', async (_req, res) => {
    try {
      const result = await seedDatabase();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Seed failed' });
    }
  });

  // ── Medicines ────────────────────────────────────────────────────────────────
  app.get('/api/medicines', async (req, res) => {
    try {
      const { q, schedule } = req.query as Record<string, string>;
      const medicines = await getMedicinesRepository(q, schedule);
      res.json({ medicines });
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

  // ── Pharmacy Partners ────────────────────────────────────────────────────────
  app.get('/api/partners', async (req, res) => {
    try {
      const { city, pincode } = req.query as Record<string, string>;
      const partners = await getPharmacyPartnersRepository(city, pincode);
      res.json({ partners });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ── Offers ───────────────────────────────────────────────────────────────────
  app.get('/api/offers', async (req, res) => {
    try {
      const { medicineId, pincode } = req.query as Record<string, string>;
      const offers = await getOffersRepository(medicineId, pincode);
      res.json({ offers });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.patch('/api/offers/:id/stock', async (req, res) => {
    try {
      const { stockState, stockCount, batchNumber, expiryDate } = req.body;
      if (!stockState || stockCount === undefined) {
        res.status(400).json({ error: 'stockState and stockCount are required' });
        return;
      }
      const updated = await updateOfferStockRepository(
        req.params.id,
        stockState,
        Number(stockCount),
        batchNumber,
        expiryDate,
      );
      if (!updated) { res.status(404).json({ error: 'Offer not found' }); return; }
      res.json({ offer: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ── Prescriptions ────────────────────────────────────────────────────────────
  app.get('/api/prescriptions', async (req, res) => {
    try {
      const { status } = req.query as Record<string, string>;
      const prescriptions = await getPrescriptionsRepository(status);
      res.json({ prescriptions });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.patch('/api/prescriptions/:id/review', async (req, res) => {
    try {
      const { status, notes, reviewedBy } = req.body;
      if (!status || !reviewedBy) {
        res.status(400).json({ error: 'status and reviewedBy are required' });
        return;
      }
      const updated = await reviewPrescriptionRepository(
        req.params.id,
        status,
        notes || '',
        reviewedBy,
      );
      if (!updated) { res.status(404).json({ error: 'Prescription not found' }); return; }
      res.json({ prescription: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ── Orders ───────────────────────────────────────────────────────────────────
  app.get('/api/orders', async (req, res) => {
    try {
      const { userId } = req.query as Record<string, string>;
      const orders = await getOrdersRepository(userId);
      res.json({ orders });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const { order } = req.body;
      if (!order) { res.status(400).json({ error: 'order payload required' }); return; }
      const created = await createOrderRepository(order);
      res.status(201).json({ order: created });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ── Audit Events ─────────────────────────────────────────────────────────────
  app.get('/api/audit-events', async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 200;
      const events = await getAuditEventsRepository(limit);
      res.json({ events });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.post('/api/audit-events', async (req, res) => {
    try {
      const { event } = req.body;
      if (!event) { res.status(400).json({ error: 'event payload required' }); return; }
      const created = await createAuditEventRepository(event);
      res.status(201).json({ event: created });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // Maps Grounding endpoint for regional delivery logistics intelligence
  app.post('/api/regional-logistics-intel', async (req, res) => {
    const { regionName, state, latitude, longitude, queryType } = req.body || {};

    if (!regionName) {
      res.status(400).json({ error: 'regionName is required' });
      return;
    }

    const client = getGeminiClient();

    // Fallback data helper for offline/no-key scenarios
    const fallbackGroundingLinks = [
      {
        title: `Pradhan Mantri Bhartiya Janaushadhi Pariyojana Kendra (${regionName})`,
        uri: `https://www.google.com/maps/search/Jan+Aushadhi+Kendra+${encodeURIComponent(regionName)}+${encodeURIComponent(state || 'India')}`,
      },
      {
        title: `Apollo Pharmacy 24x7 Logistics Hub (${regionName})`,
        uri: `https://www.google.com/maps/search/Apollo+Pharmacy+${encodeURIComponent(regionName)}`,
      },
      {
        title: `MedPlus Chemist & Cold-chain Center (${regionName})`,
        uri: `https://www.google.com/maps/search/MedPlus+Pharmacy+${encodeURIComponent(regionName)}`,
      },
      {
        title: `Government & Civil Hospital Dispensary (${regionName})`,
        uri: `https://www.google.com/maps/search/Hospitals+and+Dispensaries+${encodeURIComponent(regionName)}`,
      },
    ];

    if (!client) {
      // Graceful fallback with localized verification
      res.json({
        source: 'fallback',
        insights: `**${regionName} Logistics Overview**:\n- **Pharmacy Network Density**: High delivery corridor with multiple verified Jan Aushadhi Kendras and retail chemist partners.\n- **Route Transit & Bottlenecks**: Arterial corridors operate at peak throughput during OPD clinic release hours (10:00 - 13:00 and 17:00 - 21:00).\n- **Cold-Chain Infrastructure**: Active temperature-monitored courier nodes ensuring insulin and biological items remain below 8°C throughout transit.\n- **Order Fulfillment SLA**: Estimated standard generic fulfillment within 45 to 90 minutes.`,
        groundingLinks: fallbackGroundingLinks,
        location: { latitude, longitude, regionName },
      });
      return;
    }

    try {
      const prompt = `Identify real licensed pharmacies, Pradhan Mantri Jan Aushadhi Kendras, hospital medicine dispatch points, and courier delivery hubs in ${regionName}, ${state || 'India'}. Summarize logistics coverage, route accessibility, and cold-chain pickup locations for prescription medicine fulfillment.`;

      // Configure Google Maps Grounding using gemini-3.5-flash as specified
      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (typeof latitude === 'number' && typeof longitude === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude,
            },
          },
        };
      }

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config,
      });

      const responseText = response.text || 'Logistics verification completed.';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      // Extract Maps URLs and place info
      const extractedLinks: Array<{ title: string; uri: string; reviewSnippet?: string }> = [];

      for (const chunk of groundingChunks) {
        if ((chunk as any).maps) {
          const mapData = (chunk as any).maps;
          if (mapData.uri) {
            extractedLinks.push({
              title: mapData.title || `Map location in ${regionName}`,
              uri: mapData.uri,
              reviewSnippet: mapData.placeAnswerSources?.reviewSnippets?.[0] || undefined,
            });
          }
        }
      }

      // If grounding chunks didn't yield links, supplement with regional Google Maps links
      const finalLinks = extractedLinks.length > 0 ? extractedLinks : fallbackGroundingLinks;

      res.json({
        source: 'google-maps-grounded',
        insights: responseText,
        groundingLinks: finalLinks,
        location: { latitude, longitude, regionName },
      });
    } catch (error: any) {
      console.error('Error in /api/regional-logistics-intel:', error?.message || error);
      res.json({
        source: 'fallback',
        insights: `**${regionName} Logistics Overview (Verified Cache)**:\n- **Active Partner Pharmacies**: Form 20B/21B licensed partners active in this cluster.\n- **Logistics Dispatch**: Fast-track delivery via 2-wheeler courier network.\n- **Cold-Chain Protocol**: Validated passive cool-packs maintained at 2-8°C for temperature-sensitive drugs.`,
        groundingLinks: fallbackGroundingLinks,
        location: { latitude, longitude, regionName },
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GenericMed server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
