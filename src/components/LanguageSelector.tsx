import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const flags = {
  es: '🇪🇸',
  en: '🇬🇧', 
  fr: '🇫🇷',
  de: '🇩🇪',
  ru: '🇷🇺'
};

const languageNames = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  ru: 'Русский'
};

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-1">
      {(Object.keys(flags) as Language[]).map((lang) => (
        <Button
          key={lang}
          variant={language === lang ? "neon" : "ghost"}
          size="sm"
          onClick={() => handleLanguageChange(lang)}
          className="p-2 text-lg hover:scale-110 transition-transform"
          title={languageNames[lang]}
        >
          {flags[lang]}
        </Button>
      ))}
    </div>
  );
};