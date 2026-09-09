import React, { useState } from 'react';
import { Prescription } from '../types';
import { X, UploadCloud, FileText, CheckCircle, ShieldAlert, Sparkles, Stethoscope, AlertTriangle } from 'lucide-react';

interface PrescriptionUploadModalProps {
  onClose: () => void;
  onUploadSuccess: (prescription: Prescription) => void;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrComplete, setOcrComplete] = useState<boolean>(false);

  // Extracted fields
  const [extractedData, setExtractedData] = useState<{
    doctorName: string;
    doctorRegNo: string;
    clinicName: string;
    medicines: { name: string; dosage: string; duration: string }[];
  }>({
    doctorName: 'Dr. Arvind Mehta, MD (Cardiology)',
    doctorRegNo: 'MCI-1994-08241',
    clinicName: 'Heart & Wellness Clinic, Mumbai',
    medicines: [
      { name: 'Telmisartan 40mg', dosage: '1 tab daily morning', duration: '30 days' },
      { name: 'Metformin 500mg SR', dosage: '1 tab twice daily with meals', duration: '30 days' },
      { name: 'Atorvastatin 10mg', dosage: '1 tab bedtime', duration: '30 days' },
    ],
  });

  const handleSimulateOcr = (presetType: 'cardio' | 'ent' | 'custom', customName?: string) => {
    setIsProcessingOcr(true);
    setOcrProgress(15);
    setOcrComplete(false);

    if (presetType === 'cardio') {
      setFileName('Dr_Mehta_Cardiology_Prescription.pdf');
      setExtractedData({
        doctorName: 'Dr. Arvind Mehta, MD (Cardiology)',
        doctorRegNo: 'MCI-1994-08241',
        clinicName: 'Heart & Wellness Clinic, Worli',
        medicines: [
          { name: 'Telmisartan 40mg', dosage: '1 tab daily morning', duration: '30 days' },
          { name: 'Metformin 500mg SR', dosage: '1 tab twice daily with meals', duration: '30 days' },
          { name: 'Atorvastatin 10mg', dosage: '1 tab bedtime', duration: '30 days' },
        ],
      });
    } else if (presetType === 'ent') {
      setFileName('Dr_Kulkarni_ENT_Lilavati.jpg');
      setExtractedData({
        doctorName: 'Dr. Sunita Kulkarni, MBBS, DNB (ENT)',
        doctorRegNo: 'MMC-2005-44129',
        clinicName: 'Lilavati Hospital & Research Centre',
        medicines: [
          { name: 'Amoxicillin + Clavulanic Acid 625mg', dosage: '1 tab BD after food', duration: '5 days' },
          { name: 'Paracetamol 650mg', dosage: 'SOS fever > 100°F', duration: '3 days' },
        ],
      });
    } else {
      setFileName(customName || 'Uploaded_Prescription.pdf');
    }

    const interval = setInterval(() => {
      setOcrProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setIsProcessingOcr(false);
          setOcrComplete(true);
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      handleSimulateOcr('custom', selected.name);
    }
  };

  const handleConfirmSubmission = () => {
    const newRx: Prescription = {
      id: `rx-${Date.now().toString().slice(-4)}`,
      userId: 'usr-901',
      fileName: fileName || 'Uploaded_Rx.pdf',
      fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
      uploadedAt: new Date().toISOString(),
      status: 'Pending Review',
      doctorName: extractedData.doctorName,
      doctorRegNo: extractedData.doctorRegNo,
      clinicName: extractedData.clinicName,
      extractedMedicines: extractedData.medicines.map((m) => ({
        ...m,
        verified: false,
      })),
      reviewerNotes: 'Queued for human verification by licensed pharmacist. OCR confidence 95.8%.',
    };

    onUploadSuccess(newRx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="prescription-upload-dialog"
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl border border-neutral-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 flex items-start justify-between bg-neutral-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                FR-RX-01 & FR-RX-02 Workflow
              </span>
              <span className="text-xs text-neutral-500">
                Encrypted & HIPAA/DISHA Compliant
              </span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mt-1">
              Upload Doctor's Prescription
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Required for Schedule H & H1 medications. Our AI OCR extracts details instantly for pharmacist review.
            </p>
          </div>

          <button
            id="btn-close-rx-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Demo Preset Selector */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick Test with Sample Prescriptions:
              </span>
              <span className="text-[10px] text-neutral-500">1-Click Demo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSimulateOcr('cardio')}
                className="px-3 py-2 text-left rounded-lg bg-white border border-neutral-200 hover:border-blue-500 hover:bg-blue-50/40 text-xs transition-colors"
              >
                <div className="font-semibold text-neutral-900">Dr. Arvind Mehta (Cardiology)</div>
                <div className="text-[11px] text-neutral-500">Telmisartan, Metformin, Atorvastatin</div>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateOcr('ent')}
                className="px-3 py-2 text-left rounded-lg bg-white border border-neutral-200 hover:border-blue-500 hover:bg-blue-50/40 text-xs transition-colors"
              >
                <div className="font-semibold text-neutral-900">Dr. Sunita Kulkarni (ENT)</div>
                <div className="text-[11px] text-neutral-500">Amoxyclav 625, Paracetamol 650</div>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-neutral-300 hover:border-blue-500 rounded-xl p-6 text-center bg-neutral-50/50 transition-colors">
            <input
              type="file"
              id="prescription-file-input"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="prescription-file-input" className="cursor-pointer block">
              <UploadCloud className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-neutral-800">
                Click to browse or drag & drop prescription
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Supports PDF, JPG, PNG up to 10MB
              </div>
            </label>
          </div>

          {/* OCR Scanning Progress */}
          {isProcessingOcr && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  AI OCR Scanning & Text Extraction in progress...
                </span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="w-full bg-blue-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-blue-700">
                Extracting physician credentials, active molecules, dosage instructions and duration...
              </p>
            </div>
          )}

          {/* OCR Extracted Review Results */}
          {ocrComplete && (
            <div className="border border-neutral-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>OCR Extracted Prescription Details</span>
                </div>
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                  Machine-Extracted (Pending Pharmacist Sign-off)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500">Doctor:</span>
                  <div className="font-semibold text-neutral-900">{extractedData.doctorName}</div>
                </div>
                <div>
                  <span className="text-neutral-500">Registration / Council No:</span>
                  <div className="font-semibold text-neutral-900 font-mono">{extractedData.doctorRegNo}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-neutral-500">Clinic / Hospital:</span>
                  <div className="font-medium text-neutral-800">{extractedData.clinicName}</div>
                </div>
              </div>

              {/* Extracted Medicines Table */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-neutral-700 mb-1.5">
                  Extracted Prescribed Medicines:
                </div>
                <div className="space-y-1.5">
                  {extractedData.medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-neutral-200 text-xs"
                    >
                      <div className="font-medium text-neutral-900">{med.name}</div>
                      <div className="text-neutral-500 text-[11px]">
                        {med.dosage} • {med.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Mandate Callout (FR-RX-02 & FR-RX-04) */}
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Regulatory Notice (FR-RX-02):</strong> Machine-extracted OCR results cannot alone authorize dispensing. This upload will be routed to a licensed pharmacist in our verification queue before your order is dispatched.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-medium hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-submit-prescription"
            disabled={!ocrComplete}
            onClick={handleConfirmSubmission}
            className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
              ocrComplete
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Submit for Pharmacist Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
