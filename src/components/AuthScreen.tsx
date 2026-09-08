import React, { useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
} from '../types';
import {
  Pill,
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Store,
  Stethoscope,
  Sparkles,
  MapPin,
  FileText,
  X,
  HelpCircle,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';

interface AuthScreenProps {
  isOpen?: boolean;
  isModal?: boolean;
  defaultTab?: 'login' | 'register';
  defaultRole?: UserRole;
  onClose?: () => void;
  onAuthSuccess: (user: UserProfile, role: UserRole) => void;
}

// Preset Demo Persona Accounts for quick 1-click testing
const DEMO_ACCOUNTS: Array<{
  role: UserRole;
  roleTitle: string;
  name: string;
  phone: string;
  email: string;
  pincode: string;
  badge: string;
  details: string;
  councilRegNo?: string;
  licenseNumber?: string;
}> = [
  {
    role: 'customer',
    roleTitle: 'Patient / Customer',
    name: 'Rajesh Sharma',
    phone: '+91 98201 44521',
    email: 'rajesh.sharma@example.in',
    pincode: '400018',
    badge: 'Verified Patient',
    details: 'Mumbai (Worli) • Chronic care patient with active prescriptions',
  },
  {
    role: 'pharmacist',
    roleTitle: 'Registered Pharmacist',
    name: 'Sneha Patil, B.Pharm',
    phone: '+91 98331 77210',
    email: 'sneha.pharmacist@genericmed.in',
    pincode: '400012',
    badge: 'Council Reg #PH-MH-98214',
    councilRegNo: 'PH-MH-98214',
    details: 'Maharashtra State Pharmacy Council • Verification Officer',
  },
  {
    role: 'partner',
    roleTitle: 'Partner Chemist',
    name: 'PM Jan Aushadhi Kendra #1042',
    phone: '+91 98220 55198',
    email: 'partner.1042@janaushadhi.gov.in',
    pincode: '400018',
    badge: 'Lic #DL-20B/21B-MH-449102',
    licenseNumber: 'DL-20B/21B-MH-449102',
    details: 'Authorized Pradhan Mantri Bhartiya Janaushadhi Pariyojana Store',
  },
  {
    role: 'admin',
    roleTitle: 'CDSCO Audit Officer',
    name: 'Vikram Malhotra',
    phone: '+91 98110 33490',
    email: 'admin.audit@cdsco.gov.in',
    pincode: '110002',
    badge: 'Drug Control Inspectorate',
    details: 'Regulatory Compliance & Immutable Audit Log Administrator',
  },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({
  isOpen = true,
  isModal = false,
  defaultTab = 'login',
  defaultRole = 'customer',
  onClose,
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);

  // Login Form States
  const [loginPhone, setLoginPhone] = useState<string>('9820144521');
  const [loginEmail, setLoginEmail] = useState<string>('rajesh.sharma@example.in');
  const [loginPassword, setLoginPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [simulatedOtp, setSimulatedOtp] = useState<string>('4829');

  // Register Form States
  const [regRole, setRegRole] = useState<UserRole>('customer');
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPincode, setRegPincode] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regCouncilNo, setRegCouncilNo] = useState<string>('');
  const [regLicenseNo, setRegLicenseNo] = useState<string>('');
  const [regGstin, setRegGstin] = useState<string>('');
  const [regTermsAgreed, setRegTermsAgreed] = useState<boolean>(true);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [resetSent, setResetSent] = useState<boolean>(false);

  // OTP Timer Countdown
  useEffect(() => {
    let interval: any;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // Handle Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = loginPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOtpSent(true);
      setOtpTimer(30);
      setSimulatedOtp('4829');
      setSuccessMessage('OTP code 4829 sent via SMS to +91 ' + cleanPhone.slice(-10));
    }, 600);
  };

  // Handle OTP Verification and Login
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpValue.trim() !== simulatedOtp && otpValue.trim() !== '1234') {
      setErrorMessage('Invalid OTP. Please enter 4829 or click "Quick Fill Demo OTP".');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Construct user profile
      const matchedDemo = DEMO_ACCOUNTS.find((d) => d.role === selectedRole);
      const userProfile: UserProfile = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: matchedDemo?.name || (selectedRole === 'customer' ? 'Customer User' : 'Verified User'),
        phone: `+91 ${loginPhone.replace(/\D/g, '').slice(-10)}`,
        email: matchedDemo?.email || `user.${loginPhone.slice(-4)}@genericmed.in`,
        defaultPincode: '400018',
        role: selectedRole,
        addresses: [
          {
            id: 'addr-primary',
            label: 'Home Delivery',
            street: '402, High Street Heights',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400018',
            isDefault: true,
          },
        ],
      };

      if (rememberMe) {
        localStorage.setItem('genericmed_auth_user', JSON.stringify(userProfile));
        localStorage.setItem('genericmed_auth_role', selectedRole);
        localStorage.setItem('genericmed_is_authenticated', 'true');
      }

      onAuthSuccess(userProfile, selectedRole);
    }, 500);
  };

  // Handle Email & Password Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.includes('@') || !loginEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (loginPassword.length < 4) {
      setErrorMessage('Please enter your password (minimum 4 characters).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const matchedDemo = DEMO_ACCOUNTS.find(
        (d) => d.email.toLowerCase() === loginEmail.toLowerCase()
      ) || DEMO_ACCOUNTS.find((d) => d.role === selectedRole) || DEMO_ACCOUNTS[0];

      const userProfile: UserProfile = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: matchedDemo.name,
        phone: matchedDemo.phone,
        email: loginEmail,
        defaultPincode: matchedDemo.pincode,
        role: matchedDemo.role,
        licenseNumber: matchedDemo.licenseNumber,
        councilRegNo: matchedDemo.councilRegNo,
        addresses: [
          {
            id: 'addr-default',
            label: 'Default Address',
            street: '102 Medical Enclave, Central Avenue',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: matchedDemo.pincode,
            isDefault: true,
          },
        ],
      };

      if (rememberMe) {
        localStorage.setItem('genericmed_auth_user', JSON.stringify(userProfile));
        localStorage.setItem('genericmed_auth_role', matchedDemo.role);
        localStorage.setItem('genericmed_is_authenticated', 'true');
      }

      onAuthSuccess(userProfile, matchedDemo.role);
    }, 500);
  };

  // Handle 1-Click Quick Demo Login
  const handleQuickDemoLogin = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsSubmitting(false);
      const userProfile: UserProfile = {
        id: `usr-${demo.role}-${Date.now().toString().slice(-4)}`,
        name: demo.name,
        phone: demo.phone,
        email: demo.email,
        defaultPincode: demo.pincode,
        role: demo.role,
        licenseNumber: demo.licenseNumber,
        councilRegNo: demo.councilRegNo,
        addresses: [
          {
            id: `addr-${demo.role}`,
            label: 'Registered Address',
            street: demo.details,
            city: demo.pincode.startsWith('11') ? 'New Delhi' : 'Mumbai',
            state: demo.pincode.startsWith('11') ? 'Delhi' : 'Maharashtra',
            pincode: demo.pincode,
            isDefault: true,
          },
        ],
      };

      localStorage.setItem('genericmed_auth_user', JSON.stringify(userProfile));
      localStorage.setItem('genericmed_auth_role', demo.role);
      localStorage.setItem('genericmed_is_authenticated', 'true');

      onAuthSuccess(userProfile, demo.role);
    }, 400);
  };

  // Handle Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }

    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const cleanPin = regPincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setErrorMessage('Please enter a 6-digit postal PIN code.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (regRole === 'pharmacist' && !regCouncilNo.trim()) {
      setErrorMessage('State Pharmacy Council Registration Number is mandatory for pharmacist accounts.');
      return;
    }

    if (regRole === 'partner' && (!regLicenseNo.trim() || !regGstin.trim())) {
      setErrorMessage('Drug License Number (Form 20B/21B) and GSTIN are required for licensed chemists.');
      return;
    }

    if (!regTermsAgreed) {
      setErrorMessage('You must agree to the Terms of Service and CDSCO Rule 65 regulations.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const userProfile: UserProfile = {
        id: `usr-reg-${Date.now().toString().slice(-4)}`,
        name: regName.trim(),
        phone: `+91 ${cleanPhone}`,
        email: regEmail.trim(),
        defaultPincode: cleanPin,
        role: regRole,
        councilRegNo: regRole === 'pharmacist' ? regCouncilNo : undefined,
        licenseNumber: regRole === 'partner' ? regLicenseNo : undefined,
        gstin: regRole === 'partner' ? regGstin : undefined,
        addresses: [
          {
            id: 'addr-reg-1',
            label: 'Registered Address',
            street: `Plot 18, Sector 4, PIN ${cleanPin}`,
            city: cleanPin.startsWith('4') ? 'Mumbai' : cleanPin.startsWith('1') ? 'Delhi' : cleanPin.startsWith('5') ? 'Bengaluru' : 'City',
            state: cleanPin.startsWith('4') ? 'Maharashtra' : cleanPin.startsWith('1') ? 'Delhi' : cleanPin.startsWith('5') ? 'Karnataka' : 'State',
            pincode: cleanPin,
            isDefault: true,
          },
        ],
      };

      localStorage.setItem('genericmed_auth_user', JSON.stringify(userProfile));
      localStorage.setItem('genericmed_auth_role', regRole);
      localStorage.setItem('genericmed_is_authenticated', 'true');

      setSuccessMessage('Account registered successfully! Redirecting...');
      setTimeout(() => {
        onAuthSuccess(userProfile, regRole);
      }, 500);
    }, 700);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-neutral-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 9) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(regPassword);

  if (!isOpen) return null;

  const content = (
    <div
      id="auth-container"
      className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden w-full max-w-xl mx-auto my-auto"
    >
      {/* Modal / Screen Top Bar */}
      <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Pill className="w-4 h-4 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm tracking-tight text-white">GenericMed Secure Access</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                CDSCO Verified
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Rule 65 Licensed Telepharmacy & Generic Medicines Portal
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Tab Switcher: Sign In vs Create Account */}
      <div className="flex border-b border-neutral-200 bg-neutral-50 text-xs font-semibold">
        <button
          id="tab-auth-login"
          type="button"
          onClick={() => {
            setActiveTab('login');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-3 px-4 text-center transition-all flex items-center justify-center gap-2 border-b-2 ${
            activeTab === 'login'
              ? 'bg-white text-emerald-700 border-emerald-600 font-bold shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-900 border-transparent'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>Sign In / Log In</span>
        </button>

        <button
          id="tab-auth-register"
          type="button"
          onClick={() => {
            setActiveTab('register');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-3 px-4 text-center transition-all flex items-center justify-center gap-2 border-b-2 ${
            activeTab === 'register'
              ? 'bg-white text-emerald-700 border-emerald-600 font-bold shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-900 border-transparent'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Create New Account</span>
        </button>
      </div>

      {/* Body Area */}
      <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ======================= TAB 1: SIGN IN ======================= */}
        {activeTab === 'login' && (
          <div className="space-y-5">
            {/* Quick Demo Persona Switcher (Convenient for testing all 4 roles) */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quick 1-Click Demo Accounts
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Select to Test Role</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {DEMO_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(demo)}
                    className="text-left p-2.5 rounded-lg border border-neutral-200 hover:border-emerald-500 hover:bg-white bg-white/70 transition-all text-xs group shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-neutral-900 group-hover:text-emerald-700 truncate">
                        {demo.name}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-100 text-neutral-600 shrink-0">
                        {demo.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">{demo.details}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-3 text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                Or Sign In With
              </span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            {/* Login Method Toggle: Phone OTP vs Email & Password */}
            <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                id="btn-login-method-phone"
                onClick={() => {
                  setLoginMethod('phone');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'phone'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Number (OTP)</span>
              </button>

              <button
                type="button"
                id="btn-login-method-email"
                onClick={() => {
                  setLoginMethod('email');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'email'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Password</span>
              </button>
            </div>

            {/* Persona Target Role Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 block">
                Access Persona / Role
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['customer', 'pharmacist', 'partner', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`py-2 px-1 rounded-lg border text-center font-medium capitalize transition-all text-[11px] ${
                      selectedRole === r
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {r === 'customer'
                      ? 'Patient'
                      : r === 'pharmacist'
                      ? 'Pharmacist'
                      : r === 'partner'
                      ? 'Chemist'
                      : 'Admin'}
                  </button>
                ))}
              </div>
            </div>

            {/* MODE 1: PHONE NUMBER & OTP LOGIN */}
            {loginMethod === 'phone' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 block">
                        Indian Mobile Number
                      </label>
                      <div className="relative flex rounded-xl border border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 overflow-hidden">
                        <span className="bg-neutral-100 px-3 py-2.5 text-xs font-semibold text-neutral-600 border-r border-neutral-200 flex items-center">
                          🇮🇳 +91
                        </span>
                        <input
                          id="input-login-phone"
                          type="tel"
                          maxLength={10}
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="e.g. 9820144521"
                          className="flex-1 px-3 py-2.5 text-xs font-mono font-medium focus:outline-none text-neutral-900"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        We will send a 4-digit verification code to confirm your device.
                      </p>
                    </div>

                    <button
                      id="btn-request-otp"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification OTP</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">SMS Sent to +91 {loginPhone}</span>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-[10px] text-emerald-700 underline font-medium hover:text-emerald-900"
                        >
                          Change Number
                        </button>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        For demo testing, code is <strong className="font-mono font-bold">4829</strong>
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-700">
                          Enter 4-Digit OTP Code
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpValue('4829')}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                        >
                          Auto-fill 4829
                        </button>
                      </div>

                      <input
                        id="input-otp-code"
                        type="text"
                        maxLength={4}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        placeholder="• • • •"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-center font-mono text-xl tracking-widest font-black focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        autoFocus
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Didn't receive SMS?</span>
                      {otpTimer > 0 ? (
                        <span className="font-mono text-neutral-400">Resend in {otpTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpTimer(30);
                            setSuccessMessage('New OTP code 4829 sent.');
                          }}
                          className="font-bold text-emerald-600 hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      id="btn-verify-otp"
                      type="submit"
                      disabled={isSubmitting || otpValue.length < 4}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Token...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Sign In</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* MODE 2: EMAIL & PASSWORD LOGIN */}
            {loginMethod === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      id="input-login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. rajesh.sharma@example.in"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-xs text-neutral-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[11px] text-emerald-700 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-xs text-neutral-900 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Remember this session on this browser</span>
                  </label>
                </div>

                <button
                  id="btn-submit-email-login"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to GenericMed</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ======================= TAB 2: REGISTER (CREATE ACCOUNT) ======================= */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Persona Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 block">
                Select Account Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('customer')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col gap-1 ${
                    regRole === 'customer'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Patient / Buyer</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Order generic medicines</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('partner')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col gap-1 ${
                    regRole === 'partner'
                      ? 'bg-purple-50 border-purple-600 text-purple-950 font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Store className="w-4 h-4 text-purple-600" />
                  <span className="font-bold">Retail Chemist</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Form 20B/21B licensed</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('pharmacist')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col gap-1 ${
                    regRole === 'pharmacist'
                      ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span className="font-bold">Pharmacist</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Rx verification officer</span>
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Full Name</label>
                <input
                  id="input-reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={regRole === 'partner' ? 'Apex Jan Aushadhi Chemist' : 'Aarav Mehta'}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600 text-xs text-neutral-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Mobile Number</label>
                <div className="flex rounded-xl border border-neutral-300 focus-within:border-emerald-600 overflow-hidden">
                  <span className="bg-neutral-100 px-2.5 py-2 text-xs text-neutral-600 font-semibold border-r border-neutral-200">
                    +91
                  </span>
                  <input
                    id="input-reg-phone"
                    type="tel"
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="9820011223"
                    className="flex-1 px-3 py-2 text-xs font-mono focus:outline-none text-neutral-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Email Address</label>
                <input
                  id="input-reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.in"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600 text-xs text-neutral-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Postal PIN Code</label>
                <input
                  id="input-reg-pincode"
                  type="text"
                  maxLength={6}
                  value={regPincode}
                  onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 400001"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600 font-mono text-xs text-neutral-900"
                  required
                />
              </div>
            </div>

            {/* Role-Specific Credential Inputs */}
            {regRole === 'pharmacist' && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Pharmacy Council Credentials (Mandatory)</span>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-blue-800 block">
                    State Pharmacy Council Registration No.
                  </label>
                  <input
                    id="input-reg-council"
                    type="text"
                    value={regCouncilNo}
                    onChange={(e) => setRegCouncilNo(e.target.value)}
                    placeholder="e.g. PH-MH-104928"
                    className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-white text-xs font-mono text-neutral-900 mt-1"
                    required
                  />
                  <p className="text-[10px] text-blue-600 mt-0.5">
                    Will be cross-referenced against Pharmacy Council of India database before granting Rx signing authority.
                  </p>
                </div>
              </div>
            )}

            {regRole === 'partner' && (
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Store className="w-4 h-4 text-purple-600" />
                  <span>Licensed Chemist Verification (Form 20B/21B)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-purple-800 block">
                      Drug License No.
                    </label>
                    <input
                      id="input-reg-license"
                      type="text"
                      value={regLicenseNo}
                      onChange={(e) => setRegLicenseNo(e.target.value)}
                      placeholder="DL-20B/21B-MH-449102"
                      className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-xs font-mono text-neutral-900 mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-purple-800 block">
                      GSTIN (15 Digits)
                    </label>
                    <input
                      id="input-reg-gstin"
                      type="text"
                      maxLength={15}
                      value={regGstin}
                      onChange={(e) => setRegGstin(e.target.value.toUpperCase())}
                      placeholder="27AABCP1122D1ZK"
                      className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-xs font-mono text-neutral-900 mt-1"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Create Password</label>
                <input
                  id="input-reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600 text-xs font-mono text-neutral-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Confirm Password</label>
                <input
                  id="input-reg-confirm-password"
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600 text-xs font-mono text-neutral-900"
                  required
                />
              </div>
            </div>

            {/* Password strength meter */}
            {regPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Password Strength:</span>
                  <span className="font-semibold text-neutral-800">{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden flex gap-1">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all rounded-full`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer text-xs text-neutral-600 pt-1">
              <input
                id="checkbox-reg-terms"
                type="checkbox"
                checked={regTermsAgreed}
                onChange={(e) => setRegTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                I agree to the <strong>Terms of Service</strong>, <strong>Privacy Policy</strong>, and acknowledge that all prescription medicines require validation under Rule 65 of the Drugs & Cosmetics Rules.
              </span>
            </label>

            {/* Submit Button */}
            <button
              id="btn-submit-register"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering Verified Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create {regRole === 'customer' ? 'Patient' : regRole === 'partner' ? 'Chemist' : 'Pharmacist'} Account</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Security & Regulatory Compliance Banner */}
      <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted Session</span>
        </span>
        <span>Drugs & Cosmetics Act, 1940 Compliant</span>
      </div>

      {/* Forgot Password Sub-Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">Reset Account Password</h3>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setResetSent(false);
                }}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!resetSent ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-500">
                  Enter your registered email address or phone number to receive a secure password reset link.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. rajesh.sharma@example.in"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail.trim()) {
                      setResetSent(true);
                    }
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  Send Reset Link
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-neutral-700 font-medium">
                  A reset link has been dispatched to <strong>{forgotEmail}</strong>. Please check your inbox or SMS.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      {content}
    </div>
  );
};
