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

    const renderSelect = (label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { value: string, label: string }[]) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('appSettings')}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{t('customizeAppearance')}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
                <div className="space-y-8">
                    {renderSelect(t('language'), settings.language, handleLanguageChange, [
                        { value: 'ar', label: t('arabic') },
                        { value: 'en', label: t('english') },
                    ])}

                    {renderSelect(t('numberFormat'), settings.numberFormat, handleNumberFormatChange, [
                        { value: 'ar', label: t('arabicNumerals') },
                        { value: 'en', label: t('englishNumerals') },
                    ])}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;