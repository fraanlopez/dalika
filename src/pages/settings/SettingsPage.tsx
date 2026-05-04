import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';

type Language = 'en' | 'es';

const languages: { value: Language; label: string }[] = [
  { value: 'en', label: 'settings.english' },
  { value: 'es', label: 'settings.spanish' },
];

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<Language>(i18n.language as Language);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setCurrentLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('dalika-language', newLang);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('settings.title')}</h1>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.language')}</h2>
          <Select
            value={currentLang}
            onChange={handleLanguageChange}
            options={languages.map((lang) => ({
              value: lang.value,
              label: t(lang.label),
            }))}
          />
        </div>
      </Card>
    </div>
  );
}
