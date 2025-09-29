import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'te', name: 'తెలుగు', flag: '��' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className="language-selector">
      <select 
        value={i18n.language} 
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="language-select"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      
      <style jsx>{`
        .language-selector {
          position: relative;
        }
        
        .language-select {
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0.5rem;
          font-size: 0.9rem;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }
        
        .language-select:hover {
          border-color: var(--primary-color);
        }
        
        .language-select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(45, 80, 22, 0.1);
        }
        
        @media (max-width: 768px) {
          .language-select {
            font-size: 0.8rem;
            padding: 0.4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;