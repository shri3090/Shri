import React from 'react';
import { Medicine, Offer } from '../types';
import { CheckCircle, ShieldCheck, ArrowRight, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { useLocale } from '../i18n';

interface MedicineCardProps {
  medicine: Medicine;
  offers: Offer[];
  onComparePrices: (medicine: Medicine) => void;
  onAddToCart: (medicine: Medicine, offer: Offer) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  offers,
  onComparePrices,
  onAddToCart,
}) => {
  // Find the lowest verified price offer
  const lowestOffer = offers.length > 0
    ? [...offers].sort((a, b) => a.totalPayableCost - b.totalPayableCost)[0]
    : null;

  const { t } = useLocale();

  return (
    <article
      id={`med-card-${medicine.id}`}
      className="bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-sm"
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {t.genericLabel} IP
            </span>
            {medicine.scheduleCategory === 'OTC' ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                OTC (No Rx)
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {medicine.scheduleCategory} ({t.prescriptionRequired})
              </span>
            )}
          </div>

          <span className="text-xs text-neutral-500 font-mono">
            {medicine.packSize}
          </span>
        </div>

        {/* Medicine Name & Composition */}
        <h3 className="text-base font-bold text-neutral-900 tracking-tight">
          {medicine.name}
        </h3>

        {/* Salt / Composition Information - Composition-first discovery (PRD Section 3.6 & 9.3) */}
        <div className="mt-1.5 bg-neutral-50 border border-neutral-200/80 rounded-lg p-2 text-xs">
          <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
            Active Composition:
          </div>
          <div className="font-medium text-neutral-900 mt-0.5">
            {medicine.composition} • <span className="text-emerald-700">{medicine.strength}</span>
          </div>
        </div>

        {/* Controlled Branded Equivalent Callout */}
        {medicine.brandedAlternativeName && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Branded Equivalent:{' '}
              <strong className="text-neutral-900">{medicine.brandedAlternativeName}</strong>
            </span>
          </div>
        )}

        {/* Indication */}
        <p className="mt-2 text-xs text-neutral-600 line-clamp-2">
          <span className="font-medium text-neutral-700">Used for:</span> {medicine.indication}
        </p>
      </div>

      {/* Pricing & Offer Section */}
      <div className="mt-5 pt-4 border-t border-neutral-100">
        {lowestOffer ? (
          <div>
            {/* Branded vs Lowest Total Cost */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] text-neutral-500 font-medium">
                  {t.totalPayable}:
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-neutral-900">
                    ₹{lowestOffer.totalPayableCost.toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400 line-through">
                    ₹{(medicine.brandedMrp + 30).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Savings Badge */}
              <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md text-right border border-emerald-300">
                {t.savingsLabel} {lowestOffer.savingsPercent}%
                <div className="text-[10px] font-normal text-emerald-700">
                  (₹{lowestOffer.savingsVsBranded.toFixed(2)} {t.vsLabel})
                </div>
              </div>
            </div>

            {/* Total Cost Components Transparency (PRD Section 9.4) */}
            <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between bg-neutral-50 p-1.5 rounded">
              <span>Item: ₹{lowestOffer.basePrice.toFixed(2)}</span>
              <span>+ Delivery: ₹{lowestOffer.deliveryFee.toFixed(2)}</span>
              <span>+ Pkg/Taxes: ₹{lowestOffer.packagingFee.toFixed(2)}</span>
            </div>

            {/* Fulfilling Licensed Pharmacy Info */}
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center gap-1 truncate max-w-[200px]" title={lowestOffer.partner.name}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate font-medium text-neutral-800">{lowestOffer.partner.name}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {lowestOffer.batchNumber}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{t.deliveryIn}: {lowestOffer.estimatedDeliveryHours} {t.hours} • {lowestOffer.freshnessTimestamp}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
            Checking real-time partner pricing feeds...
          </div>
        )}

        {/* Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            id={`btn-compare-${medicine.id}`}
            onClick={() => onComparePrices(medicine)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <span>{t.comparePrices} ({offers.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
          </button>

          {lowestOffer && (
            <button
              id={`btn-add-lowest-${medicine.id}`}
              onClick={() => onAddToCart(medicine, lowestOffer)}
              className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t.addToCart}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
