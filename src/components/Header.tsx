import React from 'react';
import { Pill, ShoppingBag, MapPin, ShieldCheck, Stethoscope, Store, SlidersHorizontal, HelpCircle } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeCustomerTab: string;
  onSelectCustomerTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  selectedPincode: string;
  onChangePincode: () => void;
  pendingRxCount: number;
  onOpenSupport: () => void;
  onOpenPrdSpecs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  activeCustomerTab,
  onSelectCustomerTab,
  cartCount,
  onOpenCart,
  selectedPincode,
  onChangePincode,
  pendingRxCount,
  onOpenSupport,
  onOpenPrdSpecs,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      {/* Top Banner: PRD Persona & Role Switcher */}
      <div className="bg-neutral-900 text-neutral-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-white tracking-wide">GenericMed Platform</span>
            <span className="text-neutral-400 hidden md:inline">| CDSCO & Jan Aushadhi Compliant Architecture</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-neutral-400 text-[11px] hidden sm:inline mr-1">Switch View / Persona:</span>
            
            <button
              id="role-btn-customer"
              onClick={() => onSelectRole('customer')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                currentRole === 'customer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              👤 Customer
            </button>

            <button
              id="role-btn-pharmacist"
              onClick={() => onSelectRole('pharmacist')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                currentRole === 'pharmacist'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Rx Pharmacist</span>
              {pendingRxCount > 0 && (
                <span className="bg-amber-400 text-neutral-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {pendingRxCount}
                </span>
              )}
            </button>

            <button
              id="role-btn-partner"
              onClick={() => onSelectRole('partner')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                currentRole === 'partner'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Pharmacy Partner</span>
            </button>

            <button
              id="role-btn-admin"
              onClick={() => onSelectRole('admin')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                currentRole === 'admin'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ops & Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectCustomerTab('discover')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Pill className="w-6 h-6 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-neutral-900">Generic<span className="text-emerald-600">Med</span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                  India
                </span>
              </div>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Lowest Verified Total Cost • Licensed Chemists Only
              </p>
            </div>
          </div>

          {/* Location & Pincode Selector */}
          <button
            id="btn-change-pincode"
            onClick={onChangePincode}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 text-xs text-neutral-700 bg-neutral-50 transition-colors"
            title="Change Delivery Location"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-neutral-500">Deliver to:</span>
            <span className="font-semibold text-neutral-900">Mumbai {selectedPincode}</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-prd-specs"
              onClick={onOpenPrdSpecs}
              className="text-xs text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5"
              title="View PRD v1.0 Specifications & Traceability"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">PRD Specs</span>
            </button>

            <button
              id="btn-support-help"
              onClick={onOpenSupport}
              className="text-xs text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5"
              title="Pharmacist Helpline & Support"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Helpline</span>
            </button>

            <button
              id="btn-header-cart"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-emerald-700 px-1.5 py-0.5 rounded-full text-[11px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Customer Navigation Tabs (When in customer role) */}
        {currentRole === 'customer' && (
          <nav className="flex items-center gap-1 sm:gap-2 mt-3 pt-2 border-t border-neutral-100 overflow-x-auto text-xs scrollbar-none">
            <button
              id="nav-tab-discover"
              onClick={() => onSelectCustomerTab('discover')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeCustomerTab === 'discover'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              🔍 Discover & Price Compare
            </button>

            <button
              id="nav-tab-prescriptions"
              onClick={() => onSelectCustomerTab('prescriptions')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeCustomerTab === 'prescriptions'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span>📋 Prescriptions & OCR</span>
            </button>

            <button
              id="nav-tab-orders"
              onClick={() => onSelectCustomerTab('orders')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeCustomerTab === 'orders'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              📦 Order Tracking & Invoices
            </button>

            <button
              id="nav-tab-savings"
              onClick={() => onSelectCustomerTab('savings')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
                activeCustomerTab === 'savings'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span>💰 Savings Tracker & Refills</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
