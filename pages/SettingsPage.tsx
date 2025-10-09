// pages/SettingsPage.tsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Language, NumberFormat } from '../types';
import SearchableSelect from '../components/SearchableSelect';

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SettingsPage: React.FC = () => {
    const { settings, updateSettings, t, products: allProducts, getProductById, formatCurrency, removeDiscount } = useAppContext();
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [previewProducts, setPreviewProducts] = useState<{name: string, originalPrice: number, newPrice: number}[]>([]);

    useEffect(() => {
        if (!selectedProductId || !discountPercentage || discountPercentage <= 0 || discountPercentage > 100) {
            setPreviewProducts([]);
            return;
        }

        const productsToShow = selectedProductId === 'ALL'
            ? allProducts.slice(0, 3) // Show first 3 products for a global discount
            : allProducts.filter(p => p.id === selectedProductId);

        const discountMultiplier = 1 - (discountPercentage / 100);

        const previews = productsToShow.map(p => ({
            name: p.name,
            originalPrice: p.price, // .price from context is already after profit margin
            newPrice: p.price * discountMultiplier,
        }));

        setPreviewProducts(previews);

    }, [selectedProductId, discountPercentage, allProducts]);

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

    const handleAddDiscount = () => {
        if (!selectedProductId || discountPercentage <= 0 || discountPercentage > 100) {
            return;
        }

        const newDiscount = {
            productId: selectedProductId,
            percentage: discountPercentage
        };
        
        const existingDiscounts = settings.discounts || [];
        if (existingDiscounts.some(d => d.productId === newDiscount.productId)) {
            // Do not add if a discount for this product/all already exists.
            // A more advanced version could show an error message.
            return;
        }

        updateSettings({
            discounts: [...existingDiscounts, newDiscount]
        });

        // Reset form
        setSelectedProductId('');
        setDiscountPercentage(0);
    };

    const handleDeleteDiscount = (productIdToDelete: string) => {
        // Use the centralized removeDiscount function from context
        removeDiscount(productIdToDelete);
    };

    const productOptions = allProducts.map(p => ({ value: p.id, label: p.name }));


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
        <div className="max-w-4xl mx-auto">
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
                <h2 className="text-2xl font-bold text-text-primary">{t('discountsAndOffers')}</h2>
            </div>
            <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8 mt-4 space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">{t('addProductDiscount')}</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow">
                            <SearchableSelect
                                value={selectedProductId}
                                onChange={setSelectedProductId}
                                options={productOptions}
                                staticOption={{ value: 'ALL', label: t('allProducts') }}
                                placeholder={t('selectProduct')}
                            />
                        </div>
                        <input
                            type="number"
                            placeholder={t('discountPercentage')}
                            value={discountPercentage || ''}
                            onChange={e => setDiscountPercentage(Number(e.target.value))}
                            className="sm:w-1/3 p-3 bg-input-bg rounded-lg border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                            min="1"
                            max="100"
                        />
                         <button
                            onClick={handleAddDiscount}
                            disabled={!selectedProductId || discountPercentage <= 0 || discountPercentage > 100}
                            className="px-6 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {t('addOffer')}
                        </button>
                    </div>

                    {previewProducts.length > 0 && (
                        <div className="mt-6 p-4 border border-border rounded-lg bg-card-secondary space-y-4" aria-live="polite">
                            <h4 className="font-semibold text-text-primary">{t('pricePreview')}</h4>
                            <div className="space-y-3">
                                {previewProducts.map(p => (
                                    <div key={p.name} className="flex justify-between items-center pb-2 border-b border-border/50 last:border-b-0">
                                        <span className="text-text-secondary truncate pr-4 text-base">{p.name}</span>
                                        <div className="flex items-baseline gap-3 font-mono">
                                            <span className="text-lg text-red-500 line-through">{formatCurrency(p.originalPrice)}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                            <span className="text-xl font-bold text-green-500">{formatCurrency(p.newPrice)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">{t('currentOffers')}</h3>
                    <div className="space-y-3">
                        {(settings.discounts && settings.discounts.length > 0) ? (
                            settings.discounts.map(discount => {
                                const product = discount.productId === 'ALL' ? null : allProducts.find(p => p.id === discount.productId);
                                const discountName = product ? `${t('productDiscount')} ${product.name}` : t('globalDiscount');
                                return (
                                    <div key={discount.productId} className="flex justify-between items-center p-3 bg-card-secondary rounded-lg">
                                        <div>
                                            <p className="font-medium text-text-primary">{discountName}</p>
                                            <p className="text-sm font-bold text-accent">{`-${discount.percentage}%`}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDiscount(discount.productId)}
                                            className="p-2 rounded-full text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                            title={`${t('delete')} ${t('addOffer')}`}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-text-secondary text-center py-4">{t('noOffers')}</p>
                        )}
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