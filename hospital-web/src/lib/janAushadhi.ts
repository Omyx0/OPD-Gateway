/**
 * Jan Aushadhi (PMBJP - Pradhan Mantri Bhartiya Janaushadhi Pariyojana)
 * Generic Medicine & Price Comparison Engine
 *
 * Grounded in the Department of Pharmaceuticals, Government of India formulary.
 * Requires ZERO external API keys — runs entirely client-side with zero latency.
 */

export interface JanAushadhiEquivalent {
  brandedName: string;
  genericSalt: string;
  category: string;
  dosage: string;
  brandedPriceInr: number;
  janAushadhiPriceInr: number;
  savingsInr: number;
  savingsPercent: number;
  directionsHindi: string;
  directionsEnglish: string;
}

export const PMBJP_DRUG_DATABASE: JanAushadhiEquivalent[] = [
  {
    brandedName: "Augmentin 625 Duo",
    genericSalt: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
    category: "Antibiotic",
    dosage: "1 tablet twice daily after meals",
    brandedPriceInr: 204.0,
    janAushadhiPriceInr: 58.5,
    savingsInr: 145.5,
    savingsPercent: 71,
    directionsHindi: "यह एंटीबायोटिक गोली सुबह और शाम खाना खाने के बाद लें। कोर्स पूरा करें।",
    directionsEnglish: "Take 1 tablet twice daily after meals. Complete the full antibiotic course.",
  },
  {
    brandedName: "Pan-D / Pantocid-D",
    genericSalt: "Pantoprazole (40mg) + Domperidone (30mg SR)",
    category: "Gastrointestinal / Antacid",
    dosage: "1 capsule once daily before breakfast",
    brandedPriceInr: 198.0,
    janAushadhiPriceInr: 32.0,
    savingsInr: 166.0,
    savingsPercent: 84,
    directionsHindi: "सुबह खाली पेट, नाश्ते से 30 मिनट पहले एक कैप्सूल ताज़े पानी के साथ लें।",
    directionsEnglish: "Take 1 capsule on an empty stomach, 30 minutes before morning tea or breakfast.",
  },
  {
    brandedName: "Glycomet-GP 2",
    genericSalt: "Glimepiride (2mg) + Metformin (500mg SR)",
    category: "Anti-Diabetic",
    dosage: "1 tablet daily with breakfast",
    brandedPriceInr: 142.0,
    janAushadhiPriceInr: 22.0,
    savingsInr: 120.0,
    savingsPercent: 85,
    directionsHindi: "सुबह नाश्ते के पहले निवाले के साथ 1 गोली लें। मीठा खाने से परहेज रखें।",
    directionsEnglish: "Take 1 tablet with the first bite of your morning breakfast. Monitor blood sugar.",
  },
  {
    brandedName: "Telma 40 / Telmikind",
    genericSalt: "Telmisartan (40mg)",
    category: "Cardiovascular / Hypertension",
    dosage: "1 tablet once daily in the morning",
    brandedPriceInr: 135.0,
    janAushadhiPriceInr: 18.0,
    savingsInr: 117.0,
    savingsPercent: 87,
    directionsHindi: "ब्लड प्रेशर नियंत्रण के लिए रोजाना सुबह 1 गोली नियमित समय पर लें।",
    directionsEnglish: "Take 1 tablet daily at a fixed time in the morning for blood pressure control.",
  },
  {
    brandedName: "Lipitor / Atorva 10",
    genericSalt: "Atorvastatin (10mg)",
    category: "Cardiovascular / Cholesterol",
    dosage: "1 tablet once daily at bedtime",
    brandedPriceInr: 110.0,
    janAushadhiPriceInr: 16.0,
    savingsInr: 94.0,
    savingsPercent: 85,
    directionsHindi: "कोलेस्ट्रॉल कम करने के लिए रात को सोने से पहले 1 गोली लें।",
    directionsEnglish: "Take 1 tablet at night before sleeping to maintain healthy cholesterol levels.",
  },
  {
    brandedName: "Calpol 650 / Dolo 650",
    genericSalt: "Paracetamol (650mg)",
    category: "Antipyretic / Analgesic",
    dosage: "1 tablet as needed for fever or body ache",
    brandedPriceInr: 34.0,
    janAushadhiPriceInr: 9.5,
    savingsInr: 24.5,
    savingsPercent: 72,
    directionsHindi: "बुखार या तेज बदन दर्द होने पर 1 गोली लें। 6 घंटे में एक बार से ज्यादा न लें।",
    directionsEnglish: "Take 1 tablet when fever exceeds 100°F or for body ache. Minimum 6-hour gap.",
  },
  {
    brandedName: "Azithral 500",
    genericSalt: "Azithromycin (500mg)",
    category: "Antibiotic",
    dosage: "1 tablet once daily 1 hour before meals",
    brandedPriceInr: 128.0,
    janAushadhiPriceInr: 38.0,
    savingsInr: 90.0,
    savingsPercent: 70,
    directionsHindi: "दिन में 1 बार खाना खाने से 1 घंटा पहले लें। लगातार 3 या 5 दिन का कोर्स पूरा करें।",
    directionsEnglish: "Take 1 tablet once daily 1 hour before meals. Do not discontinue mid-course.",
  },
  {
    brandedName: "Montair-LC",
    genericSalt: "Levocetirizine (5mg) + Montelukast (10mg)",
    category: "Anti-Allergy / Respiratory",
    dosage: "1 tablet at bedtime",
    brandedPriceInr: 185.0,
    janAushadhiPriceInr: 32.0,
    savingsInr: 153.0,
    savingsPercent: 83,
    directionsHindi: "एलर्जी और खांसी की रोकथाम के लिए रात को सोने से पहले 1 गोली लें।",
    directionsEnglish: "Take 1 tablet at bedtime to relieve allergic rhinitis, coughing, and sneezing.",
  },
];

/**
 * Searches for a generic PMBJP salt match by branded name or chemical substring.
 */
export function findGenericEquivalent(query: string): JanAushadhiEquivalent | null {
  if (!query || query.trim().length === 0) return null;
  const q = query.toLowerCase().trim();

  return (
    PMBJP_DRUG_DATABASE.find(
      (item) =>
        item.brandedName.toLowerCase().includes(q) ||
        q.includes(item.brandedName.toLowerCase().split(" ")[0]) ||
        item.genericSalt.toLowerCase().includes(q)
    ) || null
  );
}

/**
 * Calculates total savings for a list of prescribed medications.
 */
export function calculatePrescriptionSavings(medNames: string[]) {
  let totalBranded = 0;
  let totalGeneric = 0;
  const matches: JanAushadhiEquivalent[] = [];

  for (const name of medNames) {
    const match = findGenericEquivalent(name);
    if (match) {
      matches.push(match);
      totalBranded += match.brandedPriceInr;
      totalGeneric += match.janAushadhiPriceInr;
    }
  }

  const totalSaved = totalBranded - totalGeneric;
  const percentSaved = totalBranded > 0 ? Math.round((totalSaved / totalBranded) * 100) : 0;

  return {
    matchedCount: matches.length,
    matches,
    totalBranded,
    totalGeneric,
    totalSaved,
    percentSaved,
  };
}
