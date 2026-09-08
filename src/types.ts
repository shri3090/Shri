/**
 * GenericMed Data Models and Types
 * Aligned with GenericMed PRD Section 14 (High-Level Data Model) & Section 15 (Roles & Permissions)
 */

export type UserRole = 'customer' | 'pharmacist' | 'partner' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  defaultPincode: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Composition {
  id: string;
  name: string; // e.g. "Paracetamol", "Metformin Hydrochloride"
  strength: string; // e.g. "650 mg", "500 mg"
  therapeuticClass: string;
}

export interface Medicine {
  id: string;
  name: string; // Brand or Generic name
  brandName?: string;
  composition: string; // Salt/Active ingredient
  compositionId: string;
  strength: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler' | 'Ointment';
  packSize: string; // e.g. "Strip of 15 tablets"
  unitCount: number; // e.g. 15
  manufacturer: string;
  isGeneric: boolean;
  scheduleCategory: 'Schedule H' | 'Schedule H1' | 'OTC' | 'Schedule X';
  requiresPrescription: boolean;
  indication: string; // e.g. "Fever & Pain Relief", "Type 2 Diabetes"
  brandedAlternativeName?: string;
  brandedMrp: number; // Standard branded MRP for savings calculation
  genericMrp: number;
  imageUrl?: string;
  description: string;
  dosageInstructions?: string;
}

export interface PharmacyPartner {
  id: string;
  name: string;
  licenseNumber: string; // e.g. "DL-20B/21B-MH-19284"
  gstin: string;
  rating: number;
  reviewCount: number;
  city: string;
  pincode: string;
  isJanAushadhiKendra?: boolean;
  verifiedBadge: boolean;
}

export interface Offer {
  id: string;
  medicineId: string;
  partnerId: string;
  partner: PharmacyPartner;
  basePrice: number; // in ₹
  mrp: number; // in ₹
  deliveryFee: number;
  packagingFee: number;
  gstPercent: number;
  totalPayableCost: number; // basePrice + deliveryFee + packagingFee + tax
  savingsVsBranded: number;
  savingsPercent: number;
  stockState: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Stale';
  stockCount: number;
  freshnessTimestamp: string; // ISO string
  estimatedDeliveryHours: number; // e.g. 2 for hyper-local, 24 for standard
  batchNumber: string;
  expiryDate: string; // e.g. "08/2028"
  isLowestPrice?: boolean;
}

export interface Prescription {
  id: string;
  userId: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'Pending Review' | 'Verified' | 'Clarification Requested' | 'Rejected';
  doctorName?: string;
  doctorRegNo?: string;
  clinicName?: string;
  extractedMedicines: {
    name: string;
    dosage: string;
    duration: string;
    verified: boolean;
  }[];
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  imageUrl?: string;
}

export interface CartItem {
  offer: Offer;
  medicine: Medicine;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName?: string;
  createdAt: string;
  items: CartItem[];
  totalItemAmount: number;
  totalDeliveryFee: number;
  totalPackagingFee: number;
  totalGst: number;
  totalPayable: number;
  totalSavings: number;
  deliveryAddress: Address;
  paymentMethod: 'UPI' | 'Credit/Debit Card' | 'NetBanking' | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  fulfillmentStatus: 'Order Placed' | 'Rx Verification' | 'Pharmacy Processing' | 'Dispatched' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  partner: PharmacyPartner;
  prescriptionId?: string;
  prescriptionStatus?: 'Verified' | 'Pending' | 'Not Required';
  timeline: {
    status: string;
    timestamp: string;
    description: string;
  }[];
  trackingNumber?: string;
  invoiceNumber: string;
}

export interface RefillReminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequencyDays: number;
  lastOrderedDate: string;
  nextRefillDate: string;
  isActive: boolean;
  packSize: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  orderId?: string;
  category: 'Prescription Issue' | 'Price Discrepancy' | 'Delivery Status' | 'Pharmacist Consultation' | 'Refund';
  subject: string;
  status: 'Open' | 'Pharmacist Review' | 'Resolved';
  createdAt: string;
  messages: {
    sender: 'customer' | 'support' | 'pharmacist';
    text: string;
    timestamp: string;
  }[];
}
