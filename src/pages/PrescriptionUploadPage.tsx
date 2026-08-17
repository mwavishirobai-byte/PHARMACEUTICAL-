import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Camera,
  X,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Prescription } from '../types';

interface PrescriptionUploadPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const PrescriptionUploadPage: React.FC<PrescriptionUploadPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [medicationsRequested, setMedicationsRequested] = useState('');
  const [notes, setNotes] = useState('');

  // File state
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPrescription, setSubmittedPrescription] = useState<Prescription | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB.');
      return;
    }

    setFileName(file.name);
    setFileType(file.type);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Patient name and phone number are required.');
      return;
    }
    if (!fileUrl) {
      setError('Please attach a clear photo or document of your prescription.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.uploadPrescription({
        customerName,
        customerPhone,
        customerEmail,
        fileUrl,
        fileName,
        fileType,
        doctorName,
        hospitalName,
        medicationsRequested,
        notes,
      });

      setSubmittedPrescription(res.prescription);
    } catch (err: any) {
      setError(err.message || 'Failed to submit prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Licensed Dispensing &bull; Kitale
        </span>
        <h1 className="text-3xl font-black text-slate-900">Upload Doctor's Prescription</h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Upload a clear photo or document scan of your medical prescription. Our clinical pharmacist in Kitale will verify dosage, prepare your medication, and contact you for fulfillment.
        </p>
      </div>

      {submittedPrescription ? (
        /* Submission Success Card */
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Prescription Received Successfully!</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Our registered pharmacist has received your document for clinical verification.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Prescription Ref:</span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                {submittedPrescription.prescriptionNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-800">{submittedPrescription.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="font-bold text-slate-800">{submittedPrescription.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-sm uppercase text-[10px]">
                Pending Pharmacist Review
              </span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl max-w-md mx-auto text-xs text-emerald-950 text-left space-y-1">
            <strong>What happens next?</strong>
            <p className="text-slate-600">
              The pharmacist on duty will review the drug interactions and call you on{' '}
              <strong className="text-slate-900">{submittedPrescription.customerPhone}</strong> to confirm pricing, stock, and arrange counter pickup or delivery.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-xs"
            >
              Continue Shopping OTC & Wellness
            </button>
            <a
              href="tel:07417758578"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Pharmacist (07417758578)</span>
            </a>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Upload Zone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Prescription Document / Photo *
                </label>

                {fileUrl ? (
                  <div className="relative rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/40 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {fileType.startsWith('image/') ? (
                        <img
                          src={fileUrl}
                          alt="Prescription preview"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                          DOC
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-xs">{fileName}</p>
                        <p className="text-[11px] text-emerald-800 font-semibold">Document loaded & ready</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFileUrl('');
                        setFileName('');
                        setFileType('');
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="prescription-file-upload"
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors space-y-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        Click to take photo or choose file
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supports JPEG, PNG, or PDF format (Max 15MB)
                      </p>
                    </div>
                    <input
                      id="prescription-file-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Patient Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Jane Wanjiru"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Contact Phone Number (Active) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Prescribing Doctor (Optional)
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Omondi"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Hospital / Clinic (Optional)
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. Kitale Referral Hospital"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Specific Medications Requested or Duration
                </label>
                <textarea
                  rows={2}
                  value={medicationsRequested}
                  onChange={(e) => setMedicationsRequested(e.target.value)}
                  placeholder="e.g. Full 30 days refill of Metformin and Losartan..."
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Allergies or Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any known drug allergies or delivery instructions in Kitale..."
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              <button
                id="submit-prescription-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>Uploading & Verifying...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Prescription for Pharmacist Review</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Sidebar Guide */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                How It Works:
              </h3>
              <ol className="space-y-3 text-xs text-slate-600">
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <span><strong>Snap & Upload:</strong> Take a clear photo of your prescription.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <span><strong>Clinical Review:</strong> Our registered pharmacist checks dosage, brand availability, and safety.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <span><strong>Confirmation & Pochi:</strong> We call you with total price and dispatch options.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    4
                  </span>
                  <span><strong>Pickup / Delivery:</strong> Collect at counter or get doorstep delivery in Kitale.</span>
                </li>
              </ol>
            </div>

            <div className="bg-emerald-900 text-white rounded-3xl p-6 space-y-3">
              <h4 className="font-bold text-sm text-emerald-200 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                Need Urgent Medication?
              </h4>
              <p className="text-xs text-emerald-100 leading-relaxed">
                If this is an emergency prescription refill, call our on-duty clinical doctor directly for instant preparation.
              </p>
              <a
                href="tel:07417758578"
                className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-2 rounded-xl text-xs transition-colors shadow-md"
              >
                <span>Call 07417758578</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
