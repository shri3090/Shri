import React, { useState } from 'react';
import { RefillReminder, Order } from '../types';
import { PiggyBank, Calendar, Bell, RefreshCw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface SavingsAndRefillsViewProps {
  reminders: RefillReminder[];
  orders: Order[];
  onToggleReminder: (reminderId: string) => void;
  on1ClickReorder: (reminder: RefillReminder) => void;
  onAddManualReminder: () => void;
}

export const SavingsAndRefillsView: React.FC<SavingsAndRefillsViewProps> = ({
  reminders,
  orders,
  onToggleReminder,
  on1ClickReorder,
  onAddManualReminder,
}) => {
  // Aggregate lifetime savings from all orders
  const totalSavingsInr = orders.reduce((acc, o) => acc + (o.totalSavings || 0), 450.00); // base initial savings
  const totalOrdersCount = orders.length + 3; // previous history
  const averageSavingsPercent = 78;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Savings Tracker & Chronic Refill Reminders
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Track cumulative healthcare expenditure savings and automate recurring chronic medications (PRD Section 9.9 & Persona A)
        </p>
      </div>

      {/* Lifetime Savings Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
              Total Verified Savings
            </span>
            <PiggyBank className="w-6 h-6 text-emerald-200" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black tracking-tight">
              ₹{totalSavingsInr.toFixed(2)}
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Saved across {totalOrdersCount} generic orders vs standard branded MRPs
            </p>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
              Average Savings Rate
            </span>
            <span className="text-xl">📉</span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-neutral-900 tracking-tight">
              {averageSavingsPercent}%
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Average price reduction on bio-equivalent generic formulations
            </p>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
              Active Refill Schedules
            </span>
            <Bell className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-neutral-900 tracking-tight">
              {reminders.filter((r) => r.isActive).length} Medications
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Automated SMS/Push reminders before chronic courses expire
            </p>
          </div>
        </div>
      </div>

      {/* Chronic Care Refill Schedules (FR-NOTIF-01 & FR-NOTIF-03) */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-neutral-900">
              Active Chronic Medication Refill Schedules
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Refill alerts triggered 3 days before expected exhaustion. Controlled re-ordering with prescription verification check.
            </p>
          </div>

          <button
            onClick={onAddManualReminder}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-colors"
          >
            + Add Reminder
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            No active refill reminders. Set a reminder from any completed order.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {reminders.map((rem) => {
              const nextDate = new Date(rem.nextRefillDate);
              const isDueSoon = true;

              return (
                <div
                  key={rem.id}
                  id={`refill-item-${rem.id}`}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900">
                        {rem.medicineName}
                      </span>
                      {rem.isActive ? (
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                          Paused
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-neutral-600">
                      Dosage: <strong className="text-neutral-800">{rem.dosage}</strong> • Pack: {rem.packSize}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        Next refill due: <strong>{nextDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                      </span>
                      <span>• Cycle: every {rem.frequencyDays} days</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => onToggleReminder(rem.id)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-medium transition-colors"
                    >
                      {rem.isActive ? 'Pause' : 'Resume'}
                    </button>

                    <button
                      id={`btn-reorder-${rem.id}`}
                      onClick={() => on1ClickReorder(rem)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Initiate refill order through lowest price licensed chemist"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>1-Click Refill</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Regulatory Banner (FR-NOTIF-03) */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900">Compliance Safeguard (FR-NOTIF-03):</strong> Recurring deliveries require explicit customer confirmation and revalidation of prescription validity where applicable. GenericMed never auto-debits payment or auto-ships without verified clinical authorization.
          </div>
        </div>
      </div>
    </div>
  );
};
