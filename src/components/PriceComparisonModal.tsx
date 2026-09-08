import React, { useState } from 'react';
import { Medicine, Offer } from '../types';
import { X, ShieldCheck, Clock, Check, Sparkles, AlertCircle, ArrowUpDown } from 'lucide-react';

interface PriceComparisonModalProps {
  medicine: Medicine;
  offers: Offer[];
  onClose: () => void;
  onSelectOffer: (medicine: Medicine, offer: Offer) => void;
}

export const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({
  medicine,
  offers,
  onClose,
  onSelectOffer,
}) => {
  const [sortBy, setSortBy] = useState<'lowest-total' | 'fastest' | 'rating'>('lowest-total');

  // Sort offers based on criteria
  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === 'lowest-total') return a.totalPayableCost - b.totalPayableCost;
    if (sortBy === 'fastest') return a.estimatedDeliveryHours - b.estimatedDeliveryHours;
    if (sortBy === 'rating') return b.partner.rating - a.partner.rating;
    return 0;
  });

  const lowestOffer = [...offers].sort((a, b) => a.totalPayableCost - b.totalPayableCost)[0];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="price-comparison-dialog"
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl border border-neutral-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-start justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                Transparent Price Comparison
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {medicine.packSize}
              </span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mt-1">
              {medicine.name}
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Active Salt: <strong className="text-neutral-800">{medicine.composition} ({medicine.strength})</strong>
            </p>
          </div>

          <button
            id="btn-close-comparison"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branded vs Generic Savings Spotlight */}
        <div className="p-4 bg-emerald-50/80 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-semibold text-emerald-950">Bio-Equivalent Generic Substitution:</span>
              <span className="text-emerald-800 ml-1">
                Same active molecule as {medicine.brandedAlternativeName} (Standard Branded MRP ₹{medicine.brandedMrp.toFixed(2)})
              </span>
            </div>
          </div>
          {lowestOffer && (
            <div className="font-semibold text-emerald-900 bg-white px-2.5 py-1 rounded border border-emerald-200">
              Max Savings: ₹{(medicine.brandedMrp + 30 - lowestOffer.totalPayableCost).toFixed(2)} ({lowestOffer.savingsPercent}%)
            </div>
          )}
        </div>

        {/* Sort Bar */}
        <div className="px-5 py-2.5 bg-neutral-100/70 border-b border-neutral-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-medium">Sort offers by:</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortBy('lowest-total')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                sortBy === 'lowest-total'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
              }`}
            >
              Lowest Total Cost
            </button>
            <button
              onClick={() => setSortBy('fastest')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                sortBy === 'fastest'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
              }`}
            >
              Fastest Delivery
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                sortBy === 'rating'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
              }`}
            >
              Partner Rating
            </button>
          </div>
        </div>

        {/* Offers List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {sortedOffers.map((offer, index) => {
            const isLowest = offer.id === lowestOffer?.id;

            return (
              <div
                key={offer.id}
                id={`offer-item-${offer.id}`}
                className={`rounded-xl border p-4 transition-all ${
                  isLowest
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Partner Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900">
                        {offer.partner.name}
                      </span>
                      {isLowest && (
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Lowest Total Cost
                        </span>
                      )}
                    </div>

                    {/* Drug License & Trust Data (FR-TRUST-01 & FR-PART-01) */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="font-mono text-[11px]">DL: {offer.partner.licenseNumber}</span>
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span>⭐ {offer.partner.rating} ({offer.partner.reviewCount} reviews)</span>
                      <span className="text-neutral-400">•</span>
                      <span className="font-mono text-neutral-500">Batch: {offer.batchNumber} (Exp {offer.expiryDate})</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Delivery in <strong>{offer.estimatedDeliveryHours} hours</strong></span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-emerald-700 font-medium">{offer.stockState} ({offer.stockCount} units)</span>
                      <span className="text-neutral-400">•</span>
                      <span>Verified: {offer.freshnessTimestamp}</span>
                    </div>
                  </div>

                  {/* Cost Breakdown & Select Action */}
                  <div className="flex items-end sm:items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <div className="text-right">
                      <div className="text-[11px] text-neutral-500 font-medium">
                        Verified Total Payable
                      </div>
                      <div className="text-xl font-black text-neutral-900">
                        ₹{offer.totalPayableCost.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        Base: ₹{offer.basePrice.toFixed(2)} + Deliv: ₹{offer.deliveryFee.toFixed(2)} + Pkg: ₹{offer.packagingFee.toFixed(2)}
                      </div>
                    </div>

                    <button
                      id={`btn-select-offer-${offer.id}`}
                      onClick={() => onSelectOffer(medicine, offer)}
                      className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 ${
                        isLowest
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Select Offer</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Policy Notice (PRD Section 3.6 & 9.4) */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <span>
            <strong>GenericMed Transparent Total Cost Guarantee:</strong> Displayed prices reflect all final fees including local pharmacy base price, temperature-controlled packaging, delivery, and applicable GST. No surprise charges at checkout.
          </span>
        </div>
      </div>
    </div>
  );
};
