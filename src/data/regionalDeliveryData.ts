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
