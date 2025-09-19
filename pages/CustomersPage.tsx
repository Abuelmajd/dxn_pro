

import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const PhoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const WhatsAppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.586-1.54l-6.235 1.728zM7.494 18.021l.349.206c1.498.887 3.232 1.365 5.016 1.365 5.42 0 9.82-4.4 9.821-9.821s-4.4-9.82-9.82-9.82c-5.42 0-9.82 4.4-9.82 9.82 0 1.83.504 3.579 1.397 5.028l.229.386-1.096 4.004 4.105-1.07z" />
    </svg>
);

const LocationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM12 12a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);

const UserCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const CustomersPage: React.FC = () => {
    const { customers, orders, t, formatCurrency, formatNumber } = useAppContext();

    const customerStats = useMemo(() => {
        const stats = new Map<string, { totalSpent: number; invoiceCount: number }>();
        orders.forEach(order => {
            const currentStat = stats.get(order.customerId) || { totalSpent: 0, invoiceCount: 0 };
            currentStat.totalSpent += order.totalPrice;
            currentStat.invoiceCount += 1;
            stats.set(order.customerId, currentStat);
        });
        return stats;
    }, [orders]);


    const formatWhatsAppLink = (number: string) => {
        const cleaned = String(number).replace(/\D/g, '');
        return `https://wa.me/${cleaned}`;
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('customerList')}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{t('allCustomers')}</p>
            </div>

            {customers.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3M15 21a2 2 0 002-2v-1a2 2 0 00-2-2h-3a2 2 0 00-2 2v1a2 2 0 002 2h3zm-3-9a3 3 0 00-3-3H6a3 3 0 00-3 3v6a3 3 0 003 3h6a3 3 0 003-3V9a3 3 0 00-3-3h-3z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-white">{t('noCustomersYet')}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('customersAppearHere')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.map(customer => {
                        const stats = customerStats.get(customer.id) || { totalSpent: 0, invoiceCount: 0 };
                        return (
                            <Link 
                                to={`/admin/customers/${customer.id}`} 
                                key={customer.id} 
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col space-y-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 dark:bg-slate-700 p-2 rounded-full">
                                        <UserCircleIcon />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{customer.name}</h2>
                                </div>
                                
                                <div className="space-y-3 text-sm flex-grow">
                                     <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-slate-500 dark:text-slate-400">{t('totalInvoices')}</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{formatNumber(stats.invoiceCount)}</span>
                                     </div>
                                      <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-slate-500 dark:text-slate-400">{t('totalSpent')}</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalSpent)}</span>
                                     </div>
                                </div>

                                <div className="flex flex-col space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
                                    {customer.address && (
                                        <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                                            <LocationIcon />
                                            <span>{customer.address}</span>
                                        </div>
                                    )}
                                    {customer.phone && (
                                        <a href={`tel:${customer.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
                                            <PhoneIcon />
                                            <span>{customer.phone}</span>
                                        </a>
                                    )}
                                    {customer.whatsapp && (
                                        <a href={formatWhatsAppLink(customer.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-3 text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition-colors font-medium">
                                            <WhatsAppIcon />
                                            <span>{t('contactViaWhatsapp')}</span>
                                        </a>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomersPage;