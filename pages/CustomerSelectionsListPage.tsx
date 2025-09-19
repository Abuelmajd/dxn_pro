

import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { CustomerSelection } from '../types';
import { useNavigate } from 'react-router-dom';

const CustomerSelectionsListPage: React.FC = () => {
    const { customerSelections, processSelection, t, formatCurrency, formatDate, formatNumber, isUpdating } = useAppContext();
    const navigate = useNavigate();

    const pendingSelections = useMemo(() => {
        return customerSelections
            .filter(s => s.status === 'pending')
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [customerSelections]);

    const handleConvertToInvoice = async (selection: CustomerSelection) => {
        const success = await processSelection(selection.id);
        if (success) {
          navigate('/admin/new-order', { state: { selection } });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('customerSelections')}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{t('customerSelectionsDescription')}</p>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{t('pendingSelections')}</h2>
                {pendingSelections.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-white">{t('noPendingSelections')}</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingSelections.map(selection => (
                            <div key={selection.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
                                <div className="flex justify-between items-start flex-wrap gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-green-700 dark:text-green-400">{t('selectionFrom')} {selection.customerName}</h3>
                                        {selection.customerPhone && <p className="text-sm text-slate-500">{selection.customerPhone}</p>}
                                        <p className="text-xs text-slate-400 mt-1">{formatDate(selection.createdAt)}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleConvertToInvoice(selection)}
                                        disabled={isUpdating}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400"
                                    >
                                        {t('convertToInvoice')}
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <ul className="space-y-2">
                                        {selection.items.map(item => (
                                            <li key={item.productId} className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-slate-500 dark:text-slate-400">
                                                        {formatNumber(item.quantity)} x {formatCurrency(item.price)}
                                                    </span>
                                                    <span className="font-semibold w-24 text-end">{formatCurrency(item.quantity * item.price)}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerSelectionsListPage;
