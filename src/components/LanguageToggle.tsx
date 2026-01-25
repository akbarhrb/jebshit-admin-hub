import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors text-sm font-medium"
      title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Globe className="w-4 h-4" />
      <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
};

export default LanguageToggle;
