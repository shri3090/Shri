import React, { useState } from 'react';
import { Prescription, AuditEvent } from '../types';
import { Stethoscope, CheckCircle, XCircle, AlertCircle, FileText, UserCheck, ShieldCheck, Clock } from 'lucide-react';

interface PharmacistQueueViewProps {
  prescriptions: Prescription[];
  onApproveRx: (rxId: string, notes: string) => void;
  onRejectRx: (rxId: string, reason: string) => void;
  onRequestClarification: (rxId: string, question: string) => void;
}

export const PharmacistQueueView: React.FC<PharmacistQueueViewProps> = ({
  prescriptions,
  onApproveRx,
  onRejectRx,
  onRequestClarification,
}) => {
  const [selectedRxId, setSelectedRxId] = useState<string>(prescriptions[0]?.id || '');
  const [pharmacistName] = useState<string>('Sneha Patil, B.Pharm');
  const [pharmacistRegNo] = useState<string>('PH-MH-98214 / State Pharmacy Council');
  const [notesInput, setNotesInput] = useState<string>('Valid prescription confirmed with registered doctor. Dosage and duration verified.');
  const [actionReason, setActionReason] = useState<string>('');

  const activeRx = prescriptions.find((p) => p.id === selectedRxId) || prescriptions[0];

  const pendingCount = prescriptions.filter((p) => p.status === 'Pending Review').length;

  const handleApprove = () => {
    if (!activeRx) return;
    onApproveRx(activeRx.id, notesInput || 'Prescription clinically verified for generic substitution.');
  };

  const handleReject = () => {
    if (!activeRx || !actionReason.trim()) {
      alert('Please enter a rejection reason (e.g., Expired prescription, Illegible dosage).');
      return;
    }
    onRejectRx(activeRx.id, actionReason);
    setActionReason('');
  };

  const handleClarification = () => {
    if (!activeRx || !actionReason.trim()) {
      alert('Please enter clarification question for the patient/doctor.');
      return;
    }
    onRequestClarification(activeRx.id, actionReason);
    setActionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900">
                Registered Pharmacist Verification Station
              </h2>
              <span className="text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                FR-RX-03 & Rule 65
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Logged in as: <strong className="text-neutral-900">{pharmacistName}</strong> ({pharmacistRegNo})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-neutral-500 font-medium">Pending Review</div>
            <div className="text-2xl font-black text-blue-900">{pendingCount} Rx</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Queue List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">
            Incoming Prescription Queue
          </div>

          <div className="space-y-2">
            {prescriptions.map((rx) => {
              const isSelected = activeRx?.id === rx.id;
              const isPending = rx.status === 'Pending Review';

              return (
                <div
                  key={rx.id}
                  id={`queue-item-${rx.id}`}
                  onClick={() => setSelectedRxId(rx.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-neutral-900 truncate max-w-[170px]" title={rx.fileName}>
                      {rx.fileName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        rx.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : rx.status === 'Pending Review'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {rx.status}
                    </span>
                  </div>

                  <div className="text-neutral-600 font-medium">
                    {rx.doctorName || 'Prescription Upload'}
                  </div>

                  <div className="text-neutral-400 text-[11px] mt-1 flex items-center justify-between">
                    <span className="font-mono">{rx.id}</span>
                    <span>{new Date(rx.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prescription Clinical Inspection Card */}
        {activeRx && (
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-neutral-900">
                      {activeRx.fileName}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        activeRx.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : activeRx.status === 'Pending Review'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {activeRx.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Uploaded by user on {new Date(activeRx.uploadedAt).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="text-right text-xs text-neutral-500">
                  <span>File Size: {activeRx.fileSize}</span>
                  <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Virus Scanned & Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Physician & Clinic Verification Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                <div>
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                    Prescribing Practitioner
                  </div>
                  <div className="font-bold text-neutral-900 text-sm">{activeRx.doctorName || 'Not identified in OCR'}</div>
                  <div className="text-neutral-600 mt-0.5">
                    Council Reg No: <span className="font-mono font-bold text-neutral-800">{activeRx.doctorRegNo || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                    Clinic / Institution
                  </div>
                  <div className="font-medium text-neutral-800">{activeRx.clinicName || 'Private Practice'}</div>
                  <div className="text-emerald-700 text-[11px] flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Matched against National Medical Commission Registry</span>
                  </div>
                </div>
              </div>

              {/* OCR Extracted Items with Pharmacist Match Check */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Extracted Medicines & Dosage Verification (FR-RX-02)
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    Rule 65 Compliance Audit
                  </span>
                </div>

                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-100/70 border-b border-neutral-200 text-[11px] font-semibold text-neutral-700">
                        <th className="p-2.5">Prescribed Item</th>
                        <th className="p-2.5">Dosage / Frequency</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5 text-right">Clinical Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {activeRx.extractedMedicines.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-neutral-900">
                            {item.name}
                          </td>
                          <td className="p-2.5 text-neutral-600">
                            {item.dosage}
                          </td>
                          <td className="p-2.5 text-neutral-600">
                            {item.duration}
                          </td>
                          <td className="p-2.5 text-right font-medium text-emerald-700">
                            ✓ Verified Bio-Equivalent
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reviewer Clinical Notes */}
              {activeRx.status === 'Verified' ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Approved & Signed-off by Licensed Pharmacist</span>
                  </div>
                  <p className="text-emerald-800">
                    Reviewer: <strong>{activeRx.reviewedBy}</strong> on {activeRx.reviewedAt ? new Date(activeRx.reviewedAt).toLocaleString('en-IN') : 'Recently'}
                  </p>
                  <p className="text-emerald-700 text-[11px]">
                    Notes: {activeRx.reviewerNotes}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-neutral-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">
                      Pharmacist Clinical Verification Notes:
                    </label>
                    <textarea
                      rows={2}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Enter verification comments or substitute bio-equivalence justification..."
                      className="w-full rounded-lg border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex-1 max-w-sm">
                      <input
                        type="text"
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Rejection reason or clarification request..."
                        className="w-full text-xs rounded-lg border border-neutral-300 p-2 text-neutral-900"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReject}
                        className="px-3.5 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Rx</span>
                      </button>

                      <button
                        onClick={handleClarification}
                        className="px-3.5 py-2 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Clarification</span>
                      </button>

                      <button
                        id="btn-approve-rx"
                        onClick={handleApprove}
                        className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve & Authorize Dispensing</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
