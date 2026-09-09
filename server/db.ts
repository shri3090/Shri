import { PrismaClient, UserRole, DosageForm, ScheduleCategory, StockState, PrescriptionStatus, PaymentMethod, PaymentStatus, FulfillmentStatus } from '@prisma/client';
import {
  INITIAL_USER,
  PHARMACY_PARTNERS,
  MEDICINES,
  INITIAL_OFFERS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_ORDERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_REFILLS,
} from '../src/data/mockData';

// Alias to match legacy references inside this file
const INITIAL_AUDIT_EVENTS = INITIAL_AUDIT_LOGS;
const REFILL_REMINDERS = INITIAL_REFILLS;
import {
  Medicine as DomainMedicine,
  PharmacyPartner as DomainPartner,
  Offer as DomainOffer,
  Prescription as DomainPrescription,
  Order as DomainOrder,
  AuditEvent as DomainAuditEvent
} from '../src/types';

// Global singleton for Prisma Client
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// In-Memory Fallback State (keeps application fully operational if PostgreSQL is offline)
interface InMemoryDbState {
  users: typeof INITIAL_USER[];
  partners: DomainPartner[];
  medicines: DomainMedicine[];
  offers: DomainOffer[];
  prescriptions: DomainPrescription[];
  orders: DomainOrder[];
  auditEvents: DomainAuditEvent[];
  refillReminders: typeof REFILL_REMINDERS;
}

const memoryState: InMemoryDbState = {
  users: [JSON.parse(JSON.stringify(INITIAL_USER))],
  partners: JSON.parse(JSON.stringify(PHARMACY_PARTNERS)),
  medicines: JSON.parse(JSON.stringify(MEDICINES)),
  offers: JSON.parse(JSON.stringify(INITIAL_OFFERS)),
  prescriptions: JSON.parse(JSON.stringify(INITIAL_PRESCRIPTIONS)),
  orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
  auditEvents: JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS)),
  refillReminders: JSON.parse(JSON.stringify(REFILL_REMINDERS)),
};

let cachedConnectionStatus: {
  isConnected: boolean;
  provider: 'postgresql' | 'in-memory-fallback';
  latencyMs: number;
  lastChecked: string;
  error?: string;
  counts?: Record<string, number>;
} = {
  isConnected: false,
  provider: 'in-memory-fallback',
  latencyMs: 0,
  lastChecked: new Date().toISOString(),
};

/**
 * Health check to verify PostgreSQL connectivity with timeout
 */
export async function checkDatabaseConnection(force = false) {
  const now = Date.now();
  // Cache check for 5 seconds unless forced
  if (!force && now - new Date(cachedConnectionStatus.lastChecked).getTime() < 5000) {
    return cachedConnectionStatus;
  }

  const start = Date.now();
  try {
    // Attempt a lightweight query with a 2-second timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout (2000ms)')), 2000))
    ]);

    const latency = Date.now() - start;

    // Fetch entity counts from PostgreSQL
    const [partnersCount, medicinesCount, offersCount, ordersCount, auditCount] = await Promise.all([
      prisma.pharmacyPartner.count().catch(() => 0),
      prisma.medicine.count().catch(() => 0),
      prisma.offer.count().catch(() => 0),
      prisma.order.count().catch(() => 0),
      prisma.auditEvent.count().catch(() => 0),
    ]);

    cachedConnectionStatus = {
      isConnected: true,
      provider: 'postgresql',
      latencyMs: latency,
      lastChecked: new Date().toISOString(),
      counts: {
        pharmacyPartners: partnersCount,
        medicines: medicinesCount,
        offers: offersCount,
        orders: ordersCount,
        auditEvents: auditCount,
      }
    };
    return cachedConnectionStatus;
  } catch (err: any) {
    const latency = Date.now() - start;
    cachedConnectionStatus = {
      isConnected: false,
      provider: 'in-memory-fallback',
      latencyMs: latency,
      lastChecked: new Date().toISOString(),
      error: err?.message || 'Database unavailable',
      counts: {
        pharmacyPartners: memoryState.partners.length,
        medicines: memoryState.medicines.length,
        offers: memoryState.offers.length,
        orders: memoryState.orders.length,
        auditEvents: memoryState.auditEvents.length,
      }
    };
    return cachedConnectionStatus;
  }
}

/**
 * Seeds PostgreSQL from pharmaceutical domain models if connected.
 * Also resets/populates memory state.
 */
export async function seedDatabase(): Promise<{ success: boolean; message: string; counts: Record<string, number> }> {
  const status = await checkDatabaseConnection(true);

  if (status.isConnected) {
    try {
      // 1. Seed Pharmacy Partners
      for (const partner of PHARMACY_PARTNERS) {
        await prisma.pharmacyPartner.upsert({
          where: { id: partner.id },
          update: {
            name: partner.name,
            licenseNumber: partner.licenseNumber,
            gstin: partner.gstin,
            rating: partner.rating,
            reviewCount: partner.reviewCount,
            city: partner.city,
            pincode: partner.pincode,
            isJanAushadhiKendra: partner.isJanAushadhiKendra ?? false,
            verifiedBadge: partner.verifiedBadge,
          },
          create: {
            id: partner.id,
            name: partner.name,
            licenseNumber: partner.licenseNumber,
            gstin: partner.gstin,
            rating: partner.rating,
            reviewCount: partner.reviewCount,
            city: partner.city,
            pincode: partner.pincode,
            isJanAushadhiKendra: partner.isJanAushadhiKendra ?? false,
            verifiedBadge: partner.verifiedBadge,
          },
        });
      }

      // 2. Seed Compositions & Medicines
      for (const med of MEDICINES) {
        // Upsert Composition
        await prisma.composition.upsert({
          where: { id: med.compositionId },
          update: {
            name: med.composition,
            strength: med.strength,
            therapeuticClass: med.indication,
          },
          create: {
            id: med.compositionId,
            name: med.composition,
            strength: med.strength,
            therapeuticClass: med.indication,
          }
        });

        // Map schedule category
        const scheduleCatMap: Record<string, ScheduleCategory> = {
          'Schedule H': ScheduleCategory.SCHEDULE_H,
          'Schedule H1': ScheduleCategory.SCHEDULE_H1,
          'OTC': ScheduleCategory.OTC,
          'Schedule X': ScheduleCategory.SCHEDULE_X,
        };

        const dosageMap: Record<string, DosageForm> = {
          'Tablet': DosageForm.TABLET,
          'Capsule': DosageForm.CAPSULE,
          'Syrup': DosageForm.SYRUP,
          'Injection': DosageForm.INJECTION,
          'Inhaler': DosageForm.INHALER,
          'Ointment': DosageForm.OINTMENT,
        };

        await prisma.medicine.upsert({
          where: { id: med.id },
          update: {
            name: med.name,
            brandName: med.brandName,
            compositionText: med.composition,
            compositionId: med.compositionId,
            strength: med.strength,
            dosageForm: dosageMap[med.dosageForm] || DosageForm.TABLET,
            packSize: med.packSize,
            unitCount: med.unitCount,
            manufacturer: med.manufacturer,
            isGeneric: med.isGeneric,
            scheduleCategory: scheduleCatMap[med.scheduleCategory] || ScheduleCategory.OTC,
            requiresPrescription: med.requiresPrescription,
            indication: med.indication,
            brandedAlternativeName: med.brandedAlternativeName,
            brandedMrp: med.brandedMrp,
            genericMrp: med.genericMrp,
            imageUrl: med.imageUrl,
            description: med.description,
            dosageInstructions: med.dosageInstructions,
          },
          create: {
            id: med.id,
            name: med.name,
            brandName: med.brandName,
            compositionText: med.composition,
            compositionId: med.compositionId,
            strength: med.strength,
            dosageForm: dosageMap[med.dosageForm] || DosageForm.TABLET,
            packSize: med.packSize,
            unitCount: med.unitCount,
            manufacturer: med.manufacturer,
            isGeneric: med.isGeneric,
            scheduleCategory: scheduleCatMap[med.scheduleCategory] || ScheduleCategory.OTC,
            requiresPrescription: med.requiresPrescription,
            indication: med.indication,
            brandedAlternativeName: med.brandedAlternativeName,
            brandedMrp: med.brandedMrp,
            genericMrp: med.genericMrp,
            imageUrl: med.imageUrl,
            description: med.description,
            dosageInstructions: med.dosageInstructions,
          },
        });
      }

      // 3. Seed Offers
      for (const offer of INITIAL_OFFERS) {
        const stockStateMap: Record<string, StockState> = {
          'In Stock': StockState.IN_STOCK,
          'Low Stock': StockState.LOW_STOCK,
          'Out of Stock': StockState.OUT_OF_STOCK,
          'Stale': StockState.STALE,
        };

        await prisma.offer.upsert({
          where: { id: offer.id },
          update: {
            medicineId: offer.medicineId,
            partnerId: offer.partnerId,
            basePrice: offer.basePrice,
            mrp: offer.mrp,
            deliveryFee: offer.deliveryFee,
            packagingFee: offer.packagingFee,
            gstPercent: offer.gstPercent,
            totalPayableCost: offer.totalPayableCost,
            savingsVsBranded: offer.savingsVsBranded,
            savingsPercent: offer.savingsPercent,
            stockState: stockStateMap[offer.stockState] || StockState.IN_STOCK,
            stockCount: offer.stockCount,
            estimatedDeliveryHours: offer.estimatedDeliveryHours,
            batchNumber: offer.batchNumber,
            expiryDate: offer.expiryDate,
            isLowestPrice: offer.isLowestPrice ?? false,
          },
          create: {
            id: offer.id,
            medicineId: offer.medicineId,
            partnerId: offer.partnerId,
            basePrice: offer.basePrice,
            mrp: offer.mrp,
            deliveryFee: offer.deliveryFee,
            packagingFee: offer.packagingFee,
            gstPercent: offer.gstPercent,
            totalPayableCost: offer.totalPayableCost,
            savingsVsBranded: offer.savingsVsBranded,
            savingsPercent: offer.savingsPercent,
            stockState: stockStateMap[offer.stockState] || StockState.IN_STOCK,
            stockCount: offer.stockCount,
            estimatedDeliveryHours: offer.estimatedDeliveryHours,
            batchNumber: offer.batchNumber,
            expiryDate: offer.expiryDate,
            isLowestPrice: offer.isLowestPrice ?? false,
          }
        });
      }

      // 4. Seed Audit Events
      for (const event of INITIAL_AUDIT_EVENTS) {
        await prisma.auditEvent.upsert({
          where: { id: event.id },
          update: {
            actor: event.actor,
            role: event.role,
            action: event.action,
            entity: event.entity,
            entityId: event.entityId,
            details: event.details,
            timestamp: new Date(event.timestamp),
          },
          create: {
            id: event.id,
            actor: event.actor,
            role: event.role,
            action: event.action,
            entity: event.entity,
            entityId: event.entityId,
            details: event.details,
            timestamp: new Date(event.timestamp),
          }
        });
      }

      return {
        success: true,
        message: 'Successfully seeded PostgreSQL database via Prisma ORM.',
        counts: {
          pharmacyPartners: PHARMACY_PARTNERS.length,
          medicines: MEDICINES.length,
          offers: INITIAL_OFFERS.length,
          auditEvents: INITIAL_AUDIT_EVENTS.length,
        }
      };
    } catch (err: any) {
      console.error('Failed to seed PostgreSQL:', err);
      return {
        success: false,
        message: `PostgreSQL seeding encountered an error: ${err?.message}`,
        counts: {
          pharmacyPartners: memoryState.partners.length,
          medicines: memoryState.medicines.length,
          offers: memoryState.offers.length,
          auditEvents: memoryState.auditEvents.length,
        }
      };
    }
  }

  // Fallback: reset memory state
  memoryState.partners = JSON.parse(JSON.stringify(PHARMACY_PARTNERS));
  memoryState.medicines = JSON.parse(JSON.stringify(MEDICINES));
  memoryState.offers = JSON.parse(JSON.stringify(INITIAL_OFFERS));
  memoryState.prescriptions = JSON.parse(JSON.stringify(INITIAL_PRESCRIPTIONS));
  memoryState.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  memoryState.auditEvents = JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS));

  return {
    success: true,
    message: 'PostgreSQL offline; reset in-memory seed repository with 50 partners and full catalog.',
    counts: {
      pharmacyPartners: memoryState.partners.length,
      medicines: memoryState.medicines.length,
      offers: memoryState.offers.length,
      orders: memoryState.orders.length,
      auditEvents: memoryState.auditEvents.length,
    }
  };
}

// -------------------------------------------------------------
// Data Access Repositories (Unified PostgreSQL + In-Memory)
// -------------------------------------------------------------

export async function getMedicinesRepository(query?: string, scheduleCategory?: string): Promise<DomainMedicine[]> {
  const status = await checkDatabaseConnection();
  if (status.isConnected) {
    try {
      const where: any = {};
      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { compositionText: { contains: query, mode: 'insensitive' } },
          { brandedAlternativeName: { contains: query, mode: 'insensitive' } },
        ];
      }
      if (scheduleCategory) {
        where.scheduleCategory = scheduleCategory.toUpperCase().replace(' ', '_');
      }

      const rows = await prisma.medicine.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        brandName: r.brandName ?? undefined,
        composition: r.compositionText,
        compositionId: r.compositionId,
        strength: r.strength,
        dosageForm: (r.dosageForm.charAt(0) + r.dosageForm.slice(1).toLowerCase()) as any,
        packSize: r.packSize,
        unitCount: r.unitCount,
        manufacturer: r.manufacturer,
        isGeneric: r.isGeneric,
        scheduleCategory: (r.scheduleCategory === 'SCHEDULE_H' ? 'Schedule H' :
                           r.scheduleCategory === 'SCHEDULE_H1' ? 'Schedule H1' :
                           r.scheduleCategory === 'SCHEDULE_X' ? 'Schedule X' : 'OTC') as any,
        requiresPrescription: r.requiresPrescription,
        indication: r.indication,
        brandedAlternativeName: r.brandedAlternativeName ?? undefined,
        brandedMrp: r.brandedMrp,
        genericMrp: r.genericMrp,
        imageUrl: r.imageUrl ?? undefined,
        description: r.description,
        dosageInstructions: r.dosageInstructions ?? undefined,
      }));
    } catch (e) {
      console.warn('PostgreSQL fetch medicines failed, falling back to memory:', e);
    }
  }

  let list = memoryState.medicines;
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.composition.toLowerCase().includes(q) ||
      (m.brandedAlternativeName && m.brandedAlternativeName.toLowerCase().includes(q))
    );
  }
  if (scheduleCategory) {
    list = list.filter(m => m.scheduleCategory === scheduleCategory);
  }
  return list;
}

export async function getMedicineByIdRepository(id: string): Promise<DomainMedicine | null> {
  const status = await checkDatabaseConnection();
  if (status.isConnected) {
    try {
      const r = await prisma.medicine.findUnique({ where: { id } });
      if (r) {
        return {
          id: r.id,
          name: r.name,
          brandName: r.brandName ?? undefined,
          composition: r.compositionText,
          compositionId: r.compositionId,
          strength: r.strength,
          dosageForm: (r.dosageForm.charAt(0) + r.dosageForm.slice(1).toLowerCase()) as any,
          packSize: r.packSize,
          unitCount: r.unitCount,
          manufacturer: r.manufacturer,
          isGeneric: r.isGeneric,
          scheduleCategory: (r.scheduleCategory === 'SCHEDULE_H' ? 'Schedule H' :
                             r.scheduleCategory === 'SCHEDULE_H1' ? 'Schedule H1' :
                             r.scheduleCategory === 'SCHEDULE_X' ? 'Schedule X' : 'OTC') as any,
          requiresPrescription: r.requiresPrescription,
          indication: r.indication,
          brandedAlternativeName: r.brandedAlternativeName ?? undefined,
          brandedMrp: r.brandedMrp,
          genericMrp: r.genericMrp,
          imageUrl: r.imageUrl ?? undefined,
          description: r.description,
          dosageInstructions: r.dosageInstructions ?? undefined,
        };
      }
    } catch (e) {
      console.warn('PostgreSQL getMedicineById failed, falling back to memory:', e);
    }
  }

  return memoryState.medicines.find(m => m.id === id) || null;
}

export async function getPharmacyPartnersRepository(city?: string, pincode?: string): Promise<DomainPartner[]> {
  const status = await checkDatabaseConnection();
  if (status.isConnected) {
    try {
      const where: any = {};
      if (city) where.city = { equals: city, mode: 'insensitive' };
      if (pincode) where.pincode = pincode;

      const rows = await prisma.pharmacyPartner.findMany({
        where,
        orderBy: [{ rating: 'desc' }, { name: 'asc' }],
      });

      if (rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          licenseNumber: r.licenseNumber,
          gstin: r.gstin,
          rating: r.rating,
          reviewCount: r.reviewCount,
          city: r.city,
          pincode: r.pincode,
          isJanAushadhiKendra: r.isJanAushadhiKendra,
          verifiedBadge: r.verifiedBadge,
        }));
      }
    } catch (e) {
      console.warn('PostgreSQL fetch partners failed, falling back to memory:', e);
    }
  }

  let list = memoryState.partners;
  if (city) {
    list = list.filter(p => p.city.toLowerCase() === city.toLowerCase());
  }
  if (pincode) {
    list = list.filter(p => p.pincode === pincode);
  }
  return list;
}

export async function getOffersRepository(medicineId?: string, pincode?: string): Promise<DomainOffer[]> {
  const status = await checkDatabaseConnection();
  if (status.isConnected) {
    try {
      const where: any = {};
      if (medicineId) where.medicineId = medicineId;

      const rows = await prisma.offer.findMany({
        where,
        include: { partner: true },
        orderBy: { totalPayableCost: 'asc' },
      });

      if (rows.length > 0) {
        const domainOffers = rows.map((r: any) => ({
          id: r.id,
          medicineId: r.medicineId,
          partnerId: r.partnerId,
          partner: {
            id: r.partner.id,
            name: r.partner.name,
            licenseNumber: r.partner.licenseNumber,
            gstin: r.partner.gstin,
            rating: r.partner.rating,
            reviewCount: r.partner.reviewCount,
            city: r.partner.city,
            pincode: r.partner.pincode,
            isJanAushadhiKendra: r.partner.isJanAushadhiKendra,
            verifiedBadge: r.partner.verifiedBadge,
          },
          basePrice: r.basePrice,
          mrp: r.mrp,
          deliveryFee: r.deliveryFee,
          packagingFee: r.packagingFee,
          gstPercent: r.gstPercent,
          totalPayableCost: r.totalPayableCost,
          savingsVsBranded: r.savingsVsBranded,
          savingsPercent: r.savingsPercent,
          stockState: (r.stockState === 'IN_STOCK' ? 'In Stock' :
                       r.stockState === 'LOW_STOCK' ? 'Low Stock' :
                       r.stockState === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Stale') as any,
          stockCount: r.stockCount,
          freshnessTimestamp: r.freshnessTimestamp.toISOString(),
          estimatedDeliveryHours: r.estimatedDeliveryHours,
          batchNumber: r.batchNumber,
          expiryDate: r.expiryDate,
          isLowestPrice: r.isLowestPrice,
        }));

        if (pincode) {
          // Proximity ranking: Exact PIN -> Same City -> Total Cost
          return domainOffers.sort((a, b) => {
            const aExactPin = a.partner.pincode === pincode;
            const bExactPin = b.partner.pincode === pincode;
            if (aExactPin && !bExactPin) return -1;
            if (!aExactPin && bExactPin) return 1;
            return a.totalPayableCost - b.totalPayableCost;
          });
        }
        return domainOffers;
      }
    } catch (e) {
      console.warn('PostgreSQL fetch offers failed, falling back to memory:', e);
    }
  }

  let list = memoryState.offers;
  if (medicineId) {
    list = list.filter(o => o.medicineId === medicineId);
  }
  if (pincode) {
    return [...list].sort((a, b) => {
      const aExact = a.partner.pincode === pincode;
      const bExact = b.partner.pincode === pincode;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.totalPayableCost - b.totalPayableCost;
    });
  }
  return list;
}

export async function updateOfferStockRepository(
  offerId: string,
  stockState: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Stale',
  stockCount: number,
  batchNumber?: string,
  expiryDate?: string
): Promise<DomainOffer | null> {
  const status = await checkDatabaseConnection();
  if (status.isConnected) {
    try {
      const stockEnumMap: Record<string, StockState> = {
        'In Stock': StockState.IN_STOCK,
        'Low Stock': StockState.LOW_STOCK,
        'Out of Stock': StockState.OUT_OF_STOCK,
        'Stale': StockState.STALE,
      };

      const updated = await prisma.offer.update({
        where: { id: offerId },
        data: {
          stockState: stockEnumMap[stockState],
          stockCount,
          batchNumber: batchNumber || undefined,
          expiryDate: expiryDate || undefined,
          freshnessTimestamp: new Date(),
        },
        include: { partner: true }
      });

      return {
        id: updated.id,
        medicineId: updated.medicineId,
        partnerId: updated.partnerId,
        partner: updated.partner as any,
        basePrice: updated.basePrice,
        mrp: updated.mrp,
        deliveryFee: updated.deliveryFee,
        packagingFee: updated.packagingFee,
        gstPercent: updated.gstPercent,
        totalPayableCost: updated.totalPayableCost,
        savingsVsBranded: updated.savingsVsBranded,
        savingsPercent: updated.savingsPercent,
        stockState,
        stockCount: updated.stockCount,
        freshnessTimestamp: updated.freshnessTimestamp.toISOString(),
        estimatedDeliveryHours: updated.estimatedDeliveryHours,
        batchNumber: updated.batchNumber,
        expiryDate: updated.expiryDate,
        isLowestPrice: updated.isLowestPrice,
      };
    } catch (e) {
      console.warn('PostgreSQL update offer failed, updating memory:', e);
    }
  }

  const idx = memoryState.offers.findIndex(o => o.id === offerId);
  if (idx >= 0) {
    memoryState.offers[idx] = {
      ...memoryState.offers[idx],
      stockState,
      stockCount,
      freshnessTimestamp: new Date().toISOString(),
      ...(batchNumber ? { batchNumber } : {}),
      ...(expiryDate ? { expiryDate } : {}),
    };
    return memoryState.offers[idx];
  }
  return null;
}

export async function getPrescriptionsRepository(status?: string): Promise<DomainPrescription[]> {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    try {
      const where: any = {};
      if (status) {
        const map: Record<string, PrescriptionStatus> = {
          'Pending Review': PrescriptionStatus.PENDING_REVIEW,
          'Verified': PrescriptionStatus.VERIFIED,
          'Clarification Requested': PrescriptionStatus.CLARIFICATION_REQUESTED,
          'Rejected': PrescriptionStatus.REJECTED,
        };
        where.status = map[status];
      }
      const rows = await prisma.prescription.findMany({
        where,
        include: { extractedMedicines: true },
        orderBy: { uploadedAt: 'desc' },
      });

      if (rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          userId: r.userId,
          fileName: r.fileName,
          fileSize: r.fileSize,
          uploadedAt: r.uploadedAt.toISOString(),
          status: (r.status === 'PENDING_REVIEW' ? 'Pending Review' :
                   r.status === 'VERIFIED' ? 'Verified' :
                   r.status === 'CLARIFICATION_REQUESTED' ? 'Clarification Requested' : 'Rejected') as any,
          doctorName: r.doctorName ?? undefined,
          doctorRegNo: r.doctorRegNo ?? undefined,
          clinicName: r.clinicName ?? undefined,
          extractedMedicines: r.extractedMedicines.map((em: any) => ({
            name: em.name,
            dosage: em.dosage,
            duration: em.duration,
            verified: em.verified,
          })),
          reviewerNotes: r.reviewerNotes ?? undefined,
          reviewedBy: r.reviewedBy ?? undefined,
          reviewedAt: r.reviewedAt?.toISOString() ?? undefined,
          imageUrl: r.imageUrl ?? undefined,
        }));
      }
    } catch (e) {
      console.warn('PostgreSQL fetch prescriptions failed, using memory:', e);
    }
  }

  let list = memoryState.prescriptions;
  if (status) {
    list = list.filter(p => p.status === status);
  }
  return list;
}

export async function reviewPrescriptionRepository(
  id: string,
  status: 'Verified' | 'Rejected' | 'Clarification Requested',
  notes: string,
  reviewedBy: string
): Promise<DomainPrescription | null> {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    try {
      const statusMap: Record<string, PrescriptionStatus> = {
        'Verified': PrescriptionStatus.VERIFIED,
        'Rejected': PrescriptionStatus.REJECTED,
        'Clarification Requested': PrescriptionStatus.CLARIFICATION_REQUESTED,
      };

      const updated = await prisma.prescription.update({
        where: { id },
        data: {
          status: statusMap[status],
          reviewerNotes: notes,
          reviewedBy,
          reviewedAt: new Date(),
        },
        include: { extractedMedicines: true },
      });

      return {
        id: updated.id,
        userId: updated.userId,
        fileName: updated.fileName,
        fileSize: updated.fileSize,
        uploadedAt: updated.uploadedAt.toISOString(),
        status,
        doctorName: updated.doctorName ?? undefined,
        doctorRegNo: updated.doctorRegNo ?? undefined,
        clinicName: updated.clinicName ?? undefined,
        extractedMedicines: updated.extractedMedicines,
        reviewerNotes: updated.reviewerNotes ?? undefined,
        reviewedBy: updated.reviewedBy ?? undefined,
        reviewedAt: updated.reviewedAt?.toISOString() ?? undefined,
      };
    } catch (e) {
      console.warn('PostgreSQL prescription review failed, updating memory:', e);
    }
  }

  const idx = memoryState.prescriptions.findIndex(p => p.id === id);
  if (idx >= 0) {
    memoryState.prescriptions[idx] = {
      ...memoryState.prescriptions[idx],
      status,
      reviewerNotes: notes,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
    };
    return memoryState.prescriptions[idx];
  }
  return null;
}

export async function getOrdersRepository(userId?: string): Promise<DomainOrder[]> {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    try {
      const where: any = {};
      if (userId) where.userId = userId;

      const rows = await prisma.order.findMany({
        where,
        include: {
          items: { include: { medicine: true, offer: { include: { partner: true } } } },
          timeline: { orderBy: { timestamp: 'asc' } },
          partner: true,
          deliveryAddress: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          orderNumber: r.orderNumber,
          userId: r.userId,
          customerName: r.customerName ?? undefined,
          createdAt: r.createdAt.toISOString(),
          items: r.items.map((it: any) => ({
            quantity: it.quantity,
            medicine: {
              id: it.medicine.id,
              name: it.medicine.name,
              composition: it.medicine.compositionText,
              compositionId: it.medicine.compositionId,
              strength: it.medicine.strength,
              dosageForm: (it.medicine.dosageForm.charAt(0) + it.medicine.dosageForm.slice(1).toLowerCase()) as any,
              packSize: it.medicine.packSize,
              unitCount: it.medicine.unitCount,
              manufacturer: it.medicine.manufacturer,
              isGeneric: it.medicine.isGeneric,
              scheduleCategory: 'OTC' as any,
              requiresPrescription: it.medicine.requiresPrescription,
              indication: it.medicine.indication,
              brandedMrp: it.medicine.brandedMrp,
              genericMrp: it.medicine.genericMrp,
              description: it.medicine.description,
            },
            offer: {
              id: it.offer.id,
              medicineId: it.offer.medicineId,
              partnerId: it.offer.partnerId,
              partner: it.offer.partner,
              basePrice: it.offer.basePrice,
              mrp: it.offer.mrp,
              deliveryFee: it.offer.deliveryFee,
              packagingFee: it.offer.packagingFee,
              gstPercent: it.offer.gstPercent,
              totalPayableCost: it.offer.totalPayableCost,
              savingsVsBranded: it.offer.savingsVsBranded,
              savingsPercent: it.offer.savingsPercent,
              stockState: 'In Stock' as any,
              stockCount: it.offer.stockCount,
              freshnessTimestamp: it.offer.freshnessTimestamp.toISOString(),
              estimatedDeliveryHours: it.offer.estimatedDeliveryHours,
              batchNumber: it.offer.batchNumber,
              expiryDate: it.offer.expiryDate,
            },
          })),
          totalItemAmount: r.totalItemAmount,
          totalDeliveryFee: r.totalDeliveryFee,
          totalPackagingFee: r.totalPackagingFee,
          totalGst: r.totalGst,
          totalPayable: r.totalPayable,
          totalSavings: r.totalSavings,
          deliveryAddress: r.deliveryAddress || {
            id: 'addr-default',
            label: 'Delivery Address',
            street: 'Default Address',
            city: r.partner.city,
            state: 'State',
            pincode: r.partner.pincode,
          },
          paymentMethod: r.paymentMethod as any,
          paymentStatus: r.paymentStatus as any,
          fulfillmentStatus: (r.fulfillmentStatus === 'ORDER_PLACED' ? 'Order Placed' :
                              r.fulfillmentStatus === 'RX_VERIFICATION' ? 'Rx Verification' :
                              r.fulfillmentStatus === 'PHARMACY_PROCESSING' ? 'Pharmacy Processing' :
                              r.fulfillmentStatus === 'DISPATCHED' ? 'Dispatched' :
                              r.fulfillmentStatus === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' :
                              r.fulfillmentStatus === 'DELIVERED' ? 'Delivered' : 'Cancelled') as any,
          partner: r.partner as any,
          prescriptionId: r.prescriptionId ?? undefined,
          prescriptionStatus: r.prescriptionStatus ?? undefined,
          timeline: r.timeline.map((t: any) => ({
            status: t.status,
            timestamp: t.timestamp.toISOString(),
            description: t.description,
          })),
          trackingNumber: r.trackingNumber ?? undefined,
          invoiceNumber: r.invoiceNumber,
        }));
      }
    } catch (e) {
      console.warn('PostgreSQL fetch orders failed, falling back to memory:', e);
    }
  }

  let list = memoryState.orders;
  if (userId) list = list.filter(o => o.userId === userId);
  return list;
}

export async function createOrderRepository(order: DomainOrder): Promise<DomainOrder> {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    try {
      const created = await prisma.order.create({
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          customerName: order.customerName,
          totalItemAmount: order.totalItemAmount,
          totalDeliveryFee: order.totalDeliveryFee,
          totalPackagingFee: order.totalPackagingFee,
          totalGst: order.totalGst,
          totalPayable: order.totalPayable,
          totalSavings: order.totalSavings,
          partnerId: order.partner.id,
          invoiceNumber: order.invoiceNumber,
          trackingNumber: order.trackingNumber,
          fulfillmentStatus: FulfillmentStatus.ORDER_PLACED,
          timeline: {
            create: order.timeline.map(t => ({
              status: t.status,
              timestamp: new Date(t.timestamp),
              description: t.description,
            }))
          },
          items: {
            create: order.items.map(it => ({
              medicineId: it.medicine.id,
              offerId: it.offer.id,
              quantity: it.quantity,
              unitPrice: it.offer.basePrice,
              totalPrice: it.offer.basePrice * it.quantity,
            }))
          }
        }
      });
      return order;
    } catch (e) {
      console.warn('PostgreSQL createOrder failed, inserting into memory:', e);
    }
  }

  memoryState.orders.unshift(order);
  return order;
}

export async function getAuditEventsRepository(limit = 100): Promise<DomainAuditEvent[]> {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    try {
      const rows = await prisma.auditEvent.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      if (rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          timestamp: r.timestamp.toISOString(),
          actor: r.actor,
          role: r.role,
          action: r.action,
          entity: r.entity,
          entityId: r.entityId,
          details: r.details,
        }));
      }
    } catch (e) {
      console.warn('PostgreSQL fetch audit events failed, using memory:', e);
    }
  }

  return memoryState.auditEvents.slice(0, limit);
}

export async function createAuditEventRepository(event: DomainAuditEvent): Promise<DomainAuditEvent> {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    try {
      await prisma.auditEvent.create({
        data: {
          id: event.id,
          timestamp: new Date(event.timestamp),
          actor: event.actor,
          role: event.role,
          action: event.action,
          entity: event.entity,
          entityId: event.entityId,
          details: event.details,
        }
      });
      return event;
    } catch (e) {
      console.warn('PostgreSQL createAuditEvent failed, adding to memory:', e);
    }
  }

  memoryState.auditEvents.unshift(event);
  return event;
}
