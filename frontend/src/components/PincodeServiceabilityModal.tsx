import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Truck,
  Sparkles,
  ThermometerSnowflake,
  Search,
  Check,
} from 'lucide-react';
import { getPincodeServiceability, PINCODE_DIRECTORY, TIER2_CITIES } from '../data/regionalDeliveryData';
import { PharmacyPartner } from '../types';

interface PincodeServiceabilityModalProps {
  currentPincode: string;
  allPartners: PharmacyPartner[];
  onClose: () => void;
  onSelectPincode: (pincode: string) => void;
}

export const PincodeServiceabilityModal: React.FC<PincodeServiceabilityModalProps> = ({
  currentPincode,
  allPartners,
  onClose,
  onSelectPincode,
}) => {
  const [inputPincode, setInputPincode] = useState(currentPincode || '400018');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');

  // Compute live serviceability info
  const serviceability = useMemo(() => {
    return getPincodeServiceability(inputPincode);
  }, [inputPincode]);

  // Find nearby partners for this pincode or city
  const nearbyPartners = useMemo(() => {
    const clean = inputPincode.trim();
    // exact match
    const exact = allPartners.filter((p) => p.pincode === clean);
    if (exact.length > 0) return exact;

    // city prefix match
    return allPartners.filter((p) => p.city.toLowerCase() === serviceability.city.toLowerCase()).slice(0, 4);
  }, [inputPincode, allPartners, serviceability]);

  // Featured healthcare corridors for 1-click selection
  const clusters = [
    {
      id: 'mumbai',
      label: 'Mumbai MMR',
      pincodes: [
        { pin: '400018', name: 'Worli / Lower Parel' },
        { pin: '400012', name: 'Parel (KEM Hospital)' },
        { pin: '400050', name: 'Bandra West (Lilavati)' },
        { pin: '400001', name: 'Fort / Ballard Estate' },
      ],
    },
    {
      id: 'pune',
      label: 'Pune Hub',
      pincodes: [
        { pin: '411038', name: 'Kothrud (Paud Road)' },
        { pin: '411004', name: 'Deccan Gymkhana' },
        { pin: '411005', name: 'Shivajinagar' },
        { pin: '411001', name: 'Pune Camp / Station' },
      ],
    },
    {
      id: 'delhi',
      label: 'Delhi NCR',
      pincodes: [
        { pin: '110029', name: 'Ansari Nagar (AIIMS)' },
        { pin: '110017', name: 'Saket (Max Hospital)' },
        { pin: '110001', name: 'Connaught Place' },
        { pin: '110048', name: 'Greater Kailash' },
      ],
    },
    {
      id: 'bengaluru',
      label: 'Bengaluru',
      pincodes: [
        { pin: '560034', name: 'Koramangala 4th Block' },
        { pin: '560038', name: 'Indiranagar 100ft Rd' },
        { pin: '560102', name: 'HSR Layout' },
        { pin: '560066', name: 'Whitefield (ITPL)' },
      ],
    },
    {
      id: 'hyderabad',
      label: 'Hyderabad',
      pincodes: [
        { pin: '500081', name: 'HITEC City (Cyber Towers)' },
        { pin: '500032', name: 'Gachibowli (AIG Hospital)' },
        { pin: '500034', name: 'Banjara Hills' },
        { pin: '500033', name: 'Jubilee Hills' },
      ],
    },
  ];

  const handleApply = () => {
    if (inputPincode.trim().length === 6) {
      onSelectPincode(inputPincode.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        id="pincode-serviceability-dialog"
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-start justify-between bg-gradient-to-r from-neutral-50 to-emerald-50/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                Phase 1 National Pilot Network
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                50 Jan Aushadhi Kendras Live
              </span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mt-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Select Delivery Pincode & Check Serviceability</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Enter any 6-digit Indian PIN code to match with nearby licensed Kendras, cold-chain couriers, and verified generic stocks.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-neutral-900">
          {/* Pincode Input Box */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              Enter Indian Postal PIN Code:
            </label>
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-neutral-400 absolute left-3.5" />
              <input
                id="input-modal-pincode"
                type="text"
                maxLength={6}
                value={inputPincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setInputPincode(val);
                }}
                placeholder="e.g. 400018, 411038, 110029, 560034, 500081"
                className="w-full pl-11 pr-28 py-3 text-base font-mono font-bold tracking-widest text-neutral-900 bg-white border border-neutral-300 rounded-xl focus:border-emerald-600 focus:outline-none shadow-xs"
              />
              <button
                id="btn-apply-pincode-input"
                disabled={inputPincode.trim().length !== 6}
                onClick={handleApply}
                className="absolute right-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                Apply
              </button>
            </div>

            {/* Live Serviceability Overview Badge */}
            {inputPincode.trim().length === 6 && (
              <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{serviceability.area}</span>
                    <span className="text-xs font-normal text-neutral-500">
                      ({serviceability.city}, {serviceability.state})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {serviceability.cluster}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-neutral-400 text-[10px]">Delivery SLA</div>
                      <div className="font-semibold text-neutral-900">{serviceability.slaLabel}</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-neutral-400 text-[10px]">Courier Fee</div>
                      <div className="font-semibold text-neutral-900">₹{serviceability.deliveryFee.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center gap-2">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <div>
                      <div className="text-neutral-400 text-[10px]">Cold-Chain</div>
                      <div className="font-semibold text-emerald-700">Validated (&lt; 8°C)</div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-600 pt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Primary Dispatch Hub: <strong>{serviceability.primaryKendraName}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Healthcare Clusters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Phase 1 Pilot Clusters (Metro):
              </h3>
              <span className="text-[11px] text-neutral-500 font-medium">Click to switch</span>
            </div>

            <div className="space-y-3">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="border border-neutral-200 rounded-xl p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900">{cluster.label}</span>
                    <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                      4 Pilot Hubs
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {cluster.pincodes.map((item) => (
                      <button
                        key={item.pin}
                        onClick={() => {
                          setInputPincode(item.pin);
                          onSelectPincode(item.pin);
                          onClose();
                        }}
                        className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between ${
                          inputPincode === item.pin
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'bg-neutral-50/50 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className="font-mono text-xs font-bold text-emerald-800 flex items-center justify-between">
                          <span>{item.pin}</span>
                          {inputPincode === item.pin && <Check className="w-3 h-3 text-emerald-600" />}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5 truncate">{item.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 4: Tier 2 / 3 / 4 National Expansion Cities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Phase 4 National Expansion (Tier 2 / 3 Cities):
              </h3>
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                8 New Cities
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIER2_CITIES.map((city) => (
                <button
                  key={city.samplePin}
                  id={`pincode-tier2-${city.samplePin}`}
                  onClick={() => {
                    setInputPincode(city.samplePin);
                    onSelectPincode(city.samplePin);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col gap-1 ${
                    inputPincode === city.samplePin
                      ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold shadow-xs'
                      : 'bg-neutral-50 border-neutral-200 hover:border-blue-300 hover:bg-blue-50/50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base leading-none">{city.flag}</span>
                    <span className="font-bold text-neutral-900 text-[11px]">{city.name}</span>
                    {inputPincode === city.samplePin && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                  </div>
                  <div className="text-[10px] text-neutral-500">{city.state}</div>
                  <div className="font-mono text-[10px] text-blue-700">{city.samplePin}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Nearby Kendras in Zone */}
          {nearbyPartners.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Nearby Jan Aushadhi Kendras & Licensed Partners ({nearbyPartners.length}):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {nearbyPartners.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-semibold text-neutral-900 text-xs leading-tight">
                        {p.name}
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                        ★ {p.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      Lic: {p.licenseNumber}
                    </div>
                    <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-0.5">
                      <span>PIN: {p.pincode} • {p.city}</span>
                      <span className="text-emerald-700 font-medium">✓ Cold-chain validated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-xs text-neutral-500 hidden sm:block">
            Current Active Zone: <strong className="text-neutral-900 font-mono">{inputPincode}</strong>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-delivery-zone"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Confirm Delivery Zone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
