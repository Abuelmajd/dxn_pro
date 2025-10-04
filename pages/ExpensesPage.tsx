import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Expense } from '../types';

const ExpensesPage: React.FC = () => {
    const { expenses, addExpense, deleteExpense, t, formatCurrency, formatNumber, settings, isUpdating } = useAppContext();

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || amount <= 0) {
            setError(t('errorInvalidExpense'));
            return;
        }
        setError('');
        
        const success = await addExpense({ description, amount, date: new Date(`${date}T00:00:00`) });

        if(success) {
            setDescription('');
            setAmount(0);
            setDate(new Date().toISOString().split('T')[0]);
        } else {
            setError("فشل إضافة المصروف. يرجى المحاولة مرة أخرى.");
        }
    };

    const handleDelete = async (id: string) => {
        await deleteExpense(id);
    }

    const formatDateForDisplay = (d: Date) => {
        const langLocale = settings.language === 'ar' ? 'ar-SA' : 'en-CA';
        return new Date(d).toLocaleDateString(langLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            calendar: 'gregory',
            numberingSystem: settings.numberFormat === 'ar' ? 'arab' : 'latn',
        });
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">{t('manageExpenses')}</h1>
                <p className="mt-1 text-text-secondary">{t('overview')}</p>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 text-text-primary">{t('addNewExpense')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">{t('expenseDescription')}</label>
                            <input
                                type="text"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-text-primary mb-1">{t('amount')}</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount === 0 ? '' : amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
                                required
                                min="0.01"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-text-primary mb-1">{t('date')}</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="text-end">
                        <button type="submit" disabled={isUpdating} className="px-6 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 dark:disabled:bg-gray-600">
                            {isUpdating ? 'جاري الإضافة...' : t('addExpense')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8">
                 <h2 className="text-2xl font-bold mb-4 text-text-primary">{t('recentExpenses')}</h2>
                 <div className="space-y-4">
                    {expenses.length > 0 ? (
                        expenses.map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between p-4 bg-card-secondary rounded-lg">
                                <div>
                                    <p className="font-semibold text-text-primary">{expense.description}</p>
                                    {expense.isProductPurchase && typeof expense.quantityPurchased === 'number' && typeof expense.purchasePricePerItem === 'number' ? (
                                        <p className="text-sm text-text-secondary mt-1">
                                            {t('quantity')}: {formatNumber(expense.quantityPurchased)} × {formatCurrency(expense.purchasePricePerItem)}
                                        </p>
                                    ) : null}
                                    <p className="text-sm text-text-secondary mt-1">{formatDateForDisplay(expense.date)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-red-400">{formatCurrency(expense.amount)}</span>
                                    <button onClick={() => handleDelete(expense.id)} disabled={isUpdating} className="text-text-secondary hover:text-red-400 transition-colors p-1 rounded-full disabled:opacity-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-text-secondary py-8">{t('noExpenses')}</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default ExpensesPage;