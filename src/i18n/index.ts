/**
 * GenericMed Vernacular Localisation Engine (Phase 4)
 * Supports 7 Indian languages: English, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

// ── Supported locales ─────────────────────────────────────────────────────────

export type Locale = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn' | 'bn';

export interface LocaleMeta {
  code: Locale;
  label: string;       // Native script name
  labelEn: string;     // English name
  flag: string;        // Emoji flag
  script: string;      // Unicode script block name
  rtl: boolean;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { code: 'en', label: 'English',   labelEn: 'English',   flag: '🇮🇳', script: 'Latin',    rtl: false },
  hi: { code: 'hi', label: 'हिन्दी',     labelEn: 'Hindi',     flag: '🇮🇳', script: 'Devanagari', rtl: false },
  mr: { code: 'mr', label: 'मराठी',      labelEn: 'Marathi',   flag: '🇮🇳', script: 'Devanagari', rtl: false },
  ta: { code: 'ta', label: 'தமிழ்',      labelEn: 'Tamil',     flag: '🇮🇳', script: 'Tamil',    rtl: false },
  te: { code: 'te', label: 'తెలుగు',     labelEn: 'Telugu',    flag: '🇮🇳', script: 'Telugu',   rtl: false },
  kn: { code: 'kn', label: 'ಕನ್ನಡ',      labelEn: 'Kannada',   flag: '🇮🇳', script: 'Kannada',  rtl: false },
  bn: { code: 'bn', label: 'বাংলা',      labelEn: 'Bengali',   flag: '🇮🇳', script: 'Bengali',  rtl: false },
};

// ── Translation key catalogue ─────────────────────────────────────────────────

export interface Translations {
  // ── App / Header ────────────────────────────────────────────────────────────
  appName: string;
  tagline: string;
  deliverTo: string;
  changeLocation: string;
  cart: string;
  signIn: string;
  signOut: string;
  register: string;
  myAccount: string;
  pharmacistPortal: string;
  partnerPortal: string;
  auditCockpit: string;
  authGateway: string;
  helpline: string;
  prdSpecs: string;

  // ── Customer tabs ───────────────────────────────────────────────────────────
  tabDiscover: string;
  tabPrescriptions: string;
  tabOrders: string;
  tabSavings: string;
  tabAccount: string;

  // ── Hero section ────────────────────────────────────────────────────────────
  heroHeadline: string;
  heroSubtext: string;
  heroUploadRx: string;
  heroPricingLink: string;
  heroBadge: string;
  heroSavings: string;

  // ── Search bar ──────────────────────────────────────────────────────────────
  searchPlaceholder: string;
  searchBioEquivLabel: string;
  searchBioEquivSuffix: string;
  searchAverageSaving: string;
  searchResetFilters: string;
  searchShowing: string;
  searchSortedBy: string;
  searchBioEquivEngineLabel: string;

  // ── Category pills ──────────────────────────────────────────────────────────
  catAll: string;
  catChronic: string;
  catDiabetes: string;
  catHypertension: string;
  catPain: string;
  catAcidity: string;
  catAntibiotics: string;
  catAllergy: string;

  // ── Medicine card ───────────────────────────────────────────────────────────
  genericLabel: string;
  scheduleLabel: string;
  prescriptionRequired: string;
  savingsLabel: string;
  vsLabel: string;
  totalPayable: string;
  addToCart: string;
  comparePrices: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  lowestPrice: string;
  deliveryIn: string;
  hours: string;
  bioEquivalent: string;

  // ── Cart / Checkout ─────────────────────────────────────────────────────────
  cartTitle: string;
  checkout: string;
  emptyCart: string;
  totalSavings: string;
  placeOrder: string;
  paymentMethod: string;

  // ── Prescription ────────────────────────────────────────────────────────────
  uploadRx: string;
  rxLocker: string;
  pendingReview: string;
  verified: string;
  rejected: string;
  clarificationRequested: string;

  // ── Common actions ──────────────────────────────────────────────────────────
  save: string;
  cancel: string;
  close: string;
  confirm: string;
  loading: string;
  noResults: string;
  viewAll: string;
  download: string;
  refresh: string;
  acknowledge: string;
}

// ── English (base) ────────────────────────────────────────────────────────────

const en: Translations = {
  appName: 'GenericMed',
  tagline: 'Certified Jan Aushadhi & Retail Chemist Marketplace',
  deliverTo: 'Deliver to',
  changeLocation: 'Change Location',
  cart: 'Cart',
  signIn: 'Sign In',
  signOut: 'Sign Out',
  register: 'Register',
  myAccount: 'My Account',
  pharmacistPortal: 'Pharmacist Portal',
  partnerPortal: 'Partner Portal',
  auditCockpit: 'Audit Cockpit',
  authGateway: 'Auth Gateway',
  helpline: 'Pharmacist Helpline',
  prdSpecs: 'PRD Specs',

  tabDiscover: 'Discover',
  tabPrescriptions: 'Prescriptions',
  tabOrders: 'My Orders',
  tabSavings: 'Savings & Refills',
  tabAccount: 'Account',

  heroHeadline: 'Compare Verified Generic Medicine Prices Across Licensed Chemists',
  heroSubtext: 'Save up to 85% on chronic and acute medications. Generic formulations contain the exact same active molecules as expensive branded counterparts, delivered with cold-chain compliance.',
  heroUploadRx: 'Upload Prescription (Instant AI Matching)',
  heroPricingLink: 'How Pricing Transparency Works',
  heroBadge: 'Zero Markups • Indian Pharmacopoeia (IP) Certified',
  heroSavings: 'Save up to 85%',

  searchPlaceholder: "Search by Brand (e.g. 'Dolo 650', 'Glycomet', 'Augmentin') or Active Salt ('Paracetamol', 'Metformin', 'Telmisartan')...",
  searchBioEquivLabel: 'Bio-Equivalence Engine:',
  searchBioEquivSuffix: 'to certified generic Indian Pharmacopoeia equivalents with identical dosage, strength, and clinical efficacy.',
  searchAverageSaving: 'Average 75% Lower Cost',
  searchResetFilters: 'Reset Search Filters',
  searchShowing: 'Showing',
  searchSortedBy: 'Sorted by: Lowest Verified Total Cost',
  searchBioEquivEngineLabel: 'bio-equivalent medicines',

  catAll: 'All Generic Medicines',
  catChronic: 'Chronic Care',
  catDiabetes: 'Diabetes',
  catHypertension: 'Heart & Blood Pressure',
  catPain: 'Pain & Fever',
  catAcidity: 'Acidity & GERD',
  catAntibiotics: 'Antibiotics',
  catAllergy: 'Allergy & Asthma',

  genericLabel: 'Generic',
  scheduleLabel: 'Schedule',
  prescriptionRequired: 'Prescription Required',
  savingsLabel: 'savings',
  vsLabel: 'vs Branded MRP',
  totalPayable: 'Total Payable',
  addToCart: 'Add to Cart',
  comparePrices: 'Compare Prices',
  inStock: 'In Stock',
  lowStock: 'Low Stock',
  outOfStock: 'Out of Stock',
  lowestPrice: 'Lowest Price',
  deliveryIn: 'Delivery in',
  hours: 'hrs',
  bioEquivalent: 'Bio-Equivalent',

  cartTitle: 'Your Cart',
  checkout: 'Checkout',
  emptyCart: 'Your cart is empty',
  totalSavings: 'Total Savings',
  placeOrder: 'Place Order',
  paymentMethod: 'Payment Method',

  uploadRx: 'Upload Prescription',
  rxLocker: 'Prescription Locker',
  pendingReview: 'Pending Review',
  verified: 'Verified',
  rejected: 'Rejected',
  clarificationRequested: 'Clarification Requested',

  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  confirm: 'Confirm',
  loading: 'Loading…',
  noResults: 'No results found',
  viewAll: 'View All',
  download: 'Download',
  refresh: 'Refresh',
  acknowledge: 'Acknowledge',
};

// ── Hindi (हिन्दी) ────────────────────────────────────────────────────────────

const hi: Translations = {
  appName: 'जेनेरिकमेड',
  tagline: 'प्रमाणित जन औषधि एवं लाइसेंसी केमिस्ट बाज़ार',
  deliverTo: 'डिलीवरी',
  changeLocation: 'स्थान बदलें',
  cart: 'कार्ट',
  signIn: 'साइन इन',
  signOut: 'साइन आउट',
  register: 'रजिस्टर करें',
  myAccount: 'मेरा खाता',
  pharmacistPortal: 'फार्मासिस्ट पोर्टल',
  partnerPortal: 'पार्टनर पोर्टल',
  auditCockpit: 'ऑडिट कॉकपिट',
  authGateway: 'प्रमाणीकरण',
  helpline: 'फार्मासिस्ट हेल्पलाइन',
  prdSpecs: 'PRD विवरण',

  tabDiscover: 'खोजें',
  tabPrescriptions: 'नुस्खे',
  tabOrders: 'मेरे ऑर्डर',
  tabSavings: 'बचत और रिफिल',
  tabAccount: 'खाता',

  heroHeadline: 'लाइसेंसी केमिस्टों पर सत्यापित जेनेरिक दवा कीमतें तुलना करें',
  heroSubtext: 'क्रॉनिक और तीव्र दवाओं पर 85% तक बचाएं। जेनेरिक फॉर्मूलेशन में महंगी ब्रांडेड दवाओं जैसे ही सक्रिय अणु होते हैं।',
  heroUploadRx: 'नुस्खा अपलोड करें (तत्काल AI मिलान)',
  heroPricingLink: 'पारदर्शी मूल्य निर्धारण कैसे काम करता है',
  heroBadge: 'शून्य मार्कअप • भारतीय फार्माकोपिया (IP) प्रमाणित',
  heroSavings: '85% तक बचाएं',

  searchPlaceholder: "ब्रांड नाम से खोजें (जैसे 'डोलो 650', 'ग्लाइकोमेट') या सक्रिय नमक ('पैरासिटामॉल', 'मेटफॉर्मिन')...",
  searchBioEquivLabel: 'जैव-समतुल्यता इंजन:',
  searchBioEquivSuffix: 'को समान खुराक, शक्ति और नैदानिक प्रभावकारिता वाले प्रमाणित जेनेरिक भारतीय फार्माकोपिया समकक्षों से मिलाना।',
  searchAverageSaving: 'औसतन 75% कम लागत',
  searchResetFilters: 'फ़िल्टर रीसेट करें',
  searchShowing: 'दिखाया जा रहा है',
  searchSortedBy: 'क्रम: सबसे कम सत्यापित कुल लागत',
  searchBioEquivEngineLabel: 'जैव-समतुल्य दवाएं',

  catAll: 'सभी जेनेरिक दवाएं',
  catChronic: 'क्रॉनिक केयर',
  catDiabetes: 'मधुमेह',
  catHypertension: 'हृदय और रक्तचाप',
  catPain: 'दर्द और बुखार',
  catAcidity: 'एसिडिटी और GERD',
  catAntibiotics: 'एंटीबायोटिक्स',
  catAllergy: 'एलर्जी और अस्थमा',

  genericLabel: 'जेनेरिक',
  scheduleLabel: 'अनुसूची',
  prescriptionRequired: 'नुस्खा आवश्यक',
  savingsLabel: 'बचत',
  vsLabel: 'ब्रांडेड MRP की तुलना में',
  totalPayable: 'कुल देय',
  addToCart: 'कार्ट में जोड़ें',
  comparePrices: 'कीमतें तुलना करें',
  inStock: 'स्टॉक में',
  lowStock: 'कम स्टॉक',
  outOfStock: 'स्टॉक खत्म',
  lowestPrice: 'सबसे कम कीमत',
  deliveryIn: 'डिलीवरी',
  hours: 'घंटे',
  bioEquivalent: 'जैव-समतुल्य',

  cartTitle: 'आपकी कार्ट',
  checkout: 'चेकआउट',
  emptyCart: 'आपकी कार्ट खाली है',
  totalSavings: 'कुल बचत',
  placeOrder: 'ऑर्डर दें',
  paymentMethod: 'भुगतान विधि',

  uploadRx: 'नुस्खा अपलोड करें',
  rxLocker: 'नुस्खा लॉकर',
  pendingReview: 'समीक्षा प्रतीक्षित',
  verified: 'सत्यापित',
  rejected: 'अस्वीकृत',
  clarificationRequested: 'स्पष्टीकरण अनुरोधित',

  save: 'सहेजें',
  cancel: 'रद्द करें',
  close: 'बंद करें',
  confirm: 'पुष्टि करें',
  loading: 'लोड हो रहा है…',
  noResults: 'कोई परिणाम नहीं मिला',
  viewAll: 'सभी देखें',
  download: 'डाउनलोड',
  refresh: 'रिफ्रेश',
  acknowledge: 'स्वीकार करें',
};

// ── Marathi (मराठी) ───────────────────────────────────────────────────────────

const mr: Translations = {
  appName: 'जेनेरिकमेड',
  tagline: 'प्रमाणित जनऔषधि आणि परवानाधारक केमिस्ट बाजारपेठ',
  deliverTo: 'डिलिव्हरी',
  changeLocation: 'स्थान बदला',
  cart: 'कार्ट',
  signIn: 'साइन इन',
  signOut: 'साइन आउट',
  register: 'नोंदणी करा',
  myAccount: 'माझे खाते',
  pharmacistPortal: 'फार्मासिस्ट पोर्टल',
  partnerPortal: 'भागीदार पोर्टल',
  auditCockpit: 'ऑडिट कॉकपिट',
  authGateway: 'प्रमाणीकरण',
  helpline: 'फार्मासिस्ट हेल्पलाइन',
  prdSpecs: 'PRD तपशील',

  tabDiscover: 'शोधा',
  tabPrescriptions: 'प्रिस्क्रिप्शन',
  tabOrders: 'माझे ऑर्डर',
  tabSavings: 'बचत आणि रिफिल',
  tabAccount: 'खाते',

  heroHeadline: 'परवानाधारक केमिस्टांवर सत्यापित जेनेरिक औषध किमती तुलना करा',
  heroSubtext: 'जुनाट आणि तीव्र आजारांवरील औषधांवर 85% पर्यंत बचत करा। जेनेरिक फॉर्म्युलेशनमध्ये महाग ब्रँडेड औषधांसारखेच सक्रिय रेणू असतात।',
  heroUploadRx: 'प्रिस्क्रिप्शन अपलोड करा (त्वरित AI जुळणी)',
  heroPricingLink: 'पारदर्शक किंमत निर्धारण कसे कार्य करते',
  heroBadge: 'शून्य मार्कअप • भारतीय फार्माकोपिया (IP) प्रमाणित',
  heroSavings: '85% पर्यंत बचत करा',

  searchPlaceholder: "ब्रँड नावाने शोधा (उदा. 'डोलो 650', 'ग्लायकोमेट') किंवा सक्रिय क्षार ('पॅरासिटामॉल', 'मेटफॉर्मिन')...",
  searchBioEquivLabel: 'जैव-समतुल्यता इंजिन:',
  searchBioEquivSuffix: 'समान डोस, शक्ती आणि नैदानिक प्रभावीतेसह प्रमाणित जेनेरिक भारतीय फार्माकोपिया समकक्षांशी जुळवणे।',
  searchAverageSaving: 'सरासरी 75% कमी खर्च',
  searchResetFilters: 'फिल्टर रीसेट करा',
  searchShowing: 'दाखवत आहे',
  searchSortedBy: 'क्रम: सर्वात कमी सत्यापित एकूण खर्च',
  searchBioEquivEngineLabel: 'जैव-समतुल्य औषधे',

  catAll: 'सर्व जेनेरिक औषधे',
  catChronic: 'जुनाट आजार',
  catDiabetes: 'मधुमेह',
  catHypertension: 'हृदय आणि रक्तदाब',
  catPain: 'वेदना आणि ताप',
  catAcidity: 'आम्लपित्त आणि GERD',
  catAntibiotics: 'प्रतिजैविक',
  catAllergy: 'अॅलर्जी आणि दमा',

  genericLabel: 'जेनेरिक',
  scheduleLabel: 'अनुसूची',
  prescriptionRequired: 'प्रिस्क्रिप्शन आवश्यक',
  savingsLabel: 'बचत',
  vsLabel: 'ब्रँडेड MRP च्या तुलनेत',
  totalPayable: 'एकूण देय',
  addToCart: 'कार्टमध्ये जोडा',
  comparePrices: 'किमती तुलना करा',
  inStock: 'साठ्यात उपलब्ध',
  lowStock: 'कमी साठा',
  outOfStock: 'साठा संपला',
  lowestPrice: 'सर्वात कमी किंमत',
  deliveryIn: 'डिलिव्हरी',
  hours: 'तासांत',
  bioEquivalent: 'जैव-समतुल्य',

  cartTitle: 'तुमची कार्ट',
  checkout: 'चेकआउट',
  emptyCart: 'तुमची कार्ट रिकामी आहे',
  totalSavings: 'एकूण बचत',
  placeOrder: 'ऑर्डर द्या',
  paymentMethod: 'पेमेंट पद्धत',

  uploadRx: 'प्रिस्क्रिप्शन अपलोड करा',
  rxLocker: 'प्रिस्क्रिप्शन लॉकर',
  pendingReview: 'पुनरावलोकन प्रतीक्षित',
  verified: 'सत्यापित',
  rejected: 'नाकारले',
  clarificationRequested: 'स्पष्टीकरण विनंती',

  save: 'जतन करा',
  cancel: 'रद्द करा',
  close: 'बंद करा',
  confirm: 'पुष्टी करा',
  loading: 'लोड होत आहे…',
  noResults: 'कोणते परिणाम आढळले नाहीत',
  viewAll: 'सर्व पहा',
  download: 'डाउनलोड',
  refresh: 'रिफ्रेश',
  acknowledge: 'मान्य करा',
};

// ── Tamil (தமிழ்) ─────────────────────────────────────────────────────────────

const ta: Translations = {
  appName: 'ஜெனெரிக்மெட்',
  tagline: 'சான்றளிக்கப்பட்ட ஜன் ஔஷதி மற்றும் உரிமம் பெற்ற மருந்தகச் சந்தை',
  deliverTo: 'டெலிவரி',
  changeLocation: 'இடத்தை மாற்று',
  cart: 'கார்ட்',
  signIn: 'உள்நுழை',
  signOut: 'வெளியேறு',
  register: 'பதிவு செய்',
  myAccount: 'என் கணக்கு',
  pharmacistPortal: 'மருந்தாளர் போர்டல்',
  partnerPortal: 'பங்காளர் போர்டல்',
  auditCockpit: 'தணிக்கை கண்ணகம்',
  authGateway: 'அங்கீகாரம்',
  helpline: 'மருந்தாளர் உதவி மையம்',
  prdSpecs: 'PRD விவரக்குறிப்பு',

  tabDiscover: 'கண்டறி',
  tabPrescriptions: 'மருந்துச் சீட்டுகள்',
  tabOrders: 'என் ஆர்டர்கள்',
  tabSavings: 'சேமிப்பு & ரீஃபில்',
  tabAccount: 'கணக்கு',

  heroHeadline: 'உரிமம் பெற்ற மருந்தகங்களில் சரிபார்க்கப்பட்ட ஜெனெரிக் மருந்து விலைகளை ஒப்பிடுக',
  heroSubtext: 'நாள்பட்ட மற்றும் கடுமையான மருந்துகளில் 85% வரை சேமிக்கலாம். ஜெனெரிக் மருந்துகளில் விலையுயர்ந்த பிராண்டட் மருந்துகளைப் போலவே செயலில் உள்ள மூலக்கூறுகள் உள்ளன.',
  heroUploadRx: 'மருந்துச் சீட்டை பதிவேற்று (உடனடி AI பொருத்தம்)',
  heroPricingLink: 'வெளிப்படையான விலை நிர்ணயம் எவ்வாறு செயல்படுகிறது',
  heroBadge: 'பூஜ்ய மார்க்அப் • இந்திய மருந்துத்தொகுப்பு (IP) சான்றிதழ்',
  heroSavings: '85% வரை சேமிக்கலாம்',

  searchPlaceholder: "பிராண்ட் பெயரில் தேடுங்கள் (எ.கா. 'டோலோ 650', 'கிளைகோமெட்') அல்லது செயலில் உள்ள உப்பு ('பாராசிட்டமால்', 'மெட்ஃபார்மின்')...",
  searchBioEquivLabel: 'உயிரியல் சமதுல்ய இயந்திரம்:',
  searchBioEquivSuffix: 'ஒரே மாத்திரை அளவு, வலிமை மற்றும் மருத்துவ செயல்திறன் கொண்ட சான்றளிக்கப்பட்ட ஜெனெரிக் இந்திய மருந்துத்தொகுப்பு சமகக்களுடன் பொருத்துதல்.',
  searchAverageSaving: 'சராசரியாக 75% குறைந்த செலவு',
  searchResetFilters: 'வடிப்பான்களை மீட்டமை',
  searchShowing: 'காட்டுகிறது',
  searchSortedBy: 'வரிசை: குறைந்த சரிபார்க்கப்பட்ட மொத்த செலவு',
  searchBioEquivEngineLabel: 'உயிரியல் சமதுல்ய மருந்துகள்',

  catAll: 'அனைத்து ஜெனெரிக் மருந்துகள்',
  catChronic: 'நாள்பட்ட பராமரிப்பு',
  catDiabetes: 'நீரிழிவு',
  catHypertension: 'இதயம் & இரத்த அழுத்தம்',
  catPain: 'வலி & காய்ச்சல்',
  catAcidity: 'அமிலத்தன்மை & GERD',
  catAntibiotics: 'நுண்ணுயிர் எதிர்ப்பிகள்',
  catAllergy: 'ஒவ்வாமை & ஆஸ்துமா',

  genericLabel: 'ஜெனெரிக்',
  scheduleLabel: 'அட்டவணை',
  prescriptionRequired: 'மருந்துச் சீட்டு தேவை',
  savingsLabel: 'சேமிப்பு',
  vsLabel: 'பிராண்டட் MRP க்கு எதிராக',
  totalPayable: 'மொத்த செலுத்த வேண்டியது',
  addToCart: 'கார்ட்டில் சேர்',
  comparePrices: 'விலைகளை ஒப்பிடு',
  inStock: 'கையிருப்பில் உள்ளது',
  lowStock: 'குறைந்த கையிருப்பு',
  outOfStock: 'கையிருப்பு இல்லை',
  lowestPrice: 'குறைந்த விலை',
  deliveryIn: 'டெலிவரி',
  hours: 'மணி நேரத்தில்',
  bioEquivalent: 'உயிரியல் சமதுல்யம்',

  cartTitle: 'உங்கள் கார்ட்',
  checkout: 'செக்அவுட்',
  emptyCart: 'உங்கள் கார்ட் காலியாக உள்ளது',
  totalSavings: 'மொத்த சேமிப்பு',
  placeOrder: 'ஆர்டர் கொடு',
  paymentMethod: 'கட்டண முறை',

  uploadRx: 'மருந்துச் சீட்டை பதிவேற்று',
  rxLocker: 'மருந்துச் சீட்டு லாக்கர்',
  pendingReview: 'மதிப்பாய்வு நிலுவையில்',
  verified: 'சரிபார்க்கப்பட்டது',
  rejected: 'நிராகரிக்கப்பட்டது',
  clarificationRequested: 'தெளிவுபடுத்தல் கோரப்பட்டது',

  save: 'சேமி',
  cancel: 'ரத்து செய்',
  close: 'மூடு',
  confirm: 'உறுதிப்படுத்து',
  loading: 'ஏற்றுகிறது…',
  noResults: 'முடிவுகள் எதுவும் கிடைக்கவில்லை',
  viewAll: 'அனைத்தையும் பார்',
  download: 'பதிவிறக்கம்',
  refresh: 'புதுப்பி',
  acknowledge: 'ஒப்புக்கொள்',
};

// ── Telugu (తెలుగు) ───────────────────────────────────────────────────────────

const te: Translations = {
  appName: 'జెనెరిక్‌మెడ్',
  tagline: 'ధృవీకరించిన జన్ ఔషధి మరియు లైసెన్స్ పొందిన కెమిస్ట్ మార్కెట్‌ప్లేస్',
  deliverTo: 'డెలివరీ',
  changeLocation: 'స్థానాన్ని మార్చు',
  cart: 'కార్ట్',
  signIn: 'సైన్ ఇన్',
  signOut: 'సైన్ అవుట్',
  register: 'నమోదు చేయండి',
  myAccount: 'నా ఖాతా',
  pharmacistPortal: 'ఫార్మాసిస్ట్ పోర్టల్',
  partnerPortal: 'భాగస్వామి పోర్టల్',
  auditCockpit: 'ఆడిట్ కాక్‌పిట్',
  authGateway: 'ప్రామాణీకరణ',
  helpline: 'ఫార్మాసిస్ట్ హెల్ప్‌లైన్',
  prdSpecs: 'PRD వివరాలు',

  tabDiscover: 'కనుగొనండి',
  tabPrescriptions: 'ప్రిస్క్రిప్షన్లు',
  tabOrders: 'నా ఆర్డర్లు',
  tabSavings: 'ఆదా & రీఫిల్',
  tabAccount: 'ఖాతా',

  heroHeadline: 'లైసెన్స్ పొందిన కెమిస్టుల వద్ద ధృవీకరించిన జెనెరిక్ మందుల ధరలను పోల్చండి',
  heroSubtext: 'దీర్ఘకాలిక మరియు తీవ్రమైన మందులపై 85% వరకు ఆదా చేయండి. జెనెరిక్ ఫార్ములేషన్లలో ఖరీదైన బ్రాండెడ్ వాటిలాంటి సక్రియ అణువులు ఉంటాయి.',
  heroUploadRx: 'ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి (తక్షణ AI జతకట్టడం)',
  heroPricingLink: 'పారదర్శక ధర నిర్ణయం ఎలా పని చేస్తుందో చూడండి',
  heroBadge: 'సున్నా మార్కప్ • భారతీయ ఫార్మాకోపియా (IP) ధృవీకృత',
  heroSavings: '85% వరకు ఆదా చేయండి',

  searchPlaceholder: "బ్రాండ్ పేరుతో వెతకండి (ఉదా. 'డోలో 650', 'గ్లైకోమెట్') లేదా క్రియాశీల లవణం ('పారాసిటమాల్', 'మెట్‌ఫార్మిన్')...",
  searchBioEquivLabel: 'జీవ-సమతుల్య ఇంజిన్:',
  searchBioEquivSuffix: 'ఒకే మోతాదు, శక్తి మరియు వైద్య సమర్థత కలిగిన ధృవీకృత జెనెరిక్ భారతీయ ఫార్మాకోపియా సమకాలీనులతో సరిపోల్చడం.',
  searchAverageSaving: 'సగటున 75% తక్కువ ఖర్చు',
  searchResetFilters: 'ఫిల్టర్‌లు రీసెట్ చేయండి',
  searchShowing: 'చూపుతోంది',
  searchSortedBy: 'క్రమం: తక్కువ ధృవీకృత మొత్తం ఖర్చు',
  searchBioEquivEngineLabel: 'జీవ-సమతుల్య మందులు',

  catAll: 'అన్ని జెనెరిక్ మందులు',
  catChronic: 'దీర్ఘకాలిక సంరక్షణ',
  catDiabetes: 'మధుమేహం',
  catHypertension: 'హృదయం & రక్తపోటు',
  catPain: 'నొప్పి & జ్వరం',
  catAcidity: 'అమ్లత్వం & GERD',
  catAntibiotics: 'యాంటీబయాటిక్స్',
  catAllergy: 'అలెర్జీ & అస్తమా',

  genericLabel: 'జెనెరిక్',
  scheduleLabel: 'షెడ్యూల్',
  prescriptionRequired: 'ప్రిస్క్రిప్షన్ అవసరం',
  savingsLabel: 'ఆదా',
  vsLabel: 'బ్రాండెడ్ MRP తో పోల్చి',
  totalPayable: 'మొత్తం చెల్లించవలసినది',
  addToCart: 'కార్ట్‌కు జోడించు',
  comparePrices: 'ధరలు పోల్చండి',
  inStock: 'స్టాక్‌లో ఉంది',
  lowStock: 'తక్కువ స్టాక్',
  outOfStock: 'స్టాక్ లేదు',
  lowestPrice: 'అత్యల్ప ధర',
  deliveryIn: 'డెలివరీ',
  hours: 'గంటల్లో',
  bioEquivalent: 'జీవ-సమతుల్య',

  cartTitle: 'మీ కార్ట్',
  checkout: 'చెక్అవుట్',
  emptyCart: 'మీ కార్ట్ ఖాళీగా ఉంది',
  totalSavings: 'మొత్తం ఆదా',
  placeOrder: 'ఆర్డర్ చేయండి',
  paymentMethod: 'చెల్లింపు పద్ధతి',

  uploadRx: 'ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి',
  rxLocker: 'ప్రిస్క్రిప్షన్ లాకర్',
  pendingReview: 'సమీక్ష పెండింగ్',
  verified: 'ధృవీకరించబడింది',
  rejected: 'తిరస్కరించబడింది',
  clarificationRequested: 'వివరణ అభ్యర్థించబడింది',

  save: 'సేవ్ చేయి',
  cancel: 'రద్దు చేయి',
  close: 'మూసివేయి',
  confirm: 'నిర్ధారించు',
  loading: 'లోడ్ అవుతోంది…',
  noResults: 'ఫలితాలు ఏమీ కనుగొనబడలేదు',
  viewAll: 'అన్నీ చూడు',
  download: 'డౌన్‌లోడ్',
  refresh: 'రిఫ్రెష్',
  acknowledge: 'అంగీకరించు',
};

// ── Kannada (ಕನ್ನಡ) ──────────────────────────────────────────────────────────

const kn: Translations = {
  appName: 'ಜೆನೆರಿಕ್‌ಮೆಡ್',
  tagline: 'ಪ್ರಮಾಣಿತ ಜನ ಔಷಧಿ ಮತ್ತು ಪರವಾನಗಿ ಪಡೆದ ಕೆಮಿಸ್ಟ್ ಮಾರುಕಟ್ಟೆ',
  deliverTo: 'ಡೆಲಿವರಿ',
  changeLocation: 'ಸ್ಥಳ ಬದಲಿಸಿ',
  cart: 'ಕಾರ್ಟ್',
  signIn: 'ಸೈನ್ ಇನ್',
  signOut: 'ಸೈನ್ ಔಟ್',
  register: 'ನೋಂದಾಯಿಸಿ',
  myAccount: 'ನನ್ನ ಖಾತೆ',
  pharmacistPortal: 'ಫಾರ್ಮಾಸಿಸ್ಟ್ ಪೋರ್ಟಲ್',
  partnerPortal: 'ಭಾಗೀದಾರ ಪೋರ್ಟಲ್',
  auditCockpit: 'ಆಡಿಟ್ ಕಾಕ್‌ಪಿಟ್',
  authGateway: 'ದೃಢೀಕರಣ',
  helpline: 'ಫಾರ್ಮಾಸಿಸ್ಟ್ ಹೆಲ್ಪ್‌ಲೈನ್',
  prdSpecs: 'PRD ವಿವರಗಳು',

  tabDiscover: 'ಅನ್ವೇಷಿಸಿ',
  tabPrescriptions: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು',
  tabOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
  tabSavings: 'ಉಳಿತಾಯ & ರೀಫಿಲ್',
  tabAccount: 'ಖಾತೆ',

  heroHeadline: 'ಪರವಾನಗಿ ಪಡೆದ ಕೆಮಿಸ್ಟ್‌ಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಿದ ಜೆನೆರಿಕ್ ಔಷಧ ಬೆಲೆಗಳನ್ನು ಹೋಲಿಸಿ',
  heroSubtext: 'ದೀರ್ಘಕಾಲೀನ ಮತ್ತು ತೀವ್ರ ಔಷಧಗಳ ಮೇಲೆ 85% ವರೆಗೆ ಉಳಿಸಿ. ಜೆನೆರಿಕ್ ಫಾರ್ಮ್ಯುಲೇಷನ್‌ಗಳಲ್ಲಿ ದುಬಾರಿ ಬ್ರ್ಯಾಂಡೆಡ್ ಔಷಧಗಳಂತೆಯೇ ಸಕ್ರಿಯ ಅಣುಗಳಿವೆ.',
  heroUploadRx: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ತಕ್ಷಣ AI ಹೊಂದಾಣಿಕೆ)',
  heroPricingLink: 'ಪಾರದರ್ಶಕ ಬೆಲೆ ನಿರ್ಧಾರ ಹೇಗೆ ಕಾರ್ಯ ನಿರ್ವಹಿಸುತ್ತದೆ',
  heroBadge: 'ಶೂನ್ಯ ಮಾರ್ಕಪ್ • ಭಾರತೀಯ ಫಾರ್ಮಾಕೋಪಿಯಾ (IP) ಪ್ರಮಾಣಿತ',
  heroSavings: '85% ವರೆಗೆ ಉಳಿಸಿ',

  searchPlaceholder: "ಬ್ರ್ಯಾಂಡ್ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ (ಉದಾ. 'ಡೋಲೊ 650', 'ಗ್ಲೈಕೋಮೆಟ್') ಅಥವಾ ಸಕ್ರಿಯ ಲವಣ ('ಪ್ಯಾರಾಸಿಟಮಾಲ್', 'ಮೆಟ್‌ಫಾರ್ಮಿನ್')...",
  searchBioEquivLabel: 'ಜೈವಿಕ-ಸಮತುಲ್ಯ ಇಂಜಿನ್:',
  searchBioEquivSuffix: 'ಒಂದೇ ಮೋಸತೆ, ಶಕ್ತಿ ಮತ್ತು ವೈದ್ಯಕೀಯ ಪರಿಣಾಮಕಾರಿತ್ವದ ಪ್ರಮಾಣಿತ ಜೆನೆರಿಕ್ ಭಾರತೀಯ ಫಾರ್ಮಾಕೋಪಿಯಾ ಸಮಕಕ್ಷಿಗಳೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆ.',
  searchAverageSaving: 'ಸರಾಸರಿ 75% ಕಡಿಮೆ ವೆಚ್ಚ',
  searchResetFilters: 'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ರೀಸೆಟ್ ಮಾಡಿ',
  searchShowing: 'ತೋರಿಸುತ್ತಿದೆ',
  searchSortedBy: 'ಕ್ರಮ: ಕಡಿಮೆ ಪರಿಶೀಲಿಸಿದ ಒಟ್ಟು ವೆಚ್ಚ',
  searchBioEquivEngineLabel: 'ಜೈವಿಕ-ಸಮತುಲ್ಯ ಔಷಧಗಳು',

  catAll: 'ಎಲ್ಲಾ ಜೆನೆರಿಕ್ ಔಷಧಗಳು',
  catChronic: 'ದೀರ್ಘಕಾಲೀನ ಆರೈಕೆ',
  catDiabetes: 'ಮಧುಮೇಹ',
  catHypertension: 'ಹೃದಯ & ರಕ್ತದೊತ್ತಡ',
  catPain: 'ನೋವು & ಜ್ವರ',
  catAcidity: 'ಆಮ್ಲೀಯತೆ & GERD',
  catAntibiotics: 'ಪ್ರತಿಜೀವಕಗಳು',
  catAllergy: 'ಅಲರ್ಜಿ & ಆಸ್ತಮಾ',

  genericLabel: 'ಜೆನೆರಿಕ್',
  scheduleLabel: 'ಶೆಡ್ಯೂಲ್',
  prescriptionRequired: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಗತ್ಯ',
  savingsLabel: 'ಉಳಿತಾಯ',
  vsLabel: 'ಬ್ರ್ಯಾಂಡೆಡ್ MRP ಗೆ ಹೋಲಿಸಿ',
  totalPayable: 'ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ',
  addToCart: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
  comparePrices: 'ಬೆಲೆಗಳನ್ನು ಹೋಲಿಸಿ',
  inStock: 'ದಾಸ್ತಾನಿನಲ್ಲಿ ಇದೆ',
  lowStock: 'ಕಡಿಮೆ ದಾಸ್ತಾನು',
  outOfStock: 'ದಾಸ್ತಾನು ಇಲ್ಲ',
  lowestPrice: 'ಅತ್ಯಂತ ಕಡಿಮೆ ಬೆಲೆ',
  deliveryIn: 'ಡೆಲಿವರಿ',
  hours: 'ಗಂಟೆಗಳಲ್ಲಿ',
  bioEquivalent: 'ಜೈವಿಕ-ಸಮತುಲ್ಯ',

  cartTitle: 'ನಿಮ್ಮ ಕಾರ್ಟ್',
  checkout: 'ಚೆಕ್‌ಔಟ್',
  emptyCart: 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ',
  totalSavings: 'ಒಟ್ಟು ಉಳಿತಾಯ',
  placeOrder: 'ಆರ್ಡರ್ ನೀಡಿ',
  paymentMethod: 'ಪಾವತಿ ವಿಧಾನ',

  uploadRx: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
  rxLocker: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಲಾಕರ್',
  pendingReview: 'ಪರಿಶೀಲನೆ ಬಾಕಿ',
  verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
  rejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
  clarificationRequested: 'ಸ್ಪಷ್ಟೀಕರಣ ಕೋರಲಾಗಿದೆ',

  save: 'ಉಳಿಸಿ',
  cancel: 'ರದ್ದು ಮಾಡಿ',
  close: 'ಮುಚ್ಚಿ',
  confirm: 'ದೃಢಪಡಿಸಿ',
  loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
  noResults: 'ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
  viewAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
  download: 'ಡೌನ್‌ಲೋಡ್',
  refresh: 'ರಿಫ್ರೆಶ್',
  acknowledge: 'ಒಪ್ಪಿಕೊಳ್ಳಿ',
};

// ── Bengali (বাংলা) ───────────────────────────────────────────────────────────

const bn: Translations = {
  appName: 'জেনেরিকমেড',
  tagline: 'সার্টিফাইড জন ঔষধি ও লাইসেন্সপ্রাপ্ত কেমিস্ট মার্কেটপ্লেস',
  deliverTo: 'ডেলিভারি',
  changeLocation: 'অবস্থান পরিবর্তন',
  cart: 'কার্ট',
  signIn: 'সাইন ইন',
  signOut: 'সাইন আউট',
  register: 'নিবন্ধন করুন',
  myAccount: 'আমার অ্যাকাউন্ট',
  pharmacistPortal: 'ফার্মাসিস্ট পোর্টাল',
  partnerPortal: 'পার্টনার পোর্টাল',
  auditCockpit: 'অডিট কক্‌পিট',
  authGateway: 'প্রমাণীকরণ',
  helpline: 'ফার্মাসিস্ট হেল্পলাইন',
  prdSpecs: 'PRD বিবরণ',

  tabDiscover: 'আবিষ্কার করুন',
  tabPrescriptions: 'প্রেসক্রিপশন',
  tabOrders: 'আমার অর্ডার',
  tabSavings: 'সঞ্চয় ও রিফিল',
  tabAccount: 'অ্যাকাউন্ট',

  heroHeadline: 'লাইসেন্সপ্রাপ্ত কেমিস্টদের কাছে যাচাইকৃত জেনেরিক ওষুধের দাম তুলনা করুন',
  heroSubtext: 'দীর্ঘমেয়াদী ও তীব্র ওষুধে ৮৫% পর্যন্ত সঞ্চয় করুন। জেনেরিক ফর্মুলেশনে ব্যয়বহুল ব্র্যান্ডেড ওষুধের মতোই সক্রিয় অণু রয়েছে।',
  heroUploadRx: 'প্রেসক্রিপশন আপলোড করুন (তাৎক্ষণিক AI মিল)',
  heroPricingLink: 'স্বচ্ছ মূল্য নির্ধারণ কীভাবে কাজ করে',
  heroBadge: 'শূন্য মার্কআপ • ভারতীয় ফার্মাকোপিয়া (IP) সার্টিফাইড',
  heroSavings: '৮৫% পর্যন্ত সঞ্চয়',

  searchPlaceholder: "ব্র্যান্ড নামে খুঁজুন (যেমন 'ডলো ৬৫০', 'গ্লাইকোমেট') বা সক্রিয় লবণ ('প্যারাসিটামল', 'মেটফর্মিন')...",
  searchBioEquivLabel: 'জৈব-সমতুল্য ইঞ্জিন:',
  searchBioEquivSuffix: 'একই ডোজ, শক্তি এবং ক্লিনিকাল কার্যকারিতা সহ প্রমাণিত জেনেরিক ভারতীয় ফার্মাকোপিয়া সমকক্ষের সাথে মেলানো।',
  searchAverageSaving: 'গড়ে ৭৫% কম খরচ',
  searchResetFilters: 'ফিল্টার রিসেট করুন',
  searchShowing: 'দেখাচ্ছে',
  searchSortedBy: 'ক্রম: সর্বনিম্ন যাচাইকৃত মোট খরচ',
  searchBioEquivEngineLabel: 'জৈব-সমতুল্য ওষুধ',

  catAll: 'সব জেনেরিক ওষুধ',
  catChronic: 'দীর্ঘমেয়াদী যত্ন',
  catDiabetes: 'ডায়াবেটিস',
  catHypertension: 'হৃদয় ও রক্তচাপ',
  catPain: 'ব্যথা ও জ্বর',
  catAcidity: 'অম্লতা ও GERD',
  catAntibiotics: 'অ্যান্টিবায়োটিক',
  catAllergy: 'অ্যালার্জি ও অ্যাজমা',

  genericLabel: 'জেনেরিক',
  scheduleLabel: 'সময়সূচি',
  prescriptionRequired: 'প্রেসক্রিপশন প্রয়োজন',
  savingsLabel: 'সঞ্চয়',
  vsLabel: 'ব্র্যান্ডেড MRP এর বিপরীতে',
  totalPayable: 'মোট পরিশোধযোগ্য',
  addToCart: 'কার্টে যোগ করুন',
  comparePrices: 'দাম তুলনা করুন',
  inStock: 'স্টকে আছে',
  lowStock: 'কম স্টক',
  outOfStock: 'স্টক নেই',
  lowestPrice: 'সর্বনিম্ন দাম',
  deliveryIn: 'ডেলিভারি',
  hours: 'ঘণ্টায়',
  bioEquivalent: 'জৈব-সমতুল্য',

  cartTitle: 'আপনার কার্ট',
  checkout: 'চেকআউট',
  emptyCart: 'আপনার কার্ট খালি',
  totalSavings: 'মোট সঞ্চয়',
  placeOrder: 'অর্ডার করুন',
  paymentMethod: 'পেমেন্ট পদ্ধতি',

  uploadRx: 'প্রেসক্রিপশন আপলোড করুন',
  rxLocker: 'প্রেসক্রিপশন লকার',
  pendingReview: 'পর্যালোচনা মুলতুবি',
  verified: 'যাচাইকৃত',
  rejected: 'প্রত্যাখ্যাত',
  clarificationRequested: 'স্পষ্টীকরণ অনুরোধ করা হয়েছে',

  save: 'সংরক্ষণ',
  cancel: 'বাতিল',
  close: 'বন্ধ করুন',
  confirm: 'নিশ্চিত করুন',
  loading: 'লোড হচ্ছে…',
  noResults: 'কোনো ফলাফল পাওয়া যায়নি',
  viewAll: 'সব দেখুন',
  download: 'ডাউনলোড',
  refresh: 'রিফ্রেশ',
  acknowledge: 'স্বীকার করুন',
};

// ── Translation registry ──────────────────────────────────────────────────────

export const TRANSLATIONS: Record<Locale, Translations> = { en, hi, mr, ta, te, kn, bn };

// ── React Context ─────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: TRANSLATIONS.en,
});

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('genericmed_locale');
    return (saved as Locale) || 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('genericmed_locale', newLocale);
  }, []);

  return React.createElement(
    LocaleContext.Provider,
    { value: { locale, setLocale, t: TRANSLATIONS[locale] } },
    children
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
