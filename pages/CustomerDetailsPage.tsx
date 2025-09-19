

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Order, Customer } from '../types';

const OrderDetails: React.FC<{ order: Order }> = ({ order }) => {
    const { t, formatCurrency, formatNumber } = useAppContext();
    return (
    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-5 gap-4 pb-2 mb-2 border-b border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="col-span-2">{t('product')}</div>
            <div className="text-center">{t('unitPrice')}</div>
            <div className="text-center">{t('quantity')}</div>
            <div className="text-end">{t('subtotal')}</div>
        </div>

        <ul className="space-y-3">
            {order.items.map(item => (
                <li key={item.productId} className="grid grid-cols-5 gap-4 items-center text-sm">
                    <div className="col-span-2 font-medium text-slate-800 dark:text-slate-200">{item.name}</div>
                    <div className="text-center text-slate-600 dark:text-slate-400">{formatCurrency(item.price)}</div>
                    <div className="text-center text-slate-600 dark:text-slate-400">×{formatNumber(item.quantity)}</div>
                    <div className="text-end font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(item.price * item.quantity)}</div>
                </li>
            ))}
        </ul>

        <div className="mt-6 pt-4 border-t border-slate-300 dark:border-slate-600 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                 <div className="flex justify-between font-bold text-lg text-slate-800 dark:text-white">
                    <span>{t('grandTotal')}:</span>
                    <span>{formatCurrency(order.totalPrice)}</span>
                </div>
            </div>
        </div>
    </div>
    );
};

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

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);


const CustomerDetailsPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { getCustomerById, orders, t, formatDate, formatCurrency, formatNumber } = useAppContext();
    const [activeShareMenu, setActiveShareMenu] = useState<string | null>(null);

    const customer = useMemo(() => customerId ? getCustomerById(customerId) : undefined, [customerId, getCustomerById]);
    
    const customerOrders = useMemo(() => {
        if (!customerId) return [];
        return orders
            .filter(order => order.customerId === customerId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [orders, customerId]);

    useEffect(() => {
        if (!activeShareMenu) return;

        const closeMenu = () => {
            setActiveShareMenu(null);
        };
        
        // Use timeout to avoid the event that opened the menu from closing it.
        setTimeout(() => {
            window.addEventListener('click', closeMenu);
        }, 0);

        return () => {
            window.removeEventListener('click', closeMenu);
        };
    }, [activeShareMenu]);
    
    const formatWhatsAppLink = (number: string) => {
        const cleaned = String(number).replace(/\D/g, '');
        return `https://wa.me/${cleaned}`;
    };

    const generateInvoiceText = (order: Order, customer: Customer) => {
        const header = `${t('invoiceNo')}: ${order.id.slice(-6)}\n` +
                     `${t('customerName')}: ${customer.name}\n` +
                     `${t('date')}: ${formatDate(order.createdAt)}\n\n` +
                     `------------------------------------\n`;

        const itemsText = order.items.map(item => 
            `${item.name}\n` +
            `  ${formatNumber(item.quantity)} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`
        ).join('\n\n');

        const footer = `\n------------------------------------\n` +
                       `${t('grandTotal')}: ${formatCurrency(order.totalPrice)}`;

        return header + itemsText + footer;
    };

    const handleShare = (type: 'whatsapp' | 'email', order: Order, customer: Customer) => {
        const invoiceText = generateInvoiceText(order, customer);
        const encodedText = encodeURIComponent(invoiceText);

        if (type === 'whatsapp') {
            const whatsappNumber = customer.whatsapp || customer.phone;
            if (whatsappNumber) {
                const cleanedNumber = String(whatsappNumber).replace(/\D/g, '');
                window.open(`https://wa.me/${cleanedNumber}?text=${encodedText}`, '_blank');
            }
        } else if (type === 'email') {
            const subject = encodeURIComponent(`${t('invoiceNo')}: ${order.id.slice(-6)} - ${customer.name}`);
            const recipientEmail = customer.email || '';
            window.open(`mailto:${recipientEmail}?subject=${subject}&body=${encodedText}`, '_blank');
        }
        setActiveShareMenu(null);
    };


    if (!customer) {
        return (
             <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('customerNotFound')}</h2>
                <Link to="/admin/customers" className="mt-4 inline-block text-green-600 dark:text-green-400 hover:underline">
                    {t('backToCustomers')}
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
             <div className="mb-6">
                <Link to="/admin/customers" className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    {t('backToCustomers')}
                </Link>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{customer.name}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{t('customerDetails')}</p>
             </div>

             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 space-y-3">
                {customer.phone && (
                    <a href={`tel:${customer.phone}`} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
                        <PhoneIcon />
                        <span>{customer.phone}</span>
                    </a>
                )}
                {customer.whatsapp && (
                    <a href={formatWhatsAppLink(customer.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition-colors font-medium">
                        <WhatsAppIcon />
                        <span>{t('contactViaWhatsapp')}</span>
                    </a>
                )}
                 {customer.email && (
                    <a href={`mailto:${customer.email}`} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
                        <EmailIcon />
                        <span>{customer.email}</span>
                    </a>
                 )}
                 {customer.address && (
                    <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                        <LocationIcon />
                        <span>{customer.address}</span>
                    </div>
                )}
             </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('invoicesFor')} {customer.name}</h2>
            </div>

            {customerOrders.length === 0 ? (
                 <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-white">{t('noInvoicesForCustomer')}</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {customerOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                            <details className="p-4 group" open={customerOrders.length === 1}>
                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                    <div>
                                        <p className="font-semibold">{t('invoiceNo')}: {order.id.slice(-6)}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault(); 
                                                    e.stopPropagation(); 
                                                    setActiveShareMenu(activeShareMenu === order.id ? null : order.id);
                                                }} 
                                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                                                title={t('shareInvoice')}
                                            >
                                                <ShareIcon />
                                            </button>
                                            {activeShareMenu === order.id && (
                                                <div 
                                                    className="absolute end-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-md shadow-lg z-20 border border-slate-200 dark:border-slate-700"
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                >
                                                    <ul className="py-1">
                                                        <li>
                                                            <button 
                                                                onClick={() => handleShare('whatsapp', order, customer)}
                                                                className="w-full text-start px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                                                            >
                                                                <WhatsAppIcon /> {t('shareViaWhatsapp')}
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button 
                                                                onClick={() => handleShare('email', order, customer)}
                                                                className="w-full text-start px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                                                            >
                                                                <EmailIcon /> {t('shareViaEmail')}
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-bold text-lg text-slate-700 dark:text-slate-300">{formatCurrency(order.totalPrice)}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </summary>
                                <OrderDetails order={order} />
                            </details>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerDetailsPage;