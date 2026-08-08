/**
 * Trending scam vectors. `advisory` links point to public national resources only.
 */

export const TRENDING = [
  {
    id: "electricity",
    reports: 14280,
    delta: +38,
    severity: "critical",
    tag: { EN: "SMS", HI: "एसएमएस", MR: "एसएमएस" },
    title: {
      EN: "Fake electricity bill disconnection SMS",
      HI: "फ़र्ज़ी बिजली बिल कटने का SMS",
      MR: "बनावट वीज बिल खंडित होण्याचा SMS",
    },
    desc: {
      EN: "“Power will be cut tonight at 9:30” message with a look-alike board portal that harvests card data.",
      HI: "“आज रात 9:30 बजे बिजली कटेगी” संदेश, नक़ली बोर्ड पोर्टल कार्ड विवरण चुराता है।",
      MR: "“आज रात्री ९:३० वाजता वीज खंडित होईल” संदेश, बनावट मंडळ पोर्टल कार्ड तपशील चोरतो.",
    },
    advisory: "https://cybercrime.gov.in",
  },
  {
    id: "jobapk",
    reports: 11640,
    delta: +52,
    severity: "critical",
    tag: { EN: "APK", HI: "एपीके", MR: "एपीके" },
    title: {
      EN: "WhatsApp job offer APK malware",
      HI: "व्हाट्सएप जॉब ऑफ़र APK मैलवेयर",
      MR: "व्हॉट्सअ‍ॅप जॉब ऑफर APK मालवेअर",
    },
    desc: {
      EN: "Part-time task job pitch delivers a sideloaded APK that reads SMS and intercepts OTPs.",
      HI: "पार्ट-टाइम टास्क जॉब के बहाने APK भेजा जाता है जो SMS पढ़कर OTP चुराता है।",
      MR: "पार्ट-टाइम टास्क जॉबच्या बहाण्याने APK पाठवला जातो जो SMS वाचून OTP चोरतो.",
    },
    advisory: "https://cybercrime.gov.in",
  },
  {
    id: "kyc",
    reports: 9870,
    delta: +21,
    severity: "critical",
    tag: { EN: "Portal", HI: "पोर्टल", MR: "पोर्टल" },
    title: {
      EN: "Spoofed bank KYC re-verification portals",
      HI: "नक़ली बैंक KYC पुनर्सत्यापन पोर्टल",
      MR: "बनावट बँक KYC पुनर्पडताळणी पोर्टल",
    },
    desc: {
      EN: "Hyphenated domains mimicking SBI/HDFC/ICICI ask for net-banking credentials plus OTP.",
      HI: "SBI/HDFC/ICICI जैसे हाइफ़न वाले डोमेन नेट-बैंकिंग विवरण व OTP माँगते हैं।",
      MR: "SBI/HDFC/ICICI सारखे हायफनयुक्त डोमेन नेट-बँकिंग तपशील व OTP मागतात.",
    },
    advisory: "https://www.rbi.org.in",
  },
  {
    id: "arrest",
    reports: 8320,
    delta: +64,
    severity: "critical",
    tag: { EN: "Voice", HI: "वॉइस", MR: "व्हॉइस" },
    title: {
      EN: "“Digital arrest” police video-call extortion",
      HI: "“डिजिटल अरेस्ट” पुलिस वीडियो-कॉल वसूली",
      MR: "“डिजिटल अरेस्ट” पोलीस व्हिडिओ-कॉल खंडणी",
    },
    desc: {
      EN: "Fake CBI/customs officers on video call allege a parcel case and demand a “verification transfer”.",
      HI: "वीडियो कॉल पर फ़र्ज़ी CBI/कस्टम अधिकारी पार्सल केस बताकर “सत्यापन ट्रांसफ़र” माँगते हैं।",
      MR: "व्हिडिओ कॉलवर बनावट CBI/कस्टम अधिकारी पार्सल केस सांगून “पडताळणी ट्रान्सफर” मागतात.",
    },
    advisory: "https://cybercrime.gov.in",
  },
  {
    id: "upicollect",
    reports: 7450,
    delta: +17,
    severity: "high",
    tag: { EN: "UPI", HI: "यूपीआई", MR: "यूपीआय" },
    title: {
      EN: "UPI collect-request & QR reversal trap",
      HI: "UPI कलेक्ट-रिक्वेस्ट व QR उलट जाल",
      MR: "UPI कलेक्ट-रिक्वेस्ट व QR उलट सापळा",
    },
    desc: {
      EN: "Buyer sends a QR or collect request “to pay you” — approving it debits your account instead.",
      HI: "ख़रीदार “पैसे भेजने” के नाम पर QR/कलेक्ट रिक्वेस्ट भेजता है — मंज़ूरी देने पर पैसे कटते हैं।",
      MR: "खरेदीदार “पैसे पाठवण्यासाठी” QR/कलेक्ट रिक्वेस्ट पाठवतो — मंजुरी दिल्यास पैसे कापले जातात.",
    },
    advisory: "https://www.npci.org.in",
  },
  {
    id: "traffic",
    reports: 6210,
    delta: +29,
    severity: "high",
    tag: { EN: "SMS", HI: "एसएमएस", MR: "एसएमएस" },
    title: {
      EN: "Fake e-challan traffic fine links",
      HI: "फ़र्ज़ी ई-चालान ट्रैफ़िक जुर्माना लिंक",
      MR: "बनावट ई-चलान वाहतूक दंड लिंक",
    },
    desc: {
      EN: "Look-alike parivahan domains collect card details for a “pending challan” payment.",
      HI: "परिवहन जैसे नक़ली डोमेन “लंबित चालान” के भुगतान हेतु कार्ड विवरण लेते हैं।",
      MR: "परिवहनसारखे बनावट डोमेन “प्रलंबित चलान” भरण्यासाठी कार्ड तपशील घेतात.",
    },
    advisory: "https://cybercrime.gov.in",
  },
  {
    id: "invest",
    reports: 5680,
    delta: +44,
    severity: "high",
    tag: { EN: "Trading", HI: "ट्रेडिंग", MR: "ट्रेडिंग" },
    title: {
      EN: "WhatsApp stock-tip & IPO allotment groups",
      HI: "व्हाट्सएप स्टॉक-टिप व IPO आवंटन ग्रुप",
      MR: "व्हॉट्सअ‍ॅप स्टॉक-टिप व IPO वाटप ग्रुप",
    },
    desc: {
      EN: "Fake advisory groups run a mirror trading app showing fictitious profits before withdrawal is blocked.",
      HI: "फ़र्ज़ी सलाहकार ग्रुप नक़ली ट्रेडिंग ऐप में झूठा मुनाफ़ा दिखाकर निकासी रोक देते हैं।",
      MR: "बनावट सल्लागार ग्रुप नकली ट्रेडिंग अ‍ॅपमध्ये खोटा नफा दाखवून पैसे काढणे रोखतात.",
    },
    advisory: "https://www.sebi.gov.in",
  },
  {
    id: "courier",
    reports: 4390,
    delta: -8,
    severity: "elevated",
    tag: { EN: "Parcel", HI: "पार्सल", MR: "पार्सल" },
    title: {
      EN: "Customs-held parcel clearance fee",
      HI: "कस्टम में रुके पार्सल की क्लीयरेंस फ़ीस",
      MR: "कस्टममध्ये अडकलेल्या पार्सलचे क्लिअरन्स शुल्क",
    },
    desc: {
      EN: "Courier-branded SMS demands a small clearance payment through an unverified gateway.",
      HI: "कूरियर के नाम पर SMS असत्यापित गेटवे से छोटी क्लीयरेंस राशि माँगता है।",
      MR: "कुरिअरच्या नावाने SMS असत्यापित गेटवेवरून छोटी क्लिअरन्स रक्कम मागतो.",
    },
    advisory: "https://www.indiapost.gov.in",
  },
];

export default TRENDING;
