import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  UserRole,
  UserProfile,
  Medicine,
  Offer,
  CartItem,
  Prescription,
  Order,
  RefillReminder,
  AuditEvent,
  PharmacyPartner,
} from './types';
import {
  INITIAL_USER,
  MEDICINES,
  PHARMACY_PARTNERS,
  INITIAL_OFFERS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_ORDERS,
  INITIAL_REFILLS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { useLocale } from './i18n';

import { Header } from './components/Header';
import { MedicineCard } from './components/MedicineCard';
import { PriceComparisonModal } from './components/PriceComparisonModal';
import { PrescriptionUploadModal } from './components/PrescriptionUploadModal';
import { CartModal } from './components/CartModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { SavingsAndRefillsView } from './components/SavingsAndRefillsView';
import { PharmacistQueueView } from './components/PharmacistQueueView';
import { PartnerPharmacyView } from './components/PartnerPharmacyView';
import { AdminAuditView } from './components/AdminAuditView';
import { PrdComplianceModal } from './components/PrdComplianceModal';
import { SupportModal } from './components/SupportModal';
import { AuthScreen } from './components/AuthScreen';
import { PincodeServiceabilityModal } from './components/PincodeServiceabilityModal';
import { getPincodeServiceability } from './data/regionalDeliveryData';

import {
  Search,
  Sparkles,
  ShieldCheck,
  FileUp,
  AlertCircle,
  Pill,
  ArrowRight,
  TrendingDown,
  Check,
  Mic,
  MapPin,
  X,
} from 'lucide-react';

export default function App() {
  // Navigation & Role State
  const { t } = useLocale();
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('genericmed_auth_role');
    return (savedRole as UserRole) || 'customer';
  });
  const [activeCustomerTab, setActiveCustomerTab] = useState<string>('discover');

  // User Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('genericmed_is_authenticated');
    return saved !== null ? saved === 'true' : true;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('genericmed_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USER;
  });

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Domain Entities
  const [selectedPincode, setSelectedPincode] = useState(() => user?.defaultPincode || '400018');
  const [medicines, setMedicines] = useState<Medicine[]>(MEDICINES);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [partners, setPartners] = useState<PharmacyPartner[]>(PHARMACY_PARTNERS);
  const [selectedPartner, setSelectedPartner] = useState<PharmacyPartner>(PHARMACY_PARTNERS[0]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [reminders, setReminders] = useState<RefillReminder[]>(INITIAL_REFILLS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      medicine: MEDICINES[0], // Paracetamol 650
      offer: INITIAL_OFFERS[0],
      quantity: 2,
    },
  ]);

  // Bootstrap: hydrate state from API routes (PostgreSQL via Prisma or in-memory fallback)
  const bootstrapData = useCallback(async () => {
    try {
      const [medRes, offersRes, partnersRes, rxRes, ordersRes, auditRes] = await Promise.allSettled([
        fetch('/api/medicines').then(r => r.ok ? r.json() : null),
        fetch('/api/offers').then(r => r.ok ? r.json() : null),
        fetch('/api/partners').then(r => r.ok ? r.json() : null),
        fetch('/api/prescriptions').then(r => r.ok ? r.json() : null),
        fetch('/api/orders').then(r => r.ok ? r.json() : null),
        fetch('/api/audit-events?limit=200').then(r => r.ok ? r.json() : null),
      ]);

      if (medRes.status === 'fulfilled' && medRes.value?.medicines?.length > 0) {
        setMedicines(medRes.value.medicines);
      }
      if (offersRes.status === 'fulfilled' && offersRes.value?.offers?.length > 0) {
        setOffers(offersRes.value.offers);
      }
      if (partnersRes.status === 'fulfilled' && partnersRes.value?.partners?.length > 0) {
        const fetchedPartners: PharmacyPartner[] = partnersRes.value.partners;
        setPartners(fetchedPartners);
        setSelectedPartner(fetchedPartners[0]);
      }
      if (rxRes.status === 'fulfilled' && rxRes.value?.prescriptions?.length > 0) {
        setPrescriptions(rxRes.value.prescriptions);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders?.length > 0) {
        setOrders(ordersRes.value.orders);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value?.events?.length > 0) {
        setAuditLogs(auditRes.value.events);
      }
    } catch (err) {
      // Silent: in-memory mock seeds remain as fallback
      console.warn('[GenericMed] API bootstrap failed, running on in-memory seed data.', err);
    }
  }, []);

  useEffect(() => {
    bootstrapData();
  }, [bootstrapData]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [comparingMedicine, setComparingMedicine] = useState<Medicine | null>(null);
  const [showRxUploadModal, setShowRxUploadModal] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [showPrdModal, setShowPrdModal] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [showPincodeModal, setShowPincodeModal] = useState<boolean>(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Trigger temporary toast
  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Auth action handlers
  const handleAuthSuccess = (authenticatedUser: UserProfile, role: UserRole) => {
    setUser(authenticatedUser);
    setCurrentRole(role);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    if (authenticatedUser.defaultPincode) {
      setSelectedPincode(authenticatedUser.defaultPincode);
    }
    logAuditEvent(
      'USER_AUTHENTICATED',
      'User',
      authenticatedUser.id,
      `User ${authenticatedUser.name} signed in successfully with role ${role.toUpperCase()}.`,
      authenticatedUser.name,
      role
    );
    showToast(`Welcome back, ${authenticatedUser.name}! Signed in as ${role === 'customer' ? 'Patient' : role === 'pharmacist' ? 'Registered Pharmacist' : role === 'partner' ? 'Chemist Partner' : 'Audit Officer'}.`);
    if (activeCustomerTab === 'account') {
      setActiveCustomerTab('discover');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('genericmed_auth_user');
    localStorage.removeItem('genericmed_auth_role');
    localStorage.setItem('genericmed_is_authenticated', 'false');
    setIsAuthenticated(false);
    logAuditEvent(
      'USER_LOGGED_OUT',
      'User',
      user?.id || 'guest',
      `User signed out of session.`,
      user?.name || 'User',
      currentRole
    );
    showToast('You have been signed out.');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  // Add an audit log entry (FR-ADM-04)
  const logAuditEvent = (action: string, entity: string, entityId: string, details: string, actor: string, role: string) => {
    const newLog: AuditEvent = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      entity,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    // Persist to backend (fire-and-forget)
    fetch('/api/audit-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: newLog }),
    }).catch(() => { /* silent: audit UI already updated in-memory */ });
  };

  // Category filter
  const categories = [
    { id: 'all',          label: t.catAll },
    { id: 'chronic',      label: t.catChronic },
    { id: 'diabetes',     label: t.catDiabetes },
    { id: 'hypertension', label: t.catHypertension },
    { id: 'pain',         label: t.catPain },
    { id: 'acidity',      label: t.catAcidity },
    { id: 'antibiotics',  label: t.catAntibiotics },
    { id: 'allergy',      label: t.catAllergy },
  ];

  // Search and filter logic
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      // Category check
      if (selectedCategory === 'diabetes' && !med.composition.toLowerCase().includes('metformin')) return false;
      if (selectedCategory === 'hypertension' && !med.composition.toLowerCase().includes('telmisartan') && !med.composition.toLowerCase().includes('statin')) return false;
      if (selectedCategory === 'pain' && !med.composition.toLowerCase().includes('paracetamol')) return false;
      if (selectedCategory === 'acidity' && !med.composition.toLowerCase().includes('pantoprazole')) return false;
      if (selectedCategory === 'antibiotics' && !med.composition.toLowerCase().includes('amoxicillin')) return false;
      if (selectedCategory === 'allergy' && !med.composition.toLowerCase().includes('montelukast')) return false;
      if (selectedCategory === 'chronic' && !['med-metformin-500', 'med-telmisartan-40', 'med-atorvastatin-10', 'med-rosuvastatin-10'].includes(med.id)) return false;

      // Text query check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        med.name.toLowerCase().includes(q) ||
        med.composition.toLowerCase().includes(q) ||
        med.brandName?.toLowerCase().includes(q) ||
        med.brandedAlternativeName?.toLowerCase().includes(q) ||
        med.indication.toLowerCase().includes(q)
      );
    });
  }, [medicines, selectedCategory, searchQuery]);

  // Pincode-Aware Offers Helper (Phase 1 National Pilot)
  const getOffersForMedicine = (medId: string) => {
    const medOffers = offers.filter((o) => o.medicineId === medId);
    if (medOffers.length === 0) return [];

    const pinInfo = getPincodeServiceability(selectedPincode);

    // Sort: exact pincode match first, then same city match, then lowest totalPayableCost
    return [...medOffers].sort((a, b) => {
      const aExact = a.partner?.pincode === selectedPincode ? 1 : 0;
      const bExact = b.partner?.pincode === selectedPincode ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;

      const aCity = a.partner?.city?.toLowerCase() === pinInfo.city.toLowerCase() ? 1 : 0;
      const bCity = b.partner?.city?.toLowerCase() === pinInfo.city.toLowerCase() ? 1 : 0;
      if (aCity !== bCity) return bCity - aCity;

      return a.totalPayableCost - b.totalPayableCost;
    });
  };

  // Cart operations
  const handleAddToCart = (medicine: Medicine, offer: Offer) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.offer.id === offer.id);
      if (existing) {
        return prev.map((item) =>
          item.offer.id === offer.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { medicine, offer, quantity: 1 }];
    });
    showToast(`Added ${medicine.name} to cart.`);
  };

  const handleUpdateCartQuantity = (offerId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.offer.id === offerId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (offerId: string) => {
    setCartItems((prev) => prev.filter((item) => item.offer.id !== offerId));
  };

  // Order created handler
  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setShowCartModal(false);
    setActiveCustomerTab('orders');
    // Persist to backend (fire-and-forget)
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder }),
    }).catch(() => { /* silent: order already persisted in-memory */ });
    logAuditEvent(
      'ORDER_CREATED_PAYMENT_CAPTURED',
      'Order',
      newOrder.id,
      `Order ${newOrder.orderNumber} booked. Total: ₹${newOrder.totalPayable.toFixed(2)} with ${newOrder.partner.name}. Payment: ${newOrder.paymentMethod}`,
      user.name,
      'Customer'
    );
    showToast(`Order ${newOrder.orderNumber} placed successfully!`);
  };

  // Prescription uploaded handler
  const handleRxUploaded = (newRx: Prescription) => {
    setPrescriptions((prev) => [newRx, ...prev]);
    logAuditEvent(
      'PRESCRIPTION_UPLOADED_OCR_COMPLETE',
      'Prescription',
      newRx.id,
      `User uploaded ${newRx.fileName}. OCR extracted ${newRx.extractedMedicines.length} medicines. Status: ${newRx.status}`,
      user.name,
      'Customer'
    );
    showToast(`Prescription ${newRx.fileName} uploaded and queued for pharmacist review.`);
  };

  // Pharmacist Actions
  const handleApproveRx = (rxId: string, notes: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === rxId
          ? {
              ...rx,
              status: 'Verified',
              reviewedBy: 'Sneha Patil, Reg #PH-MH-98214',
              reviewedAt: new Date().toISOString(),
              reviewerNotes: notes,
            }
          : rx
      )
    );
    // Persist to backend (fire-and-forget)
    fetch(`/api/prescriptions/${rxId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Verified', notes, reviewedBy: 'Sneha Patil, Reg #PH-MH-98214' }),
    }).catch(() => {});

    // Update any order referencing this Rx
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.prescriptionId === rxId) {
          return {
            ...ord,
            prescriptionStatus: 'Verified',
            fulfillmentStatus: 'Pharmacy Processing',
            timeline: [
              ...ord.timeline,
              {
                status: 'Prescription Verified',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                description: 'Prescription approved by Sneha Patil (Reg #PH-MH-98214). Dispatched to partner chemist.',
              },
            ],
          };
        }
        return ord;
      })
    );

    logAuditEvent(
      'PRESCRIPTION_APPROVED',
      'Prescription',
      rxId,
      `Registered Pharmacist approved prescription. Notes: "${notes}"`,
      'Sneha Patil (Pharmacist)',
      'Pharmacist'
    );

    showToast('Prescription approved. Associated orders updated to Pharmacy Processing.');
  };

  const handleRejectRx = (rxId: string, reason: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === rxId
          ? {
              ...rx,
              status: 'Rejected',
              reviewedBy: 'Sneha Patil, Reg #PH-MH-98214',
              reviewedAt: new Date().toISOString(),
              reviewerNotes: `Rejected: ${reason}`,
            }
          : rx
      )
    );
    // Persist to backend (fire-and-forget)
    fetch(`/api/prescriptions/${rxId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected', notes: `Rejected: ${reason}`, reviewedBy: 'Sneha Patil, Reg #PH-MH-98214' }),
    }).catch(() => {});

    logAuditEvent(
      'PRESCRIPTION_REJECTED',
      'Prescription',
      rxId,
      `Rejected with reason: ${reason}`,
      'Sneha Patil (Pharmacist)',
      'Pharmacist'
    );

    showToast(`Prescription rejected: ${reason}`);
  };

  const handleRequestClarification = (rxId: string, question: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === rxId
          ? {
              ...rx,
              status: 'Clarification Requested',
              reviewerNotes: `Clarification requested: ${question}`,
            }
          : rx
      )
    );
    // Persist to backend (fire-and-forget)
    fetch(`/api/prescriptions/${rxId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Clarification Requested', notes: `Clarification requested: ${question}`, reviewedBy: 'Sneha Patil, Reg #PH-MH-98214' }),
    }).catch(() => {});

    logAuditEvent(
      'PRESCRIPTION_CLARIFICATION_REQUESTED',
      'Prescription',
      rxId,
      `Clarification asked: ${question}`,
      'Sneha Patil (Pharmacist)',
      'Pharmacist'
    );

    showToast('Clarification request sent to prescribing doctor and customer.');
  };

  // Partner Stock & Price updates
  const handleUpdateOfferStock = (offerId: string, newStock: number, state: 'In Stock' | 'Low Stock' | 'Out of Stock') => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              stockCount: newStock,
              stockState: state,
              freshnessTimestamp: 'Just now (Partner Feed)',
            }
          : o
      )
    );
    // Persist to backend (fire-and-forget)
    fetch(`/api/offers/${offerId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockState: state, stockCount: newStock }),
    }).catch(() => { /* silent: stock already updated in-memory */ });

    logAuditEvent(
      'PARTNER_STOCK_UPDATED',
      'Offer',
      offerId,
      `Updated stock to ${newStock} units (${state})`,
      selectedPartner.name,
      'Partner Chemist'
    );

    showToast(`Stock updated to ${newStock} units.`);
  };

  const handleUpdateOfferPrice = (offerId: string, newBasePrice: number) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          const total = newBasePrice + o.deliveryFee + o.packagingFee;
          return {
            ...o,
            basePrice: newBasePrice,
            totalPayableCost: total,
            freshnessTimestamp: 'Just now (Price Engine Sync)',
          };
        }
        return o;
      })
    );

    logAuditEvent(
      'PARTNER_PRICE_MODIFIED',
      'Offer',
      offerId,
      `Base price adjusted to ₹${newBasePrice.toFixed(2)}. Total delivered recalculation triggered.`,
      selectedPartner.name,
      'Partner Chemist'
    );

    showToast(`Price updated to ₹${newBasePrice.toFixed(2)}.`);
  };

  const handlePackOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            fulfillmentStatus: 'Dispatched',
            timeline: [
              ...ord.timeline,
              {
                status: 'Packed & Dispatched',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                description: `Tamper-evident bag sealed by ${selectedPartner.name}. Handed to logistics rider.`,
              },
            ],
          };
        }
        return ord;
      })
    );

    logAuditEvent(
      'ORDER_DISPATCHED_BY_PARTNER',
      'Order',
      orderId,
      `Order packed and marked dispatched by ${selectedPartner.name}`,
      selectedPartner.name,
      'Partner Chemist'
    );

    showToast('Order marked as Packed and Dispatched.');
  };

  // Logistics advancement simulation
  const handleAdvanceOrderStatus = (orderId: string) => {
    const stageOrder: Order['fulfillmentStatus'][] = [
      'Order Placed',
      'Rx Verification',
      'Pharmacy Processing',
      'Dispatched',
      'Out for Delivery',
      'Delivered',
    ];

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const currentIdx = stageOrder.indexOf(ord.fulfillmentStatus);
          const nextIdx = Math.min(stageOrder.length - 1, currentIdx + 1);
          const nextStatus = stageOrder[nextIdx];

          const newTimelineItem = {
            status: nextStatus,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description:
              nextStatus === 'Out for Delivery'
                ? 'Delivery executive Rahul Verma is on the way (OTP verification enabled).'
                : nextStatus === 'Delivered'
                ? 'Order successfully delivered to customer doorstep.'
                : `Status updated to ${nextStatus}`,
          };

          return {
            ...ord,
            fulfillmentStatus: nextStatus,
            timeline: [...ord.timeline, newTimelineItem],
          };
        }
        return ord;
      })
    );

    showToast('Logistics stage progressed to next milestone.');
  };

  // Refill Reminder Operations
  const handleToggleReminder = (remId: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === remId ? { ...r, isActive: !r.isActive } : r))
    );
    showToast('Refill reminder schedule updated.');
  };

  const handle1ClickReorder = (reminder: RefillReminder) => {
    const med = medicines.find((m) => m.id === reminder.medicineId);
    if (!med) return;
    const medOffers = getOffersForMedicine(med.id);
    const lowest = medOffers[0];
    if (lowest) {
      handleAddToCart(med, lowest);
      setShowCartModal(true);
    }
  };

  const handleAddRefillFromOrder = (order: Order) => {
    if (order.items.length === 0) return;
    const primaryItem = order.items[0];
    const newRem: RefillReminder = {
      id: `ref-${Date.now().toString().slice(-4)}`,
      medicineId: primaryItem.medicine.id,
      medicineName: primaryItem.medicine.name,
      dosage: primaryItem.medicine.dosageInstructions || 'As prescribed',
      frequencyDays: 30,
      lastOrderedDate: new Date().toISOString().slice(0, 10),
      nextRefillDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      isActive: true,
      packSize: primaryItem.medicine.packSize,
    };
    setReminders((prev) => [newRem, ...prev]);
    showToast(`Refill reminder activated for ${primaryItem.medicine.name}!`);
    setActiveCustomerTab('savings');
  };

  return (
    <div id="app-root" className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg border border-neutral-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        activeCustomerTab={activeCustomerTab}
        onSelectCustomerTab={setActiveCustomerTab}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setShowCartModal(true)}
        selectedPincode={selectedPincode}
        onChangePincode={() => setShowPincodeModal(true)}
        pendingRxCount={prescriptions.filter((p) => p.status === 'Pending Review').length}
        onOpenSupport={() => setShowSupportModal(true)}
        onOpenPrdSpecs={() => setShowPrdModal(true)}
        user={user}
        isAuthenticated={isAuthenticated}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Role-Based Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ======================= ROLE 1: CUSTOMER VIEW ======================= */}
        {currentRole === 'customer' && (
          <div>
            {/* Customer Sub-tab 1: Discover & Compare */}
            {activeCustomerTab === 'discover' && (
              <div className="space-y-6">
                {/* Hero / Value Proposition Banner (PRD Section 3.6 & 9.3) */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                  <div className="relative z-10 max-w-3xl space-y-3">
                    <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t.heroBadge}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {t.heroHeadline}
                    </h1>

                    <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                      {t.heroSavings} {t.heroSubtext}
                    </p>

                    {/* Quick Prescription Upload CTA Button */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        id="btn-hero-upload-rx"
                        onClick={() => setShowRxUploadModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                      >
                        <FileUp className="w-4 h-4 text-emerald-700" />
                        <span>{t.heroUploadRx}</span>
                      </button>

                      <button
                        onClick={() => setShowPrdModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-700/50 hover:bg-emerald-700/80 text-white border border-emerald-500/40 text-xs font-medium flex items-center gap-1.5 transition-all"
                      >
                        <span>{t.heroPricingLink}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search & Active Molecule Autocomplete Bar */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3">
                  <div className="relative flex items-center">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-3.5" />
                    <input
                      id="input-medicine-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full pl-11 pr-24 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none transition-colors"
                    />

                    <div className="absolute right-3 flex items-center gap-1.5">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSearchQuery('Dolo 650')}
                        className="px-2 py-1 rounded bg-neutral-200/70 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium hidden sm:inline"
                        title="Try sample search"
                      >
                        Try 'Dolo'
                      </button>
                    </div>
                  </div>

                  {/* Controlled Generic Substitution Banner when Brand searched (FR-DISC-02 & PRD Section 3.6) */}
                  {searchQuery.trim().length > 0 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          <strong>{t.searchBioEquivLabel}</strong> {t.searchBioEquivEngineLabel} <em>"{searchQuery}"</em> {t.searchBioEquivSuffix}
                        </span>
                      </div>
                      <span className="font-semibold text-emerald-800 text-[11px] shrink-0 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {t.searchAverageSaving}
                      </span>
                    </div>
                  )}

                  {/* Categories Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        id={`category-filter-${cat.id}`}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicine Cards Catalog Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                    <span>{t.searchShowing} <strong>{filteredMedicines.length}</strong> {t.searchBioEquivEngineLabel}</span>
                    <span>{t.searchSortedBy}</span>
                  </div>

                  {filteredMedicines.length === 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-500 space-y-2">
                      <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
                      <p className="font-medium text-sm text-neutral-800">No matching generic medicines found.</p>
                      <p className="text-xs text-neutral-500">
                        Try searching for another composition (e.g. Paracetamol, Metformin, Pantoprazole) or clear filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                      >
                        {t.searchResetFilters}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredMedicines.map((medicine) => (
                        <MedicineCard
                          key={medicine.id}
                          medicine={medicine}
                          offers={getOffersForMedicine(medicine.id)}
                          onComparePrices={setComparingMedicine}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Sub-tab 2: Prescriptions & OCR */}
            {activeCustomerTab === 'prescriptions' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                      Prescription Locker & Pharmacist Verification
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Upload doctor prescriptions for Schedule H & H1 drugs. Reviewed by certified pharmacists before dispensing (FR-RX-01 to FR-RX-04).
                    </p>
                  </div>

                  <button
                    id="btn-open-upload-rx-tab"
                    onClick={() => setShowRxUploadModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <FileUp className="w-4 h-4" />
                    <span>Upload New Prescription</span>
                  </button>
                </div>

                {/* Prescriptions List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      id={`rx-card-${rx.id}`}
                      className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-3">
                        <div>
                          <div className="font-bold text-sm text-neutral-900">{rx.fileName}</div>
                          <div className="text-neutral-400 text-[11px] mt-0.5">
                            Uploaded: {new Date(rx.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {rx.fileSize}
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            rx.status === 'Verified'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : rx.status === 'Pending Review'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {rx.status}
                        </span>
                      </div>

                      {/* Doctor info */}
                      <div className="bg-neutral-50 rounded-xl p-3 text-xs space-y-1">
                        <div className="font-bold text-neutral-900">{rx.doctorName}</div>
                        <div className="text-neutral-600">Council Reg: <span className="font-mono">{rx.doctorRegNo}</span></div>
                        <div className="text-neutral-500">{rx.clinicName}</div>
                      </div>

                      {/* Extracted medicines */}
                      <div className="space-y-1.5 text-xs">
                        <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                          Extracted Prescription Items:
                        </div>
                        {rx.extractedMedicines.map((m, i) => (
                          <div key={i} className="flex justify-between p-2 rounded bg-neutral-50 text-[11px]">
                            <span className="font-semibold text-neutral-800">{m.name}</span>
                            <span className="text-neutral-500">{m.dosage} ({m.duration})</span>
                          </div>
                        ))}
                      </div>

                      {/* Verification Audit Note */}
                      <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                        {rx.status === 'Verified' ? (
                          <div className="text-emerald-700 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Signed off by {rx.reviewedBy}</span>
                          </div>
                        ) : (
                          <div className="text-amber-800 font-medium">
                            ⏳ In verification queue. Assigned to licensed duty pharmacist.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Sub-tab 3: Orders & Tracking */}
            {activeCustomerTab === 'orders' && (
              <OrderTrackingView
                orders={orders}
                onAddRefillReminder={handleAddRefillFromOrder}
                onAdvanceOrderStatus={handleAdvanceOrderStatus}
              />
            )}

            {/* Customer Sub-tab 4: Savings & Refills */}
            {activeCustomerTab === 'savings' && (
              <SavingsAndRefillsView
                reminders={reminders}
                orders={orders}
                onToggleReminder={handleToggleReminder}
                on1ClickReorder={handle1ClickReorder}
                onAddManualReminder={() => setShowCartModal(true)}
              />
            )}

            {/* Customer Sub-tab 5: Login & Register Screen */}
            {activeCustomerTab === 'account' && (
              <AuthScreen
                isModal={false}
                defaultTab="login"
                defaultRole={currentRole}
                onAuthSuccess={handleAuthSuccess}
              />
            )}
          </div>
        )}

        {/* ======================= ROLE 2: REGISTERED PHARMACIST PORTAL ======================= */}
        {currentRole === 'pharmacist' && (
          <PharmacistQueueView
            prescriptions={prescriptions}
            onApproveRx={handleApproveRx}
            onRejectRx={handleRejectRx}
            onRequestClarification={handleRequestClarification}
          />
        )}

        {/* ======================= ROLE 3: PHARMACY PARTNER PORTAL ======================= */}
        {currentRole === 'partner' && (
          <PartnerPharmacyView
            partner={selectedPartner}
            allPartners={partners}
            onSelectPartner={setSelectedPartner}
            offers={offers}
            medicines={medicines}
            orders={orders}
            onUpdateOfferStock={handleUpdateOfferStock}
            onUpdateOfferPrice={handleUpdateOfferPrice}
            onPackOrder={handlePackOrder}
          />
        )}

        {/* ======================= ROLE 4: ADMIN & AUDIT COCKPIT ======================= */}
        {currentRole === 'admin' && (
          <AdminAuditView auditLogs={auditLogs} partners={partners} />
        )}

        {/* ======================= ROLE 5: DEDICATED LOGIN & REGISTRATION SCREEN ======================= */}
        {currentRole === 'auth' && (
          <div className="space-y-6 py-4">
            <div className="text-center max-w-lg mx-auto space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                CDSCO & Jan Aushadhi Verified Gateway
              </span>
              <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                Authentication & Portal Access
              </h1>
              <p className="text-xs text-neutral-500">
                Sign in to manage prescriptions and track savings, or register as an authorized retail chemist or verification pharmacist.
              </p>
            </div>

            <AuthScreen
              isModal={false}
              defaultTab={authModalMode}
              defaultRole="customer"
              onAuthSuccess={(u, r) => {
                handleAuthSuccess(u, r);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-neutral-200 text-xs text-neutral-500 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-neutral-900">
              GenericMed Platform • Certified Jan Aushadhi & Retail Chemist Marketplace
            </div>
            <p className="text-[11px] text-neutral-400">
              Operating strictly under Rule 65 of the Drugs and Cosmetics Rules, 1945 & Telemedicine Practice Guidelines, 2020.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => setShowPrdModal(true)} className="hover:text-neutral-900 underline">
              PRD Specifications
            </button>
            <button onClick={() => setShowSupportModal(true)} className="hover:text-neutral-900 underline">
              Pharmacist Helpline
            </button>
            <button onClick={() => setCurrentRole('admin')} className="hover:text-neutral-900 underline">
              Audit Logs
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Price Comparison Modal */}
      {comparingMedicine && (
        <PriceComparisonModal
          medicine={comparingMedicine}
          offers={getOffersForMedicine(comparingMedicine.id)}
          onClose={() => setComparingMedicine(null)}
          onSelectOffer={(med, off) => {
            handleAddToCart(med, off);
            setComparingMedicine(null);
            setShowCartModal(true);
          }}
        />
      )}

      {/* 2. Prescription Upload Modal */}
      {showRxUploadModal && (
        <PrescriptionUploadModal
          onClose={() => setShowRxUploadModal(false)}
          onUploadSuccess={handleRxUploaded}
        />
      )}

      {/* 3. Cart & Checkout Modal */}
      {showCartModal && (
        <CartModal
          cartItems={cartItems}
          user={user}
          prescriptions={prescriptions}
          onClose={() => setShowCartModal(false)}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onOpenUploadRx={() => {
            setShowCartModal(false);
            setShowRxUploadModal(true);
          }}
          onOrderCompleted={handleOrderCompleted}
        />
      )}

      {/* 4. PRD Specifications Modal */}
      {showPrdModal && (
        <PrdComplianceModal onClose={() => setShowPrdModal(false)} />
      )}

      {/* 5. Support Helpline Modal */}
      {showSupportModal && (
        <SupportModal onClose={() => setShowSupportModal(false)} />
      )}

      {/* 6. Change Pincode & Serviceability Modal (Phase 1 National Pilot) */}
      {showPincodeModal && (
        <PincodeServiceabilityModal
          currentPincode={selectedPincode}
          allPartners={partners}
          onClose={() => setShowPincodeModal(false)}
          onSelectPincode={(newPin) => {
            setSelectedPincode(newPin);
            const pinInfo = getPincodeServiceability(newPin);
            logAuditEvent(
              'PINCODE_ZONE_CHANGED',
              'DeliveryZone',
              newPin,
              `Delivery zone updated to ${newPin} (${pinInfo.area}, ${pinInfo.city}). Nearest Hub: ${pinInfo.primaryKendraName}. SLA: ${pinInfo.slaLabel}`,
              user?.name || 'Customer',
              currentRole
            );
            showToast(`Delivery zone set to ${pinInfo.city} - ${newPin} (${pinInfo.slaLabel})`);
          }}
        />
      )}

      {/* 7. Dedicated Authentication Modal (Login & Register) */}
      {showAuthModal && (
        <AuthScreen
          isOpen={true}
          isModal={true}
          defaultTab={authModalMode}
          defaultRole={currentRole}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
