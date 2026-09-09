export interface RegionalDeliveryZone {
  id: string;
  name: string;
  subRegion: string;
  zoneCluster: 'MMR (Mumbai)' | 'Pune' | 'Delhi NCR' | 'Bengaluru' | 'Hyderabad';
  state: string;
  coordinates: {
    lat: number;
    lng: number;
    svgX: number; // Normalized coordinate for spatial SVG canvas (0-1000)
    svgY: number; // Normalized coordinate for spatial SVG canvas (0-600)
  };
  totalOrders: number;
  rxOrders: number;
  avgDeliveryMinutes: number;
  coldChainPercentage: number;
  totalSavingsInr: number;
  activeCouriers: number;
  activePharmacies: number;
  concentrationLevel: 'Low' | 'Moderate' | 'High' | 'Surge / Peak';
  timeSlotConcentration: {
    'Morning (06-10)': number;
    'OPD Peak (10-14)': number;
    'Afternoon (14-18)': number;
    'Evening Rush (18-22)': number;
    'Night Emergency (22-06)': number;
  };
  topPincodes: Array<{
    pincode: string;
    area: string;
    orders: number;
    concentrationRatio: number;
  }>;
  keyInstitutions: string[];
  logisticsHub: string;
}

export const REGIONAL_DELIVERY_DATA: RegionalDeliveryZone[] = [
  {
    id: 'reg-mumbai-south',
    name: 'South Mumbai Heritage & Business District',
    subRegion: 'Colaba, Fort, Nariman Point, Marine Lines, Malabar Hill',
    zoneCluster: 'MMR (Mumbai)',
    state: 'Maharashtra',
    coordinates: {
      lat: 18.9388,
      lng: 72.8354,
      svgX: 180,
      svgY: 420,
    },
    totalOrders: 642,
    rxOrders: 512,
    avgDeliveryMinutes: 38,
    coldChainPercentage: 24.5,
    totalSavingsInr: 284300,
    activeCouriers: 18,
    activePharmacies: 9,
    concentrationLevel: 'High',
    timeSlotConcentration: {
      'Morning (06-10)': 65,
      'OPD Peak (10-14)': 195,
      'Afternoon (14-18)': 142,
      'Evening Rush (18-22)': 198,
      'Night Emergency (22-06)': 42,
    },
    topPincodes: [
      { pincode: '400001', area: 'Fort / Ballard Estate', orders: 184, concentrationRatio: 0.88 },
      { pincode: '400005', area: 'Colaba / Cuffe Parade', orders: 162, concentrationRatio: 0.82 },
      { pincode: '400020', area: 'Marine Lines / Churchgate', orders: 156, concentrationRatio: 0.79 },
      { pincode: '400006', area: 'Malabar Hill / Walkeshwar', orders: 140, concentrationRatio: 0.74 },
    ],
    keyInstitutions: ['Bombay Hospital', 'GT Hospital', 'St George Hospital', 'Breach Candy'],
    logisticsHub: 'Colaba PM Jan Aushadhi Hub & Marine Lines Dispatch Point',
  },
  {
    id: 'reg-mumbai-central',
    name: 'Central Mumbai Hospital Corridor & Lower Parel',
    subRegion: 'Parel, KEM Hospital Belt, Lower Parel, Dadar, Prabhadevi',
    zoneCluster: 'MMR (Mumbai)',
    state: 'Maharashtra',
    coordinates: {
      lat: 19.0016,
      lng: 72.8436,
      svgX: 230,
      svgY: 340,
    },
    totalOrders: 984,
    rxOrders: 820,
    avgDeliveryMinutes: 28,
    coldChainPercentage: 38.2,
    totalSavingsInr: 492000,
    activeCouriers: 32,
    activePharmacies: 14,
    concentrationLevel: 'Surge / Peak',
    timeSlotConcentration: {
      'Morning (06-10)': 110,
      'OPD Peak (10-14)': 340,
      'Afternoon (14-18)': 215,
      'Evening Rush (18-22)': 265,
      'Night Emergency (22-06)': 54,
    },
    topPincodes: [
      { pincode: '400012', area: 'Parel / KEM Hospital', orders: 312, concentrationRatio: 0.98 },
      { pincode: '400013', area: 'Lower Parel / Currey Road', orders: 258, concentrationRatio: 0.91 },
      { pincode: '400028', area: 'Dadar West / Shivaji Park', orders: 224, concentrationRatio: 0.84 },
      { pincode: '400025', area: 'Prabhadevi / Siddhivinayak', orders: 190, concentrationRatio: 0.78 },
    ],
    keyInstitutions: ['KEM Hospital', 'Tata Memorial Hospital', 'Hinduja Hospital Dadar', 'Wadia Childrens Hospital'],
    logisticsHub: 'Parel Super-Specialty Generic Central Fulfillment Depot',
  },
  {
    id: 'reg-mumbai-western',
    name: 'Western Suburbs & BKC Commercial Core',
    subRegion: 'Bandra West, BKC, Khar, Santacruz, Andheri West, Juhu',
    zoneCluster: 'MMR (Mumbai)',
    state: 'Maharashtra',
    coordinates: {
      lat: 19.0596,
      lng: 72.8295,
      svgX: 200,
      svgY: 240,
    },
    totalOrders: 840,
    rxOrders: 690,
    avgDeliveryMinutes: 32,
    coldChainPercentage: 29.8,
    totalSavingsInr: 410200,
    activeCouriers: 26,
    activePharmacies: 12,
    concentrationLevel: 'Surge / Peak',
    timeSlotConcentration: {
      'Morning (06-10)': 95,
      'OPD Peak (10-14)': 245,
      'Afternoon (14-18)': 185,
      'Evening Rush (18-22)': 275,
      'Night Emergency (22-06)': 40,
    },
    topPincodes: [
      { pincode: '400050', area: 'Bandra West / Hill Road', orders: 270, concentrationRatio: 0.92 },
      { pincode: '400051', area: 'Bandra Kurla Complex (BKC)', orders: 220, concentrationRatio: 0.86 },
      { pincode: '400058', area: 'Andheri West / Lokhandwala', orders: 215, concentrationRatio: 0.85 },
      { pincode: '400049', area: 'Juhu / JVPD Scheme', orders: 135, concentrationRatio: 0.69 },
    ],
    keyInstitutions: ['Lilavati Hospital', 'Asian Heart Institute (BKC)', 'Nanavati Max Hospital', 'Holy Family'],
    logisticsHub: 'BKC Express Pharmacy Junction & Andheri Crossway Hub',
  },
  {
    id: 'reg-mumbai-eastern-thane',
    name: 'Eastern Corridor & Thane Industrial Belt',
    subRegion: 'Ghatkopar, Chembur, Mulund, Thane West, Majiwada',
    zoneCluster: 'MMR (Mumbai)',
    state: 'Maharashtra',
    coordinates: {
      lat: 19.1860,
      lng: 72.9759,
      svgX: 310,
      svgY: 180,
    },
    totalOrders: 620,
    rxOrders: 490,
    avgDeliveryMinutes: 44,
    coldChainPercentage: 19.2,
    totalSavingsInr: 322400,
    activeCouriers: 20,
    activePharmacies: 10,
    concentrationLevel: 'High',
    timeSlotConcentration: {
      'Morning (06-10)': 70,
      'OPD Peak (10-14)': 165,
      'Afternoon (14-18)': 130,
      'Evening Rush (18-22)': 215,
      'Night Emergency (22-06)': 40,
    },
    topPincodes: [
      { pincode: '400601', area: 'Thane West Station Circle', orders: 195, concentrationRatio: 0.81 },
      { pincode: '400077', area: 'Ghatkopar East / Pant Nagar', orders: 160, concentrationRatio: 0.76 },
      { pincode: '400080', area: 'Mulund West / LBS Marg', orders: 145, concentrationRatio: 0.72 },
      { pincode: '400071', area: 'Chembur / Diamond Garden', orders: 120, concentrationRatio: 0.65 },
    ],
    keyInstitutions: ['Jupiter Hospital Thane', 'Godrej Memorial Vikhroli', 'Fortis Hospital Mulund'],
    logisticsHub: 'Thane West Central Jan Aushadhi & Cold-Pack Depository',
  },
  {
    id: 'reg-navi-mumbai',
    name: 'Navi Mumbai Planned Nodes & Cold Warehouse Hub',
    subRegion: 'Vashi, Nerul, Belapur, Kharghar, Airoli',
    zoneCluster: 'MMR (Mumbai)',
    state: 'Maharashtra',
    coordinates: {
      lat: 19.0330,
      lng: 73.0297,
      svgX: 350,
      svgY: 280,
    },
    totalOrders: 490,
    rxOrders: 380,
    avgDeliveryMinutes: 36,
    coldChainPercentage: 32.1,
    totalSavingsInr: 260500,
    activeCouriers: 16,
    activePharmacies: 8,
    concentrationLevel: 'Moderate',
    timeSlotConcentration: {
      'Morning (06-10)': 55,
      'OPD Peak (10-14)': 130,
      'Afternoon (14-18)': 110,
      'Evening Rush (18-22)': 165,
      'Night Emergency (22-06)': 30,
    },
    topPincodes: [
      { pincode: '400703', area: 'Vashi Sector 17 / APMC', orders: 165, concentrationRatio: 0.78 },
      { pincode: '400706', area: 'Nerul West / Seawoods', orders: 125, concentrationRatio: 0.69 },
      { pincode: '400710', area: 'Kharghar Node / Hiranandani', orders: 110, concentrationRatio: 0.64 },
      { pincode: '400614', area: 'CBD Belapur / Konkan Bhavan', orders: 90, concentrationRatio: 0.58 },
    ],
    keyInstitutions: ['Apollo Hospitals Navi Mumbai', 'MGM New Bombay Hospital', 'DY Patil Hospital Nerul'],
    logisticsHub: 'APMC Vashi Cold-Chain Pharma Logistics Gate',
  },
  {
    id: 'reg-pune-central',
    name: 'Pune Urban & Healthcare Belt',
    subRegion: 'Shivajinagar, Kothrud, Deccan Gymkhana, Swargate, Camp',
    zoneCluster: 'Pune',
    state: 'Maharashtra',
    coordinates: {
      lat: 18.5204,
      lng: 73.8567,
      svgX: 470,
      svgY: 390,
    },
    totalOrders: 710,
    rxOrders: 580,
    avgDeliveryMinutes: 34,
    coldChainPercentage: 27.4,
    totalSavingsInr: 365800,
    activeCouriers: 22,
    activePharmacies: 11,
    concentrationLevel: 'High',
    timeSlotConcentration: {
      'Morning (06-10)': 80,
      'OPD Peak (10-14)': 210,
      'Afternoon (14-18)': 155,
      'Evening Rush (18-22)': 225,
      'Night Emergency (22-06)': 40,
    },
    topPincodes: [
      { pincode: '411004', area: 'Deccan / Prabhat Road', orders: 210, concentrationRatio: 0.85 },
      { pincode: '411038', area: 'Kothrud / Paud Road', orders: 200, concentrationRatio: 0.83 },
      { pincode: '411005', area: 'Shivajinagar / JM Road', orders: 170, concentrationRatio: 0.77 },
      { pincode: '411001', area: 'Pune Station / Camp', orders: 130, concentrationRatio: 0.68 },
    ],
    keyInstitutions: ['Deenanath Mangeshkar Hospital', 'Ruby Hall Clinic', 'Jehangir Hospital', 'Sassoon Hospital'],
    logisticsHub: 'Kothrud PM Jan Aushadhi Superstore & Deccan Dispatch Point',
  },
  {
    id: 'reg-delhi-south-aiims',
    name: 'South Delhi & AIIMS Medical Campus Belt',
    subRegion: 'Ansari Nagar, Saket, Hauz Khas, Greater Kailash, Green Park',
    zoneCluster: 'Delhi NCR',
    state: 'Delhi',
    coordinates: {
      lat: 28.5672,
      lng: 77.2100,
      svgX: 580,
      svgY: 130,
    },
    totalOrders: 920,
    rxOrders: 790,
    avgDeliveryMinutes: 30,
    coldChainPercentage: 35.8,
    totalSavingsInr: 478000,
    activeCouriers: 30,
    activePharmacies: 15,
    concentrationLevel: 'Surge / Peak',
    timeSlotConcentration: {
      'Morning (06-10)': 105,
      'OPD Peak (10-14)': 315,
      'Afternoon (14-18)': 205,
      'Evening Rush (18-22)': 245,
      'Night Emergency (22-06)': 50,
    },
    topPincodes: [
      { pincode: '110029', area: 'Ansari Nagar / AIIMS Complex', orders: 320, concentrationRatio: 0.99 },
      { pincode: '110017', area: 'Saket / Max Hospital Belt', orders: 250, concentrationRatio: 0.90 },
      { pincode: '110016', area: 'Hauz Khas / IIT Gate', orders: 195, concentrationRatio: 0.80 },
      { pincode: '110048', area: 'Greater Kailash (GK-1 & GK-2)', orders: 155, concentrationRatio: 0.72 },
    ],
    keyInstitutions: ['AIIMS New Delhi', 'Safdarjung Hospital', 'Max Super Specialty Saket', 'Fortis Vasant Kunj'],
    logisticsHub: 'AIIMS Ring Road Dedicated Jan Aushadhi Fulfillment Terminal',
  },
  {
    id: 'reg-bengaluru-tech',
    name: 'Bengaluru Tech Corridors & Koramangala',
    subRegion: 'Koramangala, HSR Layout, Indiranagar, Whitefield, Bellandur',
    zoneCluster: 'Bengaluru',
    state: 'Karnataka',
    coordinates: {
      lat: 12.9352,
      lng: 77.6245,
      svgX: 740,
      svgY: 480,
    },
    totalOrders: 810,
    rxOrders: 640,
    avgDeliveryMinutes: 35,
    coldChainPercentage: 25.3,
    totalSavingsInr: 398000,
    activeCouriers: 25,
    activePharmacies: 13,
    concentrationLevel: 'High',
    timeSlotConcentration: {
      'Morning (06-10)': 90,
      'OPD Peak (10-14)': 220,
      'Afternoon (14-18)': 180,
      'Evening Rush (18-22)': 270,
      'Night Emergency (22-06)': 50,
    },
    topPincodes: [
      { pincode: '560034', area: 'Koramangala 4th & 5th Block', orders: 260, concentrationRatio: 0.91 },
      { pincode: '560102', area: 'HSR Layout Sectors 1-7', orders: 220, concentrationRatio: 0.86 },
      { pincode: '560038', area: 'Indiranagar 100ft Road', orders: 180, concentrationRatio: 0.79 },
      { pincode: '560066', area: 'Whitefield / ITPL Main Road', orders: 150, concentrationRatio: 0.71 },
    ],
    keyInstitutions: ['Manipal Hospital Old Airport Rd', 'St Johns Medical College', 'Aster CMI', 'Narayana Health'],
    logisticsHub: 'Koramangala 80ft Road Fast-Dispatch Kendra & HSR Node',
  },
  {
    id: 'reg-hyderabad-pharma',
    name: 'Hyderabad Cyberabad & HITEC City Corridor',
    subRegion: 'HITEC City, Madhapur, Gachibowli, Banjara Hills, Jubilee Hills',
    zoneCluster: 'Hyderabad',
    state: 'Telangana',
    coordinates: {
      lat: 17.4435,
      lng: 78.3772,
      svgX: 630,
      svgY: 370,
    },
    totalOrders: 690,
    rxOrders: 540,
    avgDeliveryMinutes: 33,
    coldChainPercentage: 26.8,
    totalSavingsInr: 341000,
    activeCouriers: 21,
    activePharmacies: 10,
    concentrationLevel: 'High',
    timeSlotConcentration: {
      'Morning (06-10)': 75,
      'OPD Peak (10-14)': 195,
      'Afternoon (14-18)': 150,
      'Evening Rush (18-22)': 230,
      'Night Emergency (22-06)': 40,
    },
    topPincodes: [
      { pincode: '500081', area: 'HITEC City / Cyber Towers', orders: 220, concentrationRatio: 0.88 },
      { pincode: '500032', area: 'Gachibowli / Financial District', orders: 190, concentrationRatio: 0.82 },
      { pincode: '500034', area: 'Banjara Hills Road No 1-12', orders: 160, concentrationRatio: 0.75 },
      { pincode: '500033', area: 'Jubilee Hills Check Post', orders: 120, concentrationRatio: 0.67 },
    ],
    keyInstitutions: ['AIG Hospitals Gachibowli', 'Care Hospitals Banjara', 'Apollo Health City Jubilee Hills'],
    logisticsHub: 'HITEC City Pharma Depot & Banjara Hills Central Pharmacy',
  },
];

export interface PincodeServiceabilityInfo {
  pincode: string;
  area: string;
  city: string;
  state: string;
  cluster: 'MMR (Mumbai)' | 'Pune' | 'Delhi NCR' | 'Bengaluru' | 'Hyderabad' | 'Regional Express';
  slaLabel: string;
  estimatedMinutes: number;
  deliveryFee: number;
  isHyperlocal: boolean;
  coldChainReady: boolean;
  nearbyKendraCount: number;
  primaryKendraName: string;
}

export const PINCODE_DIRECTORY: Record<string, PincodeServiceabilityInfo> = {
  // Mumbai MMR
  '400001': {
    pincode: '400001',
    area: 'Fort / Ballard Estate',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '35 mins (Hyperlocal Bike)',
    estimatedMinutes: 35,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1001 (Fort)',
  },
  '400005': {
    pincode: '400005',
    area: 'Colaba / Cuffe Parade',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '40 mins (Hyperlocal Bike)',
    estimatedMinutes: 40,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 3,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1002 (Colaba)',
  },
  '400012': {
    pincode: '400012',
    area: 'Parel / KEM Hospital Corridor',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '25 mins (Priority Medical Corridor)',
    estimatedMinutes: 25,
    deliveryFee: 12,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 6,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1003 (Parel KEM)',
  },
  '400018': {
    pincode: '400018',
    area: 'Worli / Lower Parel West',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '30 mins (Hyperlocal Bike)',
    estimatedMinutes: 30,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 5,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1042 (Worli)',
  },
  '400025': {
    pincode: '400025',
    area: 'Prabhadevi / Siddhivinayak',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '30 mins (Hyperlocal Bike)',
    estimatedMinutes: 30,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'Apollo Pharmacy Partner Hub (Prabhadevi)',
  },
  '400028': {
    pincode: '400028',
    area: 'Dadar West / Shivaji Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '30 mins (Hyperlocal Bike)',
    estimatedMinutes: 30,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1004 (Dadar)',
  },
  '400050': {
    pincode: '400050',
    area: 'Bandra West / Hill Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '35 mins (Hyperlocal Bike)',
    estimatedMinutes: 35,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1005 (Bandra)',
  },
  '400051': {
    pincode: '400051',
    area: 'Bandra Kurla Complex (BKC)',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '30 mins (Express Courier)',
    estimatedMinutes: 30,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 5,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1006 (BKC)',
  },
  '400058': {
    pincode: '400058',
    area: 'Andheri West / Lokhandwala',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '40 mins (Hyperlocal Bike)',
    estimatedMinutes: 40,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1007 (Andheri)',
  },
  '400601': {
    pincode: '400601',
    area: 'Thane West Station Circle',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '45 mins (Regional Node)',
    estimatedMinutes: 45,
    deliveryFee: 18,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1008 (Thane)',
  },
  '400703': {
    pincode: '400703',
    area: 'Vashi Sector 17',
    city: 'Mumbai',
    state: 'Maharashtra',
    cluster: 'MMR (Mumbai)',
    slaLabel: '35 mins (Navi Mumbai Hub)',
    estimatedMinutes: 35,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 3,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1009 (Vashi)',
  },

  // Pune
  '411001': {
    pincode: '411001',
    area: 'Pune Camp / Pune Station',
    city: 'Pune',
    state: 'Maharashtra',
    cluster: 'Pune',
    slaLabel: '35 mins (Hyperlocal)',
    estimatedMinutes: 35,
    deliveryFee: 14,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1013 (Pune Camp)',
  },
  '411004': {
    pincode: '411004',
    area: 'Deccan Gymkhana / Prabhat Rd',
    city: 'Pune',
    state: 'Maharashtra',
    cluster: 'Pune',
    slaLabel: '30 mins (Hyperlocal)',
    estimatedMinutes: 30,
    deliveryFee: 12,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 5,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1011 (Deccan)',
  },
  '411005': {
    pincode: '411005',
    area: 'Shivajinagar / JM Road',
    city: 'Pune',
    state: 'Maharashtra',
    cluster: 'Pune',
    slaLabel: '30 mins (Hyperlocal)',
    estimatedMinutes: 30,
    deliveryFee: 12,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1012 (Shivajinagar)',
  },
  '411038': {
    pincode: '411038',
    area: 'Kothrud / Paud Road',
    city: 'Pune',
    state: 'Maharashtra',
    cluster: 'Pune',
    slaLabel: '25 mins (Direct Kendra Dispatch)',
    estimatedMinutes: 25,
    deliveryFee: 12,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 5,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1010 (Kothrud)',
  },

  // Delhi NCR
  '110001': {
    pincode: '110001',
    area: 'Connaught Place / Central Delhi',
    city: 'Delhi',
    state: 'Delhi',
    cluster: 'Delhi NCR',
    slaLabel: '30 mins (Central Corridor)',
    estimatedMinutes: 30,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 5,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1020 (CP)',
  },
  '110016': {
    pincode: '110016',
    area: 'Hauz Khas / Green Park',
    city: 'Delhi',
    state: 'Delhi',
    cluster: 'Delhi NCR',
    slaLabel: '35 mins (Hyperlocal)',
    estimatedMinutes: 35,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1018 (Hauz Khas)',
  },
  '110017': {
    pincode: '110017',
    area: 'Saket / Max Hospital Belt',
    city: 'Delhi',
    state: 'Delhi',
    cluster: 'Delhi NCR',
    slaLabel: '25 mins (Medical Campus Hub)',
    estimatedMinutes: 25,
    deliveryFee: 14,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 5,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1017 (Saket)',
  },
  '110029': {
    pincode: '110029',
    area: 'Ansari Nagar / AIIMS Complex',
    city: 'Delhi',
    state: 'Delhi',
    cluster: 'Delhi NCR',
    slaLabel: '20 mins (AIIMS Priority Express)',
    estimatedMinutes: 20,
    deliveryFee: 12,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 6,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1016 (AIIMS)',
  },
  '110048': {
    pincode: '110048',
    area: 'Greater Kailash (GK-1 & GK-2)',
    city: 'Delhi',
    state: 'Delhi',
    cluster: 'Delhi NCR',
    slaLabel: '35 mins (Hyperlocal)',
    estimatedMinutes: 35,
    deliveryFee: 15,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1019 (GK-1)',
  },

  // Bengaluru
  '560001': {
    pincode: '560001',
    area: 'MG Road / Brigade Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    cluster: 'Bengaluru',
    slaLabel: '35 mins (CBD Corridor)',
    estimatedMinutes: 35,
    deliveryFee: 14,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1027 (MG Road)',
  },
  '560034': {
    pincode: '560034',
    area: 'Koramangala 4th-8th Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    cluster: 'Bengaluru',
    slaLabel: '25 mins (Hyperlocal Bike)',
    estimatedMinutes: 25,
    deliveryFee: 14,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 5,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1023 (Koramangala)',
  },
  '560038': {
    pincode: '560038',
    area: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    cluster: 'Bengaluru',
    slaLabel: '30 mins (Hyperlocal)',
    estimatedMinutes: 30,
    deliveryFee: 14,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1025 (Indiranagar)',
  },
  '560066': {
    pincode: '560066',
    area: 'Whitefield / ITPL Corridor',
    city: 'Bengaluru',
    state: 'Karnataka',
    cluster: 'Bengaluru',
    slaLabel: '40 mins (Tech Park Node)',
    estimatedMinutes: 40,
    deliveryFee: 18,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 3,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1026 (Whitefield)',
  },
  '560102': {
    pincode: '560102',
    area: 'HSR Layout Sectors 1-7',
    city: 'Bengaluru',
    state: 'Karnataka',
    cluster: 'Bengaluru',
    slaLabel: '30 mins (Hyperlocal)',
    estimatedMinutes: 30,
    deliveryFee: 14,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1024 (HSR)',
  },

  // Hyderabad
  '500001': {
    pincode: '500001',
    area: 'Abids / Koti Healthcare Belt',
    city: 'Hyderabad',
    state: 'Telangana',
    cluster: 'Hyderabad',
    slaLabel: '35 mins (Central Hub)',
    estimatedMinutes: 35,
    deliveryFee: 14,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1033 (Secunderabad)',
  },
  '500032': {
    pincode: '500032',
    area: 'Gachibowli / Financial District',
    city: 'Hyderabad',
    state: 'Telangana',
    cluster: 'Hyderabad',
    slaLabel: '25 mins (AIG Hospital Belt)',
    estimatedMinutes: 25,
    deliveryFee: 14,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 5,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1030 (Gachibowli)',
  },
  '500034': {
    pincode: '500034',
    area: 'Banjara Hills Road No 1-12',
    city: 'Hyderabad',
    state: 'Telangana',
    cluster: 'Hyderabad',
    slaLabel: '30 mins (Hyperlocal)',
    estimatedMinutes: 30,
    deliveryFee: 14,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 4,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1031 (Banjara Hills)',
  },
  '500081': {
    pincode: '500081',
    area: 'HITEC City / Madhapur Cyber Towers',
    city: 'Hyderabad',
    state: 'Telangana',
    cluster: 'Hyderabad',
    slaLabel: '25 mins (Cyber Corridor Express)',
    estimatedMinutes: 25,
    deliveryFee: 12,
    isHyperlocal: true,
    coldChainReady: true,
    nearbyKendraCount: 5,
    primaryKendraName: 'PM Jan Aushadhi Kendra #1029 (HITEC City)',
  },
};

/**
 * Intelligent pincode resolver that looks up known cluster coordinates
 * or infers regional serviceability dynamically for any valid 6-digit Indian PIN.
 */
export function getPincodeServiceability(pincode: string): PincodeServiceabilityInfo {
  const cleanPin = pincode.trim();
  if (PINCODE_DIRECTORY[cleanPin]) {
    return PINCODE_DIRECTORY[cleanPin];
  }

  // Infer city and state by first 2 digits (India Post Postal Circle prefixes)
  const prefix = cleanPin.slice(0, 2);
  let city = 'Regional Center';
  let state = 'India';
  let cluster: PincodeServiceabilityInfo['cluster'] = 'Regional Express';

  if (prefix === '40') {
    city = 'Mumbai MMR';
    state = 'Maharashtra';
    cluster = 'MMR (Mumbai)';
  } else if (prefix === '41') {
    city = 'Pune Region';
    state = 'Maharashtra';
    cluster = 'Pune';
  } else if (prefix === '11') {
    city = 'Delhi NCR';
    state = 'Delhi';
    cluster = 'Delhi NCR';
  } else if (prefix === '56') {
    city = 'Bengaluru Urban';
    state = 'Karnataka';
    cluster = 'Bengaluru';
  } else if (prefix === '50') {
    city = 'Hyderabad Metro';
    state = 'Telangana';
    cluster = 'Hyderabad';
  }

  return {
    pincode: cleanPin,
    area: `${city} Sector`,
    city,
    state,
    cluster,
    slaLabel: '60-90 mins (Regional Chemist Network)',
    estimatedMinutes: 75,
    deliveryFee: 25,
    isHyperlocal: false,
    coldChainReady: true,
    nearbyKendraCount: 2,
    primaryKendraName: `PM Jan Aushadhi Kendra (Regional Partner ${cleanPin})`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 4: Tier 2 / Tier 3 / Tier 4 National Pincode Expansion
// 8 new cities: Chennai, Kolkata, Ahmedabad, Jaipur, Nagpur, Lucknow, Kochi, Chandigarh
// ─────────────────────────────────────────────────────────────────────────────

// Extend the cluster union type — augmented via declaration merging is not available
// for string literal union, so new zones use 'Regional Express' cluster which already
// exists on PincodeServiceabilityInfo.  REGIONAL_DELIVERY_DATA stores the full detail.

// ── Tier 2/3/4 Regional Delivery Zones ────────────────────────────────────────

export const TIER2_REGIONAL_DELIVERY_DATA: RegionalDeliveryZone[] = [
  {
    id: 'reg-chennai-central',
    name: 'Chennai Central & Anna Nagar Healthcare Belt',
    subRegion: 'Anna Nagar, Kilpauk, Egmore, T Nagar, Nungambakkam',
    zoneCluster: 'MMR (Mumbai)', // fallback; displayed separately in UI
    state: 'Tamil Nadu',
    coordinates: { lat: 13.0827, lng: 80.2707, svgX: 680, svgY: 530 },
    totalOrders: 540,
    rxOrders: 430,
    avgDeliveryMinutes: 38,
    coldChainPercentage: 22.8,
    totalSavingsInr: 278400,
    activeCouriers: 18,
    activePharmacies: 9,
    concentrationLevel: 'High',
    timeSlotConcentration: {
      'Morning (06-10)': 70, 'OPD Peak (10-14)': 175, 'Afternoon (14-18)': 130,
      'Evening Rush (18-22)': 125, 'Night Emergency (22-06)': 40,
    },
    topPincodes: [
      { pincode: '600040', area: 'Anna Nagar West', orders: 165, concentrationRatio: 0.82 },
      { pincode: '600010', area: 'Kilpauk / Govt Stanley', orders: 145, concentrationRatio: 0.76 },
      { pincode: '600017', area: 'T Nagar / Usman Road', orders: 130, concentrationRatio: 0.70 },
      { pincode: '600008', area: 'Egmore / Park Town', orders: 100, concentrationRatio: 0.63 },
    ],
    keyInstitutions: ['Govt Stanley Hospital', 'Kilpauk Medical College', 'Apollo Hospitals Chennai', 'Voluntary Health Services'],
    logisticsHub: 'Anna Nagar PM Jan Aushadhi Kendra & T Nagar Dispatch Node',
  },
  {
    id: 'reg-kolkata-central',
    name: 'Kolkata Medical Hub & Salt Lake IT Corridor',
    subRegion: 'Park Street, Salt Lake, New Town, Ballygunge, Jadavpur',
    zoneCluster: 'MMR (Mumbai)',
    state: 'West Bengal',
    coordinates: { lat: 22.5726, lng: 88.3639, svgX: 820, svgY: 200 },
    totalOrders: 490,
    rxOrders: 390,
    avgDeliveryMinutes: 42,
    coldChainPercentage: 20.4,
    totalSavingsInr: 248000,
    activeCouriers: 16,
    activePharmacies: 8,
    concentrationLevel: 'High',
    timeSlotConcentration: {
      'Morning (06-10)': 65, 'OPD Peak (10-14)': 155, 'Afternoon (14-18)': 110,
      'Evening Rush (18-22)': 130, 'Night Emergency (22-06)': 30,
    },
    topPincodes: [
      { pincode: '700016', area: 'Park Street / Free School St', orders: 155, concentrationRatio: 0.80 },
      { pincode: '700064', area: 'Salt Lake Sector V (IT Hub)', orders: 140, concentrationRatio: 0.76 },
      { pincode: '700029', area: 'Ballygunge / Dover Lane', orders: 110, concentrationRatio: 0.68 },
      { pincode: '700032', area: 'Jadavpur / JU Campus', orders: 85, concentrationRatio: 0.60 },
    ],
    keyInstitutions: ['SSKM / PG Hospital', 'CMRI Kolkata', 'Peerless Hospital', 'Medica Super Specialty'],
    logisticsHub: 'Salt Lake Sector V Jan Aushadhi Hub & Park Street Central Chemist',
  },
  {
    id: 'reg-ahmedabad-central',
    name: 'Ahmedabad SG Highway & Old City Healthcare Cluster',
    subRegion: 'Navrangpura, Vastrapur, SG Highway, Maninagar, Satellite',
    zoneCluster: 'MMR (Mumbai)',
    state: 'Gujarat',
    coordinates: { lat: 23.0225, lng: 72.5714, svgX: 380, svgY: 210 },
    totalOrders: 460,
    rxOrders: 360,
    avgDeliveryMinutes: 40,
    coldChainPercentage: 19.6,
    totalSavingsInr: 232000,
    activeCouriers: 15,
    activePharmacies: 8,
    concentrationLevel: 'Moderate',
    timeSlotConcentration: {
      'Morning (06-10)': 60, 'OPD Peak (10-14)': 145, 'Afternoon (14-18)': 105,
      'Evening Rush (18-22)': 115, 'Night Emergency (22-06)': 35,
    },
    topPincodes: [
      { pincode: '380009', area: 'Navrangpura / CG Road', orders: 145, concentrationRatio: 0.79 },
      { pincode: '380054', area: 'Vastrapur / ISCON Circle', orders: 125, concentrationRatio: 0.73 },
      { pincode: '380008', area: 'Maninagar / Shyamal Cross', orders: 105, concentrationRatio: 0.67 },
      { pincode: '380015', area: 'Satellite / Prahlad Nagar', orders: 85, concentrationRatio: 0.60 },
    ],
    keyInstitutions: ['Civil Hospital Ahmedabad', 'SAL Hospital', 'Apollo Hospitals Ahmedabad', 'HCG Cancer Centre'],
    logisticsHub: 'Navrangpura PM Jan Aushadhi Kendra & SG Highway Pharma Node',
  },
  {
    id: 'reg-jaipur-central',
    name: 'Jaipur Walled City & Malviya Nagar Medical Belt',
    subRegion: 'Malviya Nagar, C-Scheme, Vaishali Nagar, Mansarovar, Tonk Road',
    zoneCluster: 'Delhi NCR',
    state: 'Rajasthan',
    coordinates: { lat: 26.9124, lng: 75.7873, svgX: 480, svgY: 140 },
    totalOrders: 380,
    rxOrders: 295,
    avgDeliveryMinutes: 48,
    coldChainPercentage: 16.2,
    totalSavingsInr: 195000,
    activeCouriers: 12,
    activePharmacies: 7,
    concentrationLevel: 'Moderate',
    timeSlotConcentration: {
      'Morning (06-10)': 55, 'OPD Peak (10-14)': 120, 'Afternoon (14-18)': 90,
      'Evening Rush (18-22)': 95, 'Night Emergency (22-06)': 20,
    },
    topPincodes: [
      { pincode: '302017', area: 'Malviya Nagar / JLN Marg', orders: 120, concentrationRatio: 0.78 },
      { pincode: '302001', area: 'C-Scheme / Ajmer Road', orders: 100, concentrationRatio: 0.72 },
      { pincode: '302020', area: 'Vaishali Nagar', orders: 90, concentrationRatio: 0.68 },
      { pincode: '302018', area: 'Mansarovar / Tonk Road', orders: 70, concentrationRatio: 0.60 },
    ],
    keyInstitutions: ['SMS Hospital Jaipur', 'Fortis Jaipur', 'Eternal Hospital', 'NIMS University Hospital'],
    logisticsHub: 'Malviya Nagar PM Jan Aushadhi Kendra & C-Scheme Retail Node',
  },
  {
    id: 'reg-nagpur-central',
    name: 'Nagpur Medical Square & IT Park Corridor',
    subRegion: 'Medical Square, Dharampeth, Sitabuldi, Sadar, Hingna',
    zoneCluster: 'Pune',
    state: 'Maharashtra',
    coordinates: { lat: 21.1458, lng: 79.0882, svgX: 560, svgY: 310 },
    totalOrders: 320,
    rxOrders: 255,
    avgDeliveryMinutes: 45,
    coldChainPercentage: 18.0,
    totalSavingsInr: 162000,
    activeCouriers: 10,
    activePharmacies: 6,
    concentrationLevel: 'Moderate',
    timeSlotConcentration: {
      'Morning (06-10)': 45, 'OPD Peak (10-14)': 105, 'Afternoon (14-18)': 75,
      'Evening Rush (18-22)': 80, 'Night Emergency (22-06)': 15,
    },
    topPincodes: [
      { pincode: '440010', area: 'Medical Square / GMCH', orders: 105, concentrationRatio: 0.80 },
      { pincode: '440010', area: 'Dharampeth / Ramdaspeth', orders: 90, concentrationRatio: 0.74 },
      { pincode: '440012', area: 'Sitabuldi / Residency Road', orders: 75, concentrationRatio: 0.68 },
      { pincode: '440015', area: 'Sadar / Congress Nagar', orders: 50, concentrationRatio: 0.58 },
    ],
    keyInstitutions: ['GMCH Nagpur', 'Orange City Hospital', 'Alexis Multispecialty', 'Wockhardt Hospital Nagpur'],
    logisticsHub: 'Medical Square PM Jan Aushadhi Hub & Dharampeth Fast Dispatch',
  },
  {
    id: 'reg-lucknow-central',
    name: 'Lucknow Hazratganj & Gomti Nagar Health Corridor',
    subRegion: 'Hazratganj, Gomti Nagar, Aliganj, Indira Nagar, Alambagh',
    zoneCluster: 'Delhi NCR',
    state: 'Uttar Pradesh',
    coordinates: { lat: 26.8467, lng: 80.9462, svgX: 620, svgY: 160 },
    totalOrders: 350,
    rxOrders: 280,
    avgDeliveryMinutes: 50,
    coldChainPercentage: 17.5,
    totalSavingsInr: 178000,
    activeCouriers: 11,
    activePharmacies: 6,
    concentrationLevel: 'Moderate',
    timeSlotConcentration: {
      'Morning (06-10)': 50, 'OPD Peak (10-14)': 112, 'Afternoon (14-18)': 80,
      'Evening Rush (18-22)': 90, 'Night Emergency (22-06)': 18,
    },
    topPincodes: [
      { pincode: '226001', area: 'Hazratganj / MG Marg', orders: 110, concentrationRatio: 0.79 },
      { pincode: '226010', area: 'Gomti Nagar Extension', orders: 95, concentrationRatio: 0.73 },
      { pincode: '226020', area: 'Indira Nagar / Sector 9', orders: 85, concentrationRatio: 0.68 },
      { pincode: '226005', area: 'Aliganj / Sector C', orders: 60, concentrationRatio: 0.60 },
    ],
    keyInstitutions: ['KGMU Lucknow', 'SGPGI', 'Medanta Lucknow', 'Apollo Medics'],
    logisticsHub: 'Hazratganj Jan Aushadhi Kendra & Gomti Nagar Pharma Depot',
  },
  {
    id: 'reg-kochi-central',
    name: 'Kochi Ernakulam & MG Road Medical Corridor',
    subRegion: 'MG Road, Kakkanad, Edapally, Vytilla, Marine Drive',
    zoneCluster: 'Bengaluru',
    state: 'Kerala',
    coordinates: { lat: 9.9312, lng: 76.2673, svgX: 600, svgY: 540 },
    totalOrders: 310,
    rxOrders: 250,
    avgDeliveryMinutes: 38,
    coldChainPercentage: 30.2,
    totalSavingsInr: 158000,
    activeCouriers: 10,
    activePharmacies: 6,
    concentrationLevel: 'Moderate',
    timeSlotConcentration: {
      'Morning (06-10)': 45, 'OPD Peak (10-14)': 100, 'Afternoon (14-18)': 80,
      'Evening Rush (18-22)': 70, 'Night Emergency (22-06)': 15,
    },
    topPincodes: [
      { pincode: '682016', area: 'Ernakulam MG Road', orders: 100, concentrationRatio: 0.80 },
      { pincode: '682030', area: 'Kakkanad / InfoPark', orders: 85, concentrationRatio: 0.75 },
      { pincode: '682024', area: 'Edapally / NH Bypass', orders: 75, concentrationRatio: 0.70 },
      { pincode: '682019', area: 'Vytilla / Mobility Hub', orders: 50, concentrationRatio: 0.60 },
    ],
    keyInstitutions: ['Amrita Hospital Kochi', 'KIMS Ernakulam', 'Aster Medcity', 'Lakeshore Hospital'],
    logisticsHub: 'MG Road PM Jan Aushadhi Kendra & Kakkanad Cold-Chain Node',
  },
  {
    id: 'reg-chandigarh-central',
    name: 'Chandigarh Sector 17 & PGI Medical Campus',
    subRegion: 'Sector 17, Sector 22, Sector 34, Mohali Phase 8, Panchkula',
    zoneCluster: 'Delhi NCR',
    state: 'Chandigarh',
    coordinates: { lat: 30.7333, lng: 76.7794, svgX: 510, svgY: 90 },
    totalOrders: 290,
    rxOrders: 235,
    avgDeliveryMinutes: 35,
    coldChainPercentage: 24.0,
    totalSavingsInr: 148000,
    activeCouriers: 9,
    activePharmacies: 5,
    concentrationLevel: 'Moderate',
    timeSlotConcentration: {
      'Morning (06-10)': 42, 'OPD Peak (10-14)': 96, 'Afternoon (14-18)': 72,
      'Evening Rush (18-22)': 65, 'Night Emergency (22-06)': 15,
    },
    topPincodes: [
      { pincode: '160017', area: 'Sector 17 / PGI Gate', orders: 95, concentrationRatio: 0.82 },
      { pincode: '160022', area: 'Sector 22 / Hospital Road', orders: 80, concentrationRatio: 0.76 },
      { pincode: '160034', area: 'Sector 34 / Phase IV', orders: 65, concentrationRatio: 0.68 },
      { pincode: '160055', area: 'Mohali Phase 8 / IT Park', orders: 50, concentrationRatio: 0.60 },
    ],
    keyInstitutions: ['PGIMER Chandigarh', 'GMCH Sector 32', 'Fortis Mohali', 'Max Super Specialty Mohali'],
    logisticsHub: 'Sector 17 PM Jan Aushadhi Hub & PGI Gate Dedicated Dispatch',
  },
];

// Merge into the main array (consumers can import REGIONAL_DELIVERY_DATA for the full picture)
REGIONAL_DELIVERY_DATA.push(...TIER2_REGIONAL_DELIVERY_DATA);

// ── Tier 2/3/4 Pincode Directory ──────────────────────────────────────────────

const TIER2_PINCODE_ENTRIES: Record<string, PincodeServiceabilityInfo> = {
  // Chennai
  '600040': { pincode: '600040', area: 'Anna Nagar West', city: 'Chennai', state: 'Tamil Nadu', cluster: 'Regional Express', slaLabel: '40 mins (Hyperlocal)', estimatedMinutes: 40, deliveryFee: 16, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 3, primaryKendraName: 'PM Jan Aushadhi Kendra #6001 (Anna Nagar)' },
  '600010': { pincode: '600010', area: 'Kilpauk / Govt Stanley Hospital', city: 'Chennai', state: 'Tamil Nadu', cluster: 'Regional Express', slaLabel: '35 mins (Medical Campus)', estimatedMinutes: 35, deliveryFee: 15, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 4, primaryKendraName: 'PM Jan Aushadhi Kendra #6002 (Kilpauk)' },
  '600017': { pincode: '600017', area: 'T Nagar / Usman Road', city: 'Chennai', state: 'Tamil Nadu', cluster: 'Regional Express', slaLabel: '40 mins (Hyperlocal)', estimatedMinutes: 40, deliveryFee: 16, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 3, primaryKendraName: 'PM Jan Aushadhi Kendra #6003 (T Nagar)' },
  '600008': { pincode: '600008', area: 'Egmore / Park Town', city: 'Chennai', state: 'Tamil Nadu', cluster: 'Regional Express', slaLabel: '45 mins (City Centre)', estimatedMinutes: 45, deliveryFee: 18, isHyperlocal: false, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #6004 (Egmore)' },

  // Kolkata
  '700016': { pincode: '700016', area: 'Park Street / Free School Street', city: 'Kolkata', state: 'West Bengal', cluster: 'Regional Express', slaLabel: '45 mins (City Centre)', estimatedMinutes: 45, deliveryFee: 18, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 3, primaryKendraName: 'PM Jan Aushadhi Kendra #7001 (Park Street)' },
  '700064': { pincode: '700064', area: 'Salt Lake Sector V', city: 'Kolkata', state: 'West Bengal', cluster: 'Regional Express', slaLabel: '40 mins (IT Hub Node)', estimatedMinutes: 40, deliveryFee: 16, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 3, primaryKendraName: 'PM Jan Aushadhi Kendra #7002 (Salt Lake)' },
  '700029': { pincode: '700029', area: 'Ballygunge / Dover Lane', city: 'Kolkata', state: 'West Bengal', cluster: 'Regional Express', slaLabel: '45 mins (Hyperlocal)', estimatedMinutes: 45, deliveryFee: 17, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #7003 (Ballygunge)' },

  // Ahmedabad
  '380009': { pincode: '380009', area: 'Navrangpura / CG Road', city: 'Ahmedabad', state: 'Gujarat', cluster: 'Regional Express', slaLabel: '40 mins (Hyperlocal)', estimatedMinutes: 40, deliveryFee: 15, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 3, primaryKendraName: 'PM Jan Aushadhi Kendra #8001 (Navrangpura)' },
  '380054': { pincode: '380054', area: 'Vastrapur / ISCON', city: 'Ahmedabad', state: 'Gujarat', cluster: 'Regional Express', slaLabel: '45 mins (Suburban)', estimatedMinutes: 45, deliveryFee: 16, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #8002 (Vastrapur)' },
  '380015': { pincode: '380015', area: 'Satellite / Prahlad Nagar', city: 'Ahmedabad', state: 'Gujarat', cluster: 'Regional Express', slaLabel: '50 mins (Suburban)', estimatedMinutes: 50, deliveryFee: 18, isHyperlocal: false, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #8003 (Satellite)' },

  // Jaipur
  '302017': { pincode: '302017', area: 'Malviya Nagar / JLN Marg', city: 'Jaipur', state: 'Rajasthan', cluster: 'Regional Express', slaLabel: '50 mins (Regional)', estimatedMinutes: 50, deliveryFee: 18, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #9001 (Malviya Nagar)' },
  '302001': { pincode: '302001', area: 'C-Scheme / Ajmer Road', city: 'Jaipur', state: 'Rajasthan', cluster: 'Regional Express', slaLabel: '45 mins (City Centre)', estimatedMinutes: 45, deliveryFee: 17, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #9002 (C-Scheme)' },
  '302020': { pincode: '302020', area: 'Vaishali Nagar', city: 'Jaipur', state: 'Rajasthan', cluster: 'Regional Express', slaLabel: '55 mins (Regional Express)', estimatedMinutes: 55, deliveryFee: 20, isHyperlocal: false, coldChainReady: true, nearbyKendraCount: 1, primaryKendraName: 'PM Jan Aushadhi Kendra #9003 (Vaishali)' },

  // Nagpur
  '440010': { pincode: '440010', area: 'Medical Square / GMCH Belt', city: 'Nagpur', state: 'Maharashtra', cluster: 'Regional Express', slaLabel: '45 mins (Medical Hub)', estimatedMinutes: 45, deliveryFee: 16, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 3, primaryKendraName: 'PM Jan Aushadhi Kendra #4201 (Medical Square)' },
  '440012': { pincode: '440012', area: 'Sitabuldi / Residency Road', city: 'Nagpur', state: 'Maharashtra', cluster: 'Regional Express', slaLabel: '50 mins (City Centre)', estimatedMinutes: 50, deliveryFee: 18, isHyperlocal: false, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #4202 (Sitabuldi)' },

  // Lucknow
  '226001': { pincode: '226001', area: 'Hazratganj / MG Marg', city: 'Lucknow', state: 'Uttar Pradesh', cluster: 'Regional Express', slaLabel: '50 mins (City Centre)', estimatedMinutes: 50, deliveryFee: 18, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #2601 (Hazratganj)' },
  '226010': { pincode: '226010', area: 'Gomti Nagar Extension', city: 'Lucknow', state: 'Uttar Pradesh', cluster: 'Regional Express', slaLabel: '55 mins (Suburban)', estimatedMinutes: 55, deliveryFee: 20, isHyperlocal: false, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #2602 (Gomti Nagar)' },
  '226020': { pincode: '226020', area: 'Indira Nagar Sector 9', city: 'Lucknow', state: 'Uttar Pradesh', cluster: 'Regional Express', slaLabel: '60 mins (Regional Express)', estimatedMinutes: 60, deliveryFee: 22, isHyperlocal: false, coldChainReady: true, nearbyKendraCount: 1, primaryKendraName: 'PM Jan Aushadhi Kendra #2603 (Indira Nagar)' },

  // Kochi
  '682016': { pincode: '682016', area: 'Ernakulam MG Road', city: 'Kochi', state: 'Kerala', cluster: 'Regional Express', slaLabel: '38 mins (City Centre)', estimatedMinutes: 38, deliveryFee: 16, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 3, primaryKendraName: 'PM Jan Aushadhi Kendra #6801 (MG Road)' },
  '682030': { pincode: '682030', area: 'Kakkanad / InfoPark', city: 'Kochi', state: 'Kerala', cluster: 'Regional Express', slaLabel: '42 mins (IT Corridor)', estimatedMinutes: 42, deliveryFee: 17, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #6802 (Kakkanad)' },
  '682024': { pincode: '682024', area: 'Edapally / NH Bypass', city: 'Kochi', state: 'Kerala', cluster: 'Regional Express', slaLabel: '45 mins (Highway Node)', estimatedMinutes: 45, deliveryFee: 18, isHyperlocal: false, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #6803 (Edapally)' },

  // Chandigarh
  '160017': { pincode: '160017', area: 'Sector 17 / PGI Gate', city: 'Chandigarh', state: 'Chandigarh', cluster: 'Regional Express', slaLabel: '35 mins (PGI Priority)', estimatedMinutes: 35, deliveryFee: 15, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 3, primaryKendraName: 'PM Jan Aushadhi Kendra #1601 (Sector 17)' },
  '160022': { pincode: '160022', area: 'Sector 22 / Hospital Road', city: 'Chandigarh', state: 'Chandigarh', cluster: 'Regional Express', slaLabel: '40 mins (Hyperlocal)', estimatedMinutes: 40, deliveryFee: 16, isHyperlocal: true, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #1602 (Sector 22)' },
  '160055': { pincode: '160055', area: 'Mohali Phase 8 / IT Park', city: 'Chandigarh', state: 'Chandigarh', cluster: 'Regional Express', slaLabel: '45 mins (Suburban)', estimatedMinutes: 45, deliveryFee: 18, isHyperlocal: false, coldChainReady: true, nearbyKendraCount: 2, primaryKendraName: 'PM Jan Aushadhi Kendra #1603 (Mohali)' },
};

// Merge into the main pincode directory
Object.assign(PINCODE_DIRECTORY, TIER2_PINCODE_ENTRIES);

// Update the inference map in getPincodeServiceability for new state prefixes
const TIER2_PREFIX_MAP: Record<string, { city: string; state: string }> = {
  '60': { city: 'Chennai',    state: 'Tamil Nadu' },
  '70': { city: 'Kolkata',    state: 'West Bengal' },
  '38': { city: 'Ahmedabad',  state: 'Gujarat' },
  '30': { city: 'Jaipur',     state: 'Rajasthan' },
  '44': { city: 'Nagpur',     state: 'Maharashtra' },
  '22': { city: 'Lucknow',    state: 'Uttar Pradesh' },
  '68': { city: 'Kochi',      state: 'Kerala' },
  '16': { city: 'Chandigarh', state: 'Chandigarh' },
};

/**
 * Extended pincode resolver — wraps the original and adds Tier 2/3/4 prefix inference.
 * Replaces getPincodeServiceability for all consumer imports going forward.
 */
const _originalGetPincodeServiceability = getPincodeServiceability;

// Re-export an enhanced version that covers Tier 2 prefixes
// (original function already handles the PINCODE_DIRECTORY lookup after our Object.assign above,
//  so we only need to patch the fallback prefix inference for new cities)
export function getTier2PincodeServiceability(pincode: string): PincodeServiceabilityInfo {
  const cleanPin = pincode.trim();
  // Directory already merged — original handles known pins
  if (PINCODE_DIRECTORY[cleanPin]) {
    return PINCODE_DIRECTORY[cleanPin];
  }
  // Try Tier 2 prefix
  const prefix2 = cleanPin.slice(0, 2);
  const match = TIER2_PREFIX_MAP[prefix2];
  if (match) {
    return {
      pincode: cleanPin,
      area: `${match.city} Zone`,
      city: match.city,
      state: match.state,
      cluster: 'Regional Express',
      slaLabel: '60-90 mins (Regional Chemist Network)',
      estimatedMinutes: 75,
      deliveryFee: 25,
      isHyperlocal: false,
      coldChainReady: true,
      nearbyKendraCount: 1,
      primaryKendraName: `PM Jan Aushadhi Kendra (${match.city} Regional Partner ${cleanPin})`,
    };
  }
  // Full fallback
  return _originalGetPincodeServiceability(cleanPin);
}

/** Consolidated list of all Tier 2/3/4 city metadata for UI quick-select */
export const TIER2_CITIES = [
  { name: 'Chennai',    state: 'Tamil Nadu',     samplePin: '600040', flag: '🏙️' },
  { name: 'Kolkata',    state: 'West Bengal',    samplePin: '700016', flag: '🏙️' },
  { name: 'Ahmedabad',  state: 'Gujarat',        samplePin: '380009', flag: '🏙️' },
  { name: 'Jaipur',     state: 'Rajasthan',      samplePin: '302017', flag: '🏰' },
  { name: 'Nagpur',     state: 'Maharashtra',    samplePin: '440010', flag: '🏙️' },
  { name: 'Lucknow',    state: 'Uttar Pradesh',  samplePin: '226001', flag: '🏛️' },
  { name: 'Kochi',      state: 'Kerala',         samplePin: '682016', flag: '⛵' },
  { name: 'Chandigarh', state: 'Chandigarh',     samplePin: '160017', flag: '🌿' },
] as const;
