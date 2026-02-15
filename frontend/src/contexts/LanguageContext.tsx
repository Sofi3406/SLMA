'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'am' | 'silt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translations dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Silte',
    'nav.slma': 'About SLMA',
    'nav.membership': 'Membership',
    'nav.events': 'Events',
    'nav.gallery': 'Gallery',
    'nav.projects': 'Projects',
    'nav.donate': 'Donate',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    
    // Hero Section
    'hero.title': 'Silte Lmat Mehber',
    'hero.subtitle': 'Preserving heritage, building community, creating future',
    'hero.cta.register': 'Become a Member',
    'hero.cta.learn': 'Learn More',
    
    // Woreda/Community
    'woreda.select': 'Select Woreda',
    'woreda.worabe': 'Worabe',
    'woreda.hulbarag': 'Hulbarag',
    'woreda.sankura': 'Sankura',
    'woreda.alicho': 'Alicho',
    'woreda.silti': 'Silti',
    'woreda.dalocha': 'Dalocha',
    'woreda.lanforo': 'Lanforo',
    'woreda.east_azernet': 'East Azernet Berbere',
    'woreda.west_azernet': 'West Azernet Berbere',
    
    // Auth
    'auth.register.title': 'Join SLMA Community',
    'auth.login.title': 'Welcome Back',
    'auth.forgot.password': 'Forgot Password?',
    'auth.no.account': "Don't have an account?",
    'auth.have.account': 'Already have an account?',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
  },
  am: {
    // Navigation
    'nav.home': 'መነሻ ገጽ',
    'nav.about': 'ስለ ስልጤ',
    'nav.slma': 'ስለ SLMA',
    'nav.membership': 'አባልነት',
    'nav.events': 'ዝግጅቶች',
    'nav.gallery': 'ፎቶ አልበም',
    'nav.projects': 'ፕሮጀክቶች',
    'nav.donate': 'ይለግሱ',
    'nav.login': 'ግባ',
    'nav.register': 'ይመዝገቡ',
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.logout': 'ውጣ',
    
    // Hero Section
    'hero.title': 'ስልጤ ልማት መሀበር',
    'hero.subtitle': 'ቅርስ መጠብቅ፣ ማህበረሰብ መገንባት፣ መጪ መፍጠር',
    'hero.cta.register': 'አባል ይሁኑ',
    'hero.cta.learn': 'ተጨማሪ ይወቁ',
    
    // Woreda/Community
    'woreda.select': 'ወረዳ ይምረጡ',
    'woreda.worabe': 'ወራቤ',
    'woreda.hulbarag': 'ሑልበራግ',
    'woreda.sankura': 'ሳንኩራ',
    'woreda.alicho': 'አሊቾ',
    'woreda.silti': 'ስልጢ',
    'woreda.dalocha': 'ዳሎጫ',
    'woreda.lanforo': 'ላንፎሮ',
    'woreda.east_azernet': 'ምሥራቅ አዘነርት በርበሬ',
    'woreda.west_azernet': 'ምዕራብ አዘነርት በርበሬ',
    
    // Auth
    'auth.register.title': 'ወደ SLMA ማህበረሰብ ይቀላቀሉ',
    'auth.login.title': 'እንኳን ደህና መጡ',
    'auth.forgot.password': 'የይለፍ ቃል ረሳኽው?',
    'auth.no.account': 'መለያ የሎትም?',
    'auth.have.account': 'አስቀድሞ መለያ አሎት?',
    
    // Common
    'common.loading': 'በመጫን ላይ...',
    'common.error': 'ስህተት ተከስቷል',
    'common.success': 'ተሳክቷል!',
    'common.save': 'አስቀምጥ',
    'common.cancel': 'ሰርዝ',
    'common.delete': 'ሰርዝ',
    'common.edit': 'አርትዕ',
    'common.view': 'ተመልከት',
    'common.back': 'ተመለስ',
    'common.next': 'ቀጣይ',
    'common.submit': 'አስገባ',
  },
  silt: {
    // Navigation - FILL IN SILTE TRANSLATIONS HERE ******
    'nav.home': 'የፍቴ ኡፍት',
    'nav.about': 'ስልጤን ለቻሎት',
    'nav.slma': 'ስልማን ለቻሎት',
    'nav.membership': 'ወሽነት',
    'nav.events': 'መስነጀ',
    'nav.gallery': 'ምስል',
    'nav.projects': 'ፕሮጀርት',
    'nav.donate': 'ያቡ',
    'nav.login': 'ግቡ',
    'nav.register': 'ምዝገቤ',
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.logout':'ለውጦት',
    
    // Hero Section
    'hero.title': 'ስልመ ላቶ ሴራ',
    'hero.subtitle': 'ቅሬቶ ቂሮት፣አመሰብ ንባረት',
    'hero.cta.register': 'ወሸ ለውኖት',
    'hero.cta.learn': 'ፈየክ ለቻሎት',
    
    // Woreda/Community
   'woreda.select': 'ወረዳ የሚጥሩ',
    'woreda.worabe': 'ወራቤ',
    'woreda.hulbarag': 'ሁልበራግ',
    'woreda.sankura': 'ሳንኩራ',
    'woreda.alicho': 'አሊቾ',
    'woreda.silti': 'ስልጢ',
    'woreda.dalocha': 'ዳሎጫ',
    'woreda.lanforo': 'ላንፎሮ',
    'woreda.east_azernet': 'ሸርቅ አዘነርት በርበሬ',
    'woreda.west_azernet': 'ገርብ አዘነርት በርበሬ',
    
    // Auth
    'auth.register.title': 'ስልመ ላቶ ሴረ የግቡ',
    'auth.login.title': 'ሀበይ ቦገሬት መጣሙ',
    'auth.forgot.password': 'የሺሞ ቀውል ረሳሙ?',
    'auth.no.account': 'ትቻልቡያሙይ ኤለሙ?',
    'auth.have.account': 'ቲኢ ቀደ መቻዬ አለሙ?',
    
    // Common
    'common.loading': 'በጫኖት ደር',
    'common.error': 'አሌት ተረሼ',
    'common.success': 'ተረሻን',
    'common.save': 'አድጉብል',
    'common.cancel': 'አትፈ',
    'common.delete': 'አትፈ',
    'common.edit': 'አቅነ/አቢዥ',
    'common.view': 'ሂንዥ',
    'common.back': 'ተክነበል',
    'common.next': 'ዬገሬ',
    'common.submit': 'አግበ',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'am', 'silt'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    if (lang === 'am' || lang === 'silt') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
