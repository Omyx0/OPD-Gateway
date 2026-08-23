/**
 * Frontend-only mock localisation. No translation API — a small static
 * dictionary so language selection visibly changes the kiosk UI text.
 */

export type LanguageCode = "en" | "hi" | "regional";

export interface KioskLanguage {
  code: LanguageCode;
  label: string;
  native: string;
  note?: string;
}

export const KIOSK_LANGUAGES: KioskLanguage[] = [
  { code: "en", label: "English", native: "English", note: "Default kiosk language" },
  { code: "hi", label: "Hindi", native: "हिन्दी", note: "पूरी स्क्रीन हिन्दी में" },
  {
    code: "regional",
    label: "Regional language",
    native: "प्रादेशिक भाषा",
    note: "Placeholder — sample screens only",
  },
];

export interface KioskCopy {
  brand: string;
  hospital: string;
  eyebrow: string;
  welcomeTitle: string;
  welcomeSub: string;
  start: string;
  language: string;
  accessibility: string;
  help: string;
  back: string;
  continueLabel: string;
  emergency: string;
  emergencyShort: string;
  footerHelp: string;
  demoNote: string;
  steps: { title: string; text: string }[];
  languageTitle: string;
  languageSub: string;
  selected: string;
  accessibilityTitle: string;
  accessibilitySub: string;
  largerText: string;
  largerTextHint: string;
  higherContrast: string;
  higherContrastHint: string;
  reducedMotion: string;
  reducedMotionHint: string;
  voicePreference: string;
  voicePreferenceHint: string;
  voiceOff: string;
  voiceSpoken: string;
  voiceSlow: string;
  clearLabels: string;
  clearLabelsHint: string;
  helpTitle: string;
  helpBody: string;
  close: string;
  savedLocally: string;
}

const en: KioskCopy = {
  brand: "Smart OPD",
  hospital: "City General Hospital",
  eyebrow: "Outpatient department",
  welcomeTitle: "Welcome to OPD",
  welcomeSub: "Register, share your symptoms, and receive your OPD queue token.",
  start: "Start registration",
  language: "Language",
  accessibility: "Accessibility",
  help: "Help",
  back: "Back",
  continueLabel: "Continue",
  emergency: "I need help now",
  emergencyShort: "Help",
  footerHelp: "Feeling unwell or unsure? Staff can help you right away.",
  demoNote: "Demonstration interface — no real patient data is stored.",
  steps: [
    { title: "Register", text: "Scan your ID or enter your details" },
    { title: "Share symptoms", text: "Answer a few simple questions" },
    { title: "Get your token", text: "See your department and waiting time" },
  ],
  languageTitle: "Choose your language",
  languageSub: "You can change this at any time from the top of the screen.",
  selected: "Selected",
  accessibilityTitle: "Make this kiosk easier to use",
  accessibilitySub: "Change how the screen looks and sounds. Your choices stay on this kiosk.",
  largerText: "Larger text",
  largerTextHint: "Increase the size of all text on screen",
  higherContrast: "Higher contrast",
  higherContrastHint: "Stronger borders and darker text",
  reducedMotion: "Reduced motion",
  reducedMotionHint: "Turn off screen animations",
  voicePreference: "Voice preference",
  voicePreferenceHint: "How instructions should be read out (demonstration only)",
  voiceOff: "No voice",
  voiceSpoken: "Read aloud",
  voiceSlow: "Read aloud slowly",
  clearLabels: "Clear labels",
  clearLabelsHint: "Show plain-language helper text under every control",
  helpTitle: "Need a hand?",
  helpBody:
    "A staff member at the help desk can complete registration for you. If you feel very unwell, use the red “I need help now” button at the bottom of the screen.",
  close: "Close",
  savedLocally: "Your choices stay on this kiosk only.",
};

const hi: KioskCopy = {
  brand: "स्मार्ट ओपीडी",
  hospital: "सिटी जनरल अस्पताल",
  eyebrow: "बाह्य रोगी विभाग",
  welcomeTitle: "ओपीडी में आपका स्वागत है",
  welcomeSub: "पंजीकरण करें, अपने लक्षण बताएं और अपना ओपीडी टोकन प्राप्त करें।",
  start: "पंजीकरण शुरू करें",
  language: "भाषा",
  accessibility: "सुगमता",
  help: "सहायता",
  back: "पीछे",
  continueLabel: "आगे बढ़ें",
  emergency: "मुझे अभी मदद चाहिए",
  emergencyShort: "मदद",
  footerHelp: "तबीयत ठीक नहीं लग रही? स्टाफ तुरंत आपकी मदद करेगा।",
  demoNote: "यह केवल प्रदर्शन है — कोई वास्तविक रोगी जानकारी संग्रहीत नहीं होती।",
  steps: [
    { title: "पंजीकरण", text: "अपना पहचान पत्र स्कैन करें या विवरण भरें" },
    { title: "लक्षण बताएं", text: "कुछ आसान सवालों के जवाब दें" },
    { title: "टोकन लें", text: "अपना विभाग और प्रतीक्षा समय देखें" },
  ],
  languageTitle: "अपनी भाषा चुनें",
  languageSub: "आप इसे कभी भी ऊपर से बदल सकते हैं।",
  selected: "चयनित",
  accessibilityTitle: "इस स्क्रीन को आसान बनाएं",
  accessibilitySub: "स्क्रीन कैसी दिखे और सुनाई दे, यह बदलें। आपकी पसंद इसी कियोस्क पर रहती है।",
  largerText: "बड़ा टेक्स्ट",
  largerTextHint: "स्क्रीन पर सभी अक्षर बड़े करें",
  higherContrast: "अधिक कंट्रास्ट",
  higherContrastHint: "गहरे अक्षर और स्पष्ट किनारे",
  reducedMotion: "कम एनिमेशन",
  reducedMotionHint: "स्क्रीन की हलचल बंद करें",
  voicePreference: "आवाज़ पसंद",
  voicePreferenceHint: "निर्देश कैसे पढ़े जाएं (केवल प्रदर्शन)",
  voiceOff: "आवाज़ नहीं",
  voiceSpoken: "पढ़कर सुनाएं",
  voiceSlow: "धीरे-धीरे सुनाएं",
  clearLabels: "स्पष्ट लेबल",
  clearLabelsHint: "हर विकल्प के नीचे आसान भाषा में जानकारी दिखाएं",
  helpTitle: "मदद चाहिए?",
  helpBody:
    "सहायता डेस्क पर मौजूद स्टाफ आपका पंजीकरण कर सकता है। अगर तबीयत बहुत खराब है तो नीचे लाल “मुझे अभी मदद चाहिए” बटन दबाएं।",
  close: "बंद करें",
  savedLocally: "आपकी पसंद केवल इसी कियोस्क पर रहती है।",
};

const regional: KioskCopy = {
  ...en,
  eyebrow: "Regional language preview",
  welcomeTitle: "Welcome to OPD",
  welcomeSub:
    "Register, share your symptoms, and receive your OPD queue token. Regional translations are a placeholder in this demonstration.",
};

export const KIOSK_COPY: Record<LanguageCode, KioskCopy> = { en, hi, regional };

export function getCopy(code: string): KioskCopy {
  return KIOSK_COPY[(code as LanguageCode) in KIOSK_COPY ? (code as LanguageCode) : "en"];
}
