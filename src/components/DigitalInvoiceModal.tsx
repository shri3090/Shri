import React from 'react';
import { Order } from '../types';
import { X, Printer, ShieldCheck, Download } from 'lucide-react';

interface DigitalInvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const DigitalInvoiceModal: React.FC<DigitalInvoiceModalProps> = ({
  order,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="digital-invoice-dialog"
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-xl border border-neutral-200 overflow-hidden"
      >
        {/* Modal Top Actions */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-800">
              Tax Invoice & Compliance Receipt (FR-ORD-04)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-800 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-neutral-200 pb-4">
            <div>
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">
                TAX INVOICE
              </h1>
              <div className="text-xs text-neutral-500 font-mono mt-1">
                Invoice No: <strong className="text-neutral-900">{order.invoiceNumber}</strong>
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-xs text-neutral-500 font-mono">
                Order ID: {order.orderNumber}
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-sm text-neutral-900">
                GenericMed Technologies India
              </div>
              <div className="text-neutral-500 text-[11px]">
                CIN: U74999MH2026PTC334102
              </div>
              <div className="text-neutral-500 text-[11px]">
                GSTIN: 27AABCG9912D1Z0
              </div>
              <div className="text-neutral-500 text-[11px]">
                Mumbai, Maharashtra - 400001
              </div>
            </div>
          </div>

          {/* Seller / Fulfilling Licensed Pharmacy Details */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Dispensed by Licensed Chemist:
              </div>
              <div className="font-bold text-neutral-900">{order.partner.name}</div>
              <div className="text-neutral-600">Drug License: <span className="font-mono">{order.partner.licenseNumber}</span></div>
              <div className="text-neutral-600">GSTIN: <span className="font-mono">{order.partner.gstin}</span></div>
              <div className="text-neutral-600">{order.partner.city} - {order.partner.pincode}</div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Customer & Delivery Address:
              </div>
              <div className="font-bold text-neutral-900">{order.deliveryAddress.label}</div>
              <div className="text-neutral-600">{order.deliveryAddress.street}</div>
              <div className="text-neutral-600">{order.deliveryAddress.city} - {order.deliveryAddress.pincode}</div>
              <div className="text-neutral-600 mt-1">Payment: <strong className="text-emerald-700">{order.paymentMethod} (Paid)</strong></div>
            </div>
          </div>

          {/* Items Table with HSN & Batch numbers */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100/70 border-b border-neutral-200 text-[11px] font-semibold text-neutral-700">
                  <th className="p-2.5">Item & Composition</th>
                  <th className="p-2.5">Batch / Exp</th>
                  <th className="p-2.5">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right">Taxable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-xs">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5">
                      <div className="font-bold text-neutral-900">{item.medicine.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        HSN 3004 • {item.medicine.composition} ({item.medicine.strength})
                      </div>
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-neutral-600">
                      {item.offer.batchNumber} <br />
                      <span className="text-neutral-400">Exp: {item.offer.expiryDate}</span>
                    </td>
                    <td className="p-2.5 font-medium text-neutral-900">
                      {item.quantity}
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      ₹{item.offer.basePrice.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right font-mono font-semibold text-neutral-900">
                      ₹{(item.offer.basePrice * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Summary & Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal (Medicines):</span>
                <span className="font-mono">₹{order.totalItemAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Charges:</span>
                <span className="font-mono">₹{order.totalDeliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Packaging & Handling:</span>
                <span className="font-mono">₹{order.totalPackagingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>CGST (6%):</span>
                <span className="font-mono">₹{(order.totalGst / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>SGST (6%):</span>
                <span className="font-mono">₹{(order.totalGst / 2).toFixed(2)}</span>
              </div>
              <div className="border-t border-neutral-300 pt-1.5 flex justify-between font-bold text-sm text-neutral-900">
                <span>Net Total Settled:</span>
                <span className="text-emerald-700 font-mono">₹{order.totalPayable.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-center text-xs mt-2">
                Total Saved vs Branded MRP: ₹{order.totalSavings.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Regulatory Certification Footer */}
          <div className="border-t border-neutral-200 pt-4 text-[11px] text-neutral-500 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-neutral-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Registered Pharmacist & Licensed Dispensation Compliance</span>
            </div>
            <p>
              This digital invoice is computer-generated and confirms dispensing from an authorized licensed retail pharmacy under Rule 65 of the Drugs and Cosmetics Act, 1940.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
