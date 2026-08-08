/**
 * Reported-fraud origin clusters across India.
 * Figures are illustrative telemetry for the simulation, not official statistics.
 */

export const HOTSPOTS = [
  {
    id: "jamtara",
    lat: 23.9615,
    lng: 86.8028,
    reports: 4820,
    level: "critical",
    name: { EN: "Jamtara Cluster", HI: "जामताड़ा क्लस्टर", MR: "जामतारा क्लस्टर" },
    region: { EN: "Jharkhand", HI: "झारखंड", MR: "झारखंड" },
    vector: {
      EN: "UPI / OTP voice phishing",
      HI: "UPI / OTP वॉइस फ़िशिंग",
      MR: "UPI / OTP व्हॉइस फिशिंग",
    },
  },
  {
    id: "mewat",
    lat: 28.0,
    lng: 77.0167,
    reports: 4110,
    level: "critical",
    name: { EN: "Mewat / Nuh Region", HI: "मेवात / नूह क्षेत्र", MR: "मेवात / नूह प्रदेश" },
    region: { EN: "Haryana", HI: "हरियाणा", MR: "हरियाणा" },
    vector: {
      EN: "OLX & sextortion fraud",
      HI: "OLX व सेक्सटॉर्शन ठगी",
      MR: "OLX व सेक्सटॉर्शन फसवणूक",
    },
  },
  {
    id: "delhi",
    lat: 28.6139,
    lng: 77.209,
    reports: 3760,
    level: "critical",
    name: { EN: "Delhi NCR", HI: "दिल्ली एनसीआर", MR: "दिल्ली एनसीआर" },
    region: { EN: "Delhi · Noida · Gurugram", HI: "दिल्ली · नोएडा · गुरुग्राम", MR: "दिल्ली · नोएडा · गुरुग्राम" },
    vector: {
      EN: "Fake call-centre & loan apps",
      HI: "फ़र्ज़ी कॉल-सेंटर व लोन ऐप",
      MR: "बनावट कॉल-सेंटर व कर्ज अ‍ॅप्स",
    },
  },
  {
    id: "mumbai",
    lat: 19.076,
    lng: 72.8777,
    reports: 3180,
    level: "high",
    name: { EN: "Mumbai Metro", HI: "मुंबई महानगर", MR: "मुंबई महानगर" },
    region: { EN: "Maharashtra", HI: "महाराष्ट्र", MR: "महाराष्ट्र" },
    vector: {
      EN: "Investment & IPO scams",
      HI: "निवेश व IPO घोटाले",
      MR: "गुंतवणूक व IPO घोटाळे",
    },
  },
  {
    id: "bengaluru",
    lat: 12.9716,
    lng: 77.5946,
    reports: 2940,
    level: "high",
    name: { EN: "Bengaluru Tech Belt", HI: "बेंगलुरु टेक बेल्ट", MR: "बेंगळूरू टेक बेल्ट" },
    region: { EN: "Karnataka", HI: "कर्नाटक", MR: "कर्नाटक" },
    vector: {
      EN: "Digital arrest & task fraud",
      HI: "डिजिटल अरेस्ट व टास्क ठगी",
      MR: "डिजिटल अरेस्ट व टास्क फसवणूक",
    },
  },
  {
    id: "hyderabad",
    lat: 17.385,
    lng: 78.4867,
    reports: 2310,
    level: "high",
    name: { EN: "Hyderabad", HI: "हैदराबाद", MR: "हैदराबाद" },
    region: { EN: "Telangana", HI: "तेलंगाना", MR: "तेलंगणा" },
    vector: {
      EN: "Trading app impersonation",
      HI: "ट्रेडिंग ऐप की नक़ल",
      MR: "ट्रेडिंग अ‍ॅपची बतावणी",
    },
  },
  {
    id: "kolkata",
    lat: 22.5726,
    lng: 88.3639,
    reports: 1870,
    level: "elevated",
    name: { EN: "Kolkata Belt", HI: "कोलकाता बेल्ट", MR: "कोलकाता पट्टा" },
    region: { EN: "West Bengal", HI: "पश्चिम बंगाल", MR: "पश्चिम बंगाल" },
    vector: {
      EN: "Fake KYC portals",
      HI: "फ़र्ज़ी KYC पोर्टल",
      MR: "बनावट KYC पोर्टल",
    },
  },
  {
    id: "ahmedabad",
    lat: 23.0225,
    lng: 72.5714,
    reports: 1620,
    level: "elevated",
    name: { EN: "Ahmedabad", HI: "अहमदाबाद", MR: "अहमदाबाद" },
    region: { EN: "Gujarat", HI: "गुजरात", MR: "गुजरात" },
    vector: {
      EN: "Electricity-bill SMS lures",
      HI: "बिजली बिल SMS लालच",
      MR: "वीज बिल SMS आमिष",
    },
  },
  {
    id: "bharatpur",
    lat: 27.2173,
    lng: 77.4901,
    reports: 1490,
    level: "elevated",
    name: { EN: "Bharatpur / Deeg", HI: "भरतपुर / डीग", MR: "भरतपूर / डीग" },
    region: { EN: "Rajasthan", HI: "राजस्थान", MR: "राजस्थान" },
    vector: {
      EN: "Army-personnel impersonation",
      HI: "सेना कर्मी की नक़ल",
      MR: "सेना कर्मचाऱ्याचे सोंग",
    },
  },
  {
    id: "patna",
    lat: 25.5941,
    lng: 85.1376,
    reports: 1240,
    level: "moderate",
    name: { EN: "Patna Corridor", HI: "पटना कॉरिडोर", MR: "पाटणा कॉरिडोर" },
    region: { EN: "Bihar", HI: "बिहार", MR: "बिहार" },
    vector: {
      EN: "Job-offer APK malware",
      HI: "नौकरी APK मैलवेयर",
      MR: "नोकरी APK मालवेअर",
    },
  },
  {
    id: "chennai",
    lat: 13.0827,
    lng: 80.2707,
    reports: 1180,
    level: "moderate",
    name: { EN: "Chennai", HI: "चेन्नई", MR: "चेन्नई" },
    region: { EN: "Tamil Nadu", HI: "तमिलनाडु", MR: "तमिळनाडू" },
    vector: {
      EN: "Courier / customs fraud",
      HI: "कूरियर / कस्टम ठगी",
      MR: "कुरिअर / कस्टम फसवणूक",
    },
  },
  {
    id: "lucknow",
    lat: 26.8467,
    lng: 80.9462,
    reports: 1050,
    level: "moderate",
    name: { EN: "Lucknow", HI: "लखनऊ", MR: "लखनौ" },
    region: { EN: "Uttar Pradesh", HI: "उत्तर प्रदेश", MR: "उत्तर प्रदेश" },
    vector: {
      EN: "Pension & subsidy phishing",
      HI: "पेंशन व सब्सिडी फ़िशिंग",
      MR: "निवृत्तिवेतन व अनुदान फिशिंग",
    },
  },
];

export const LEVEL_META = {
  critical: { color: "--c-threat", radius: 17, tKey: "critical" },
  high: { color: "--c-threat", radius: 14, tKey: "high" },
  elevated: { color: "--c-warn", radius: 11.5, tKey: "elevated" },
  moderate: { color: "--c-warn", radius: 9.5, tKey: "moderate" },
};

export default HOTSPOTS;
