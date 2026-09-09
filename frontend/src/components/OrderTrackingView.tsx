import React, { useState } from 'react';
import { Order, RefillReminder } from '../types';
import { Package, Clock, ShieldCheck, CheckCircle2, FileText, BellPlus, Truck, MapPin, ChevronRight, ArrowUpRight } from 'lucide-react';
import { DigitalInvoiceModal } from './DigitalInvoiceModal';

interface OrderTrackingViewProps {
  orders: Order[];
  onAddRefillReminder: (order: Order) => void;
  onAdvanceOrderStatus: (orderId: string) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  onAddRefillReminder,
  onAdvanceOrderStatus,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const activeOrder = selectedOrder || orders[0];

  const getStatusColor = (status: Order['fulfillmentStatus']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Out for Delivery':
      case 'Dispatched':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Rx Verification':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Pharmacy Processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  const stages = [
    'Order Placed',
    'Rx Verification',
    'Pharmacy Processing',
    'Dispatched',
    'Out for Delivery',
    'Delivered',
  ];

  const getCurrentStageIndex = (status: Order['fulfillmentStatus']) => {
    const idx = stages.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Order Tracking & Digital Invoices
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time fulfillment tracking from licensed pharmacy partner to your doorstep (FR-ORD-01 & FR-ORD-02)
          </p>
        </div>

        {activeOrder && activeOrder.fulfillmentStatus !== 'Delivered' && (
          <button
            id="btn-advance-order-status"
            onClick={() => onAdvanceOrderStatus(activeOrder.id)}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Simulate logistics update to next stage in delivery lifecycle"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Simulate Next Logistics Step</span>
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-neutral-500 space-y-3">
          <Package className="w-10 h-10 text-neutral-300 mx-auto" />
          <p className="text-sm font-medium">No orders found.</p>
          <p className="text-xs text-neutral-400">Your placed orders and digital invoices will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">
              Your Orders ({orders.length})
            </div>

            {orders.map((ord) => {
              const isSelected = activeOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  id={`order-card-${ord.id}`}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-neutral-900 font-mono">
                      {ord.orderNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(ord.fulfillmentStatus)}`}>
                      {ord.fulfillmentStatus}
                    </span>
                  </div>

                  <div className="text-neutral-600 font-medium">
                    {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'} • ₹{ord.totalPayable.toFixed(2)}
                  </div>

                  <div className="text-neutral-400 text-[11px] mt-1 flex items-center justify-between">
                    <span>{ord.partner.name}</span>
                    <span>{new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Order Detail & Lifecycle Tracking */}
          {activeOrder && (
            <div className="lg:col-span-2 space-y-5">
              {/* Order Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
                {/* Header Summary */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-neutral-900">
                        {activeOrder.orderNumber}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(activeOrder.fulfillmentStatus)}`}>
                        {activeOrder.fulfillmentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 mt-1">
                      Dispensed by: <strong className="text-neutral-800">{activeOrder.partner.name}</strong> • DL: {activeOrder.partner.licenseNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="btn-view-invoice"
                      onClick={() => setInvoiceOrder(activeOrder)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Digital GST Invoice</span>
                    </button>

                    <button
                      id="btn-setup-refill"
                      onClick={() => onAddRefillReminder(activeOrder)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Setup automated recurring refill schedule for chronic medications"
                    >
                      <BellPlus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Set Refill Reminder</span>
                    </button>
                  </div>
                </div>

                {/* Visual Progress Stepper (FR-ORD-01) */}
                <div>
                  <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-4">
                    Live Fulfillment Pipeline
                  </div>

                  <div className="relative">
                    {/* Stepper bar */}
                    <div className="hidden sm:grid grid-cols-6 gap-2 text-center text-xs">
                      {stages.map((stage, idx) => {
                        const currentIdx = getCurrentStageIndex(activeOrder.fulfillmentStatus);
                        const isPast = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={stage} className="flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                                isPast
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                              }`}
                            >
                              {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-[11px] font-medium leading-tight ${isCurrent ? 'text-emerald-700 font-bold' : isPast ? 'text-neutral-800' : 'text-neutral-400'}`}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Detailed Timeline Events */}
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 space-y-3">
                  <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Logistics & Compliance Trail
                  </div>

                  <div className="space-y-3">
                    {activeOrder.timeline.map((evt, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-neutral-900 flex items-center gap-2">
                            <span>{evt.status}</span>
                            <span className="text-[10px] font-normal text-neutral-500 font-mono">
                              ({evt.timestamp})
                            </span>
                          </div>
                          <div className="text-neutral-600 text-[11px]">{evt.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeOrder.trackingNumber && (
                    <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600 font-mono">
                      <span>Tracking ID: <strong>{activeOrder.trackingNumber}</strong></span>
                      <span className="text-emerald-700 font-sans font-medium flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        Express Local Courier
                      </span>
                    </div>
                  )}
                </div>

                {/* Items in this Order */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Purchased Medicines ({activeOrder.items.length})
                  </div>

                  <div className="space-y-2">
                    {activeOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-neutral-900">{item.medicine.name}</div>
                          <div className="text-neutral-500 text-[11px]">
                            {item.medicine.composition} • {item.medicine.strength} ({item.medicine.packSize})
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            Batch: {item.offer.batchNumber} • Exp: {item.offer.expiryDate}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-neutral-900 font-mono">
                            Qty {item.quantity} × ₹{item.offer.basePrice.toFixed(2)}
                          </div>
                          <div className="text-[11px] text-emerald-700 font-semibold">
                            Saved ₹{(item.medicine.brandedMrp * item.quantity - item.offer.basePrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-neutral-600">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-neutral-900">{activeOrder.paymentMethod} (Status: {activeOrder.paymentStatus})</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery Address:</span>
                    <span className="font-medium text-neutral-800">{activeOrder.deliveryAddress.street}, Mumbai - {activeOrder.deliveryAddress.pincode}</span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-900 border-t border-neutral-200 pt-1.5">
                    <span>Total Amount Paid:</span>
                    <span className="text-sm font-mono text-emerald-700">₹{activeOrder.totalPayable.toFixed(2)}</span>
                  </div>
                  <div className="text-right text-[11px] text-emerald-700 font-semibold">
                    Net Verified Savings on this Order: ₹{activeOrder.totalSavings.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <DigitalInvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
