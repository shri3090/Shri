import React, { useState } from 'react';
import { X, Phone, MessageSquare, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';

interface SupportModalProps {
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
  const [subject, setSubject] = useState('Dosage or Generic Substitution Query');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="support-dialog"
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl border border-neutral-200 overflow-hidden"
      >
        <div className="p-5 border-b border-neutral-200 flex items-start justify-between bg-neutral-50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Pharmacist Helpline & Support
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              24x7 clinical assistance by certified pharmacists and customer care
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Direct helpline phone */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Dedicated Licensed Pharmacist Helpline</span>
            </div>
            <p className="text-emerald-800">
              Speak directly with a registered pharmacist for molecule bio-equivalence, chronic dosages, or contraindication checks.
            </p>
            <div className="font-mono font-bold text-base text-emerald-950 mt-1">
              📞 1800-425-GENMED (Toll Free) • +91 22 4910 8800
            </div>
            <div className="text-[10px] text-emerald-700">
              Operating Hours: Mon - Sun (08:00 AM to 11:00 PM IST)
            </div>
          </div>

          {submitted ? (
            <div className="p-6 text-center space-y-2 bg-neutral-50 rounded-xl border border-neutral-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-neutral-900">Ticket Dispatched</h3>
              <p className="text-xs text-neutral-600">
                A duty pharmacist has been assigned to your query. You will receive an SMS callback within 10 minutes.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 text-xs text-emerald-700 underline font-semibold"
              >
                Submit another query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-neutral-800">Inquiry Category:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-neutral-300 text-xs text-neutral-900"
                >
                  <option value="Dosage or Generic Substitution Query">Dosage or Generic Substitution Query</option>
                  <option value="Prescription Verification Delay">Prescription Verification Delay</option>
                  <option value="Price Discrepancy or Feed Report">Price Discrepancy or Feed Report</option>
                  <option value="Order Tracking or Delivery Status">Order Tracking or Delivery Status</option>
                  <option value="Pharmacy Partner Grievance">Pharmacy Partner Grievance</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-800">Your Message / Query:</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your medicine question or order concern..."
                  className="w-full mt-1 p-2.5 rounded-lg border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Query to Pharmacist</span>
              </button>
            </form>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>All medical guidance provided strictly by licensed pharmacists registered with the State Pharmacy Council.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
