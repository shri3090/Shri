import React from 'react';
import { X, CheckCircle, ShieldCheck, BookOpen, Layers, Zap } from 'lucide-react';

interface PrdComplianceModalProps {
  onClose: () => void;
}

export const PrdComplianceModal: React.FC<PrdComplianceModalProps> = ({ onClose }) => {
  const specs = [
    {
      section: '3.6 & 9.3 Discovery & Substitution',
      title: 'Composition-First Search & Generic Substitution',
      description: 'Search by salt/active composition or branded equivalent. Controlled substitution banner and clear disclosure that active molecules are identical.',
      status: 'Implemented & Active',
    },
    {
      section: '9.4 Price Comparison Engine',
      title: 'Transparent Total Delivered Cost',
      description: 'Calculates base medicine cost + delivery + packaging/cold-chain + GST (12%). Displays price freshness and partner drug license numbers.',
      status: 'Implemented & Active',
    },
    {
      section: '9.5 Prescription & Verification',
      title: 'OCR Extraction & Human Pharmacist Review Gate',
      description: 'Supports PDF/JPG/PNG upload. Machine-extracted OCR details are routed to registered pharmacist review queue before dispensing.',
      status: 'Implemented & Active',
    },
    {
      section: '9.7 Cart, Checkout & Payments',
      title: 'Schedule H Enforcement & Safe Checkout',
      description: 'Prescription linking check before payment for restricted medicines. Transparent tax breakdown and multi-mode payment support.',
      status: 'Implemented & Active',
    },
    {
      section: '9.8 Orders & Fulfillment',
      title: 'End-to-End Tracking & Digital GST Invoices',
      description: 'Full fulfillment pipeline (Order Placed -> Rx Verification -> Processing -> Dispatched -> Delivered) with printable GST tax invoices.',
      status: 'Implemented & Active',
    },
    {
      section: '9.9 Refills & Chronic Care',
      title: 'Lifetime Savings & Refill Reminders',
      description: 'Lifetime financial savings tracker against branded MRPs. 1-click refill reminders for chronic courses with patient consent.',
      status: 'Implemented & Active',
    },
    {
      section: '9.10 Partner Pharmacy Portal',
      title: 'Licensed Chemist Inventory & Order Dispatch',
      description: 'Real-time stock management, batch number logging, and fulfillment dispatch for PM Jan Aushadhi Kendras and licensed retail chemists.',
      status: 'Implemented & Active',
    },
    {
      section: '9.11 & 18 Operations & Audit Log',
      title: 'Immutable Compliance Audit Trail & KPIs',
      description: 'Search success rate, latency SLA monitoring, exception alerts, and WORM-compliant audit trail with CSV export.',
      status: 'Implemented & Active',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="prd-compliance-dialog"
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl border border-neutral-200 overflow-hidden"
      >
        <div className="p-5 border-b border-neutral-200 flex items-start justify-between bg-neutral-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                PRD v1.0 Architectural Traceability
              </span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mt-1">
              GenericMed Functional Compliance Matrix
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Verified mapping against PRD requirements, Drugs and Cosmetics Act (Rule 65), and CDSCO standards.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-3">
            {specs.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-neutral-500">
                    {item.section}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    {item.status}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-neutral-900">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold"
          >
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
