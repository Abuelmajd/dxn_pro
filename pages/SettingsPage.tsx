import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Language, NumberFormat } from '../types';

const SettingsPage: React.FC = () => {
    const { settings, updateSettings, t } = useAppContext();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateSettings({ language: e.target.value as Language });
    };

    const handleNumberFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateSettings({ numberFormat: e.target.value as NumberFormat });
    };

    const handleProfitMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            updateSettings({ profitMarginILS: value });
        }
    };

    const handleThemeChange = (theme: 'light' | 'dark') => {
        updateSettings({ theme });
    };

    const renderSelect = (label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { value: string, label: string }[]) => (
        <div>
            <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full p-3 bg-input-bg rounded-lg border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">{t('appSettings')}</h1>
                <p className="mt-1 text-text-secondary">{t('customizeAppearance')}</p>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8">
                <div className="space-y-8">
                    {renderSelect(t('language'), settings.language, handleLanguageChange, [
                        { value: 'ar', label: t('arabic') },
                        { value: 'en', label: t('english') },
                    ])}

                    {renderSelect(t('numberFormat'), settings.numberFormat, handleNumberFormatChange, [
                        { value: 'ar', label: t('arabicNumerals') },
                        { value: 'en', label: t('englishNumerals') },
                    ])}
                    
                    <div>
                        <label htmlFor="profitMargin" className="block text-sm font-medium text-text-primary mb-2">{t('profitMargin')}</label>
                        <div className="relative">
                            <input
                                type="number"
                                id="profitMargin"
                                value={settings.profitMarginILS ?? 20}
                                onChange={handleProfitMarginChange}
                                className="w-full p-3 bg-input-bg rounded-lg border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                                step="1"
                            />
                            <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                <span className="text-text-secondary sm:text-sm">{settings.currency.symbol}</span>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-text-secondary">{t('profitMarginDescription')}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">{t('theme')}</label>
                        <div className="flex items-center gap-2 p-1 bg-input-bg rounded-lg border border-border">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${settings.theme === 'light' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-card-secondary'}`}
                            >
                                {t('lightMode')}
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${settings.theme === 'dark' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-card-secondary'}`}
                            >
                                {t('darkMode')}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-text-primary">{t('notifications')}</h2>
                <p className="mt-1 text-text-secondary">{t('notificationsDescription')}</p>
            </div>
            <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8 mt-4">
                <div className="space-y-4">
                    <p className="text-text-primary font-semibold">{t('notificationsInstructionsTitle')}</p>
                    <ol className="list-decimal list-inside space-y-2 text-text-secondary text-sm rtl:pr-4">
                        <li>{t('notificationsInstructionsStep1')}</li>
                        <li>{t('notificationsInstructionsStep2')}</li>
                        <li>{t('notificationsInstructionsStep3')}</li>
                        <li>{t('notificationsInstructionsStep4')}</li>
                    </ol>
                    <div className="p-3 bg-card-secondary rounded-md text-xs text-text-secondary border border-border">
                      <p>{t('notificationsNote')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;