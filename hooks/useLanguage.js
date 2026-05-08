// hooks/useLanguage.js
"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/translations";

export function useLanguage() {
  const [lang, setLang] = useState("en");
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    
    const savedLang = getCookie('lang');
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLang(savedLang);
      setT(translations[savedLang]);
    }
  }, []);

  const setLanguageCookie = (language) => {
    document.cookie = `lang=${language}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setLang(language);
    setT(translations[language]);
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLanguageCookie(newLang);
  };

  return { lang, t, toggleLanguage, setLanguage: setLanguageCookie };
}