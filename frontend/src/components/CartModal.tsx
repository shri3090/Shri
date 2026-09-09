import React, { useState } from 'react';
import { CartItem, Prescription, Order, Address, UserProfile } from '../types';
import { X, Trash2, ShieldCheck, CreditCard, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

interface CartModalProps {
  cartItems: CartItem[];
  user: UserProfile;
  prescriptions: Prescription[];
  onClose: () => void;
  onUpdateQuantity: (offerId: string, delta: number) => void;
  onRemoveItem: (offerId: string) => void;
  onOpenUploadRx: () => void;
  onOrderCompleted: (newOrder: Order) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  cartItems,
  user,
  prescriptions,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOpenUploadRx,
  onOrderCompleted,
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(user.addresses[0]?.id || 'addr-1');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'Credit/Debit Card' | 'NetBanking' | 'Cash on Delivery'>('UPI');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>(
    prescriptions.find((p) => p.status === 'Verified')?.id || prescriptions[0]?.id || ''
  );
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);

  // Cost calculations
  const itemsTotal = cartItems.reduce((acc, item) => acc + item.offer.basePrice * item.quantity, 0);
  const brandedEquivalentTotal = cartItems.reduce((acc, item) => acc + item.medicine.brandedMrp * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 15.00 : 0;
  const packagingFee = cartItems.length > 0 ? 4.00 : 0;
  const estimatedGst = (itemsTotal * 0.12);
  const totalPayable = itemsTotal + deliveryFee + packagingFee + estimatedGst;
  const totalSavings = Math.max(0, (brandedEquivalentTotal + 30) - totalPayable);

  // Check if prescription is required
  const requiresRx = cartItems.some((item) => item.medicine.requiresPrescription);
  const selectedRx = prescriptions.find((p) => p.id === selectedPrescriptionId);
  const isRxSatisfied = !requiresRx || (selectedRx !== undefined && selectedRx.status === 'Verified');

  const selectedAddress = user.addresses.find((a) => a.id === selectedAddressId) || user.addresses[0];

  const handlePlaceOrder = () => {
    setIsCheckingOut(true);

    setTimeout(() => {
      const orderNum = `GM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const invNum = `INV-GM-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const newOrder: Order = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        orderNumber: orderNum,
        userId: user.id,
        customerName: user.name,
        createdAt: new Date().toISOString(),
        items: [...cartItems],
        totalItemAmount: itemsTotal,
        totalDeliveryFee: deliveryFee,
        totalPackagingFee: packagingFee,
        totalGst: estimatedGst,
        totalPayable: totalPayable,
        totalSavings: totalSavings,
        deliveryAddress: selectedAddress,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'Paid',
        fulfillmentStatus: requiresRx && selectedRx?.status !== 'Verified' ? 'Rx Verification' : 'Pharmacy Processing',
        partner: cartItems[0]?.offer.partner,
        prescriptionId: requiresRx ? selectedPrescriptionId : undefined,
        prescriptionStatus: requiresRx ? (selectedRx?.status === 'Verified' ? 'Verified' : 'Pending') : 'Not Required',
        invoiceNumber: invNum,
        trackingNumber: `EXP-AWB-${Math.floor(10000000 + Math.random() * 90000000)}`,
        timeline: [
          {
            status: 'Order Placed',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: `Order successfully booked with ${cartItems[0]?.offer.partner.name}. Payment verified via ${selectedPaymentMethod}.`,
          },
          {
            status: requiresRx ? 'Rx Verification' : 'Pharmacy Processing',
            timestamp: 'In Progress',
            description: requiresRx
              ? 'Assigned to licensed pharmacist for clinical review.'
              : 'Licensed pharmacy is preparing verified batch stock.',
          },
        ],
      };

      setIsCheckingOut(false);
      setCheckoutSuccess(true);
      onOrderCompleted(newOrder);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="cart-checkout-dialog"
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-xl border border-neutral-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Your Medicine Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h2>
            <p className="text-xs text-neutral-500">
              Verified total-cost pricing with licensed pharmacy fulfillment
            </p>
          </div>

          <button
            id="btn-close-cart"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                🛒
              </div>
              <p className="text-sm font-medium">Your cart is empty.</p>
              <p className="text-xs text-neutral-400">
                Search and compare generic medicines to add them to your cart.
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.offer.id}
                    className="p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between gap-4 bg-white"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">
                          {item.medicine.name}
                        </span>
                        {item.medicine.requiresPrescription && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                            Rx Required
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {item.medicine.composition} • {item.medicine.strength} ({item.medicine.packSize})
                      </div>
                      <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Fulfiller: {item.offer.partner.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden text-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.offer.id, -1)}
                          className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-semibold text-neutral-900 bg-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.offer.id, 1)}
                          className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-sm text-neutral-900">
                          ₹{(item.offer.basePrice * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-neutral-400 line-through">
                          ₹{(item.medicine.brandedMrp * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.offer.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prescription Validation Gate (PRD Section 9.5 & 9.7) */}
              {requiresRx && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="text-xs font-bold text-amber-900">
                        Prescription Required for Schedule H Medicines
                      </span>
                    </div>
                    <button
                      onClick={onOpenUploadRx}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
                    >
                      + Upload New Rx
                    </button>
                  </div>

                  {prescriptions.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-amber-800">
                        Select a prescription to link with this order:
                      </div>
                      <select
                        id="select-cart-prescription"
                        value={selectedPrescriptionId}
                        onChange={(e) => setSelectedPrescriptionId(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs text-neutral-900 font-medium"
                      >
                        {prescriptions.map((rx) => (
                          <option key={rx.id} value={rx.id}>
                            {rx.fileName} ({rx.doctorName}) — [{rx.status}]
                          </option>
                        ))}
                      </select>
                      {selectedRx && (
                        <div className="text-[11px] text-neutral-600 flex items-center gap-1.5 mt-1">
                          <FileText className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Status: <strong>{selectedRx.status}</strong> • {selectedRx.reviewerNotes}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-800">
                      No prescription found. Please upload a doctor prescription to proceed.
                      <div className="mt-2">
                        <button
                          onClick={onOpenUploadRx}
                          className="px-3 py-1.5 bg-amber-700 text-white rounded-lg text-xs font-semibold hover:bg-amber-800"
                        >
                          Upload Prescription Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Address */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Delivery Address (Mumbai)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                        selectedAddressId === addr.id
                          ? 'border-emerald-600 bg-emerald-50/40'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-neutral-900 flex items-center justify-between">
                        <span>{addr.label}</span>
                        {selectedAddressId === addr.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <div className="text-neutral-600 mt-1">{addr.street}</div>
                      <div className="text-neutral-500 mt-0.5 font-mono">{addr.city} - {addr.pincode}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Payment Method (FR-PAY-03)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'UPI', label: 'UPI (GPay/PhonePe)', icon: '⚡' },
                    { id: 'Credit/Debit Card', label: 'Cards', icon: '💳' },
                    { id: 'NetBanking', label: 'NetBanking', icon: '🏦' },
                    { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: '💵' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(pm.id as any)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                        selectedPaymentMethod === pm.id
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                      }`}
                    >
                      <div className="text-base mb-0.5">{pm.icon}</div>
                      <div className="truncate">{pm.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown Bill (FR-PAY-02) */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="font-bold text-neutral-900 border-b border-neutral-200 pb-2">
                  Itemized Total Cost Breakdown
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Medicine Base Total:</span>
                  <span className="font-mono">₹{itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Temperature-Controlled Packaging & Bag:</span>
                  <span className="font-mono">₹{packagingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Local Chemist Delivery Fee:</span>
                  <span className="font-mono">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>GST (12% applicable on pharmaceuticals):</span>
                  <span className="font-mono">₹{estimatedGst.toFixed(2)}</span>
                </div>

                <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-sm text-neutral-900">
                  <span>Total Payable:</span>
                  <span className="text-emerald-700 text-base">₹{totalPayable.toFixed(2)}</span>
                </div>

                {totalSavings > 0 && (
                  <div className="p-2 rounded bg-emerald-100/70 border border-emerald-200 text-emerald-900 font-semibold flex items-center justify-between text-xs mt-1">
                    <span>Your Total Savings vs Branded MRP:</span>
                    <span>₹{totalSavings.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-neutral-500">Total Payable</div>
              <div className="text-lg font-black text-neutral-900">
                ₹{totalPayable.toFixed(2)}
              </div>
            </div>

            <button
              id="btn-place-order"
              disabled={isCheckingOut || !isRxSatisfied}
              onClick={handlePlaceOrder}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs ${
                isCheckingOut || !isRxSatisfied
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              }`}
            >
              {isCheckingOut ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Validating & Processing...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Pay ₹{totalPayable.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
