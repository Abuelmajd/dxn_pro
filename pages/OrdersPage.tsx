import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Order } from '../types';
import { Link } from 'react-router-dom';

const OrderDetails: React.FC<{ order: Order }> = ({ order }) => {
    const { t, formatCurrency, formatNumber } = useAppContext();
    return (
    <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-5 gap-4 pb-2 mb-2 border-b border-border text-sm font-medium text-text-secondary">
            <div className="col-span-2">{t('product')}</div>
            <div className="text-center">{t('unitPrice')}</div>
            <div className="text-center">{t('quantity')}</div>
            <div className="text-end">{t('subtotal')}</div>
        </div>

        <ul className="space-y-3">
            {order.items.map(item => (
                <li key={item.productId} className="grid grid-cols-5 gap-4 items-center text-sm">
                    <div className="col-span-2 font-medium text-text-primary">{item.name}</div>
                    <div className="text-center text-text-secondary">{formatCurrency(item.price)}</div>
                    <div className="text-center text-text-secondary">×{formatNumber(item.quantity)}</div>
                    <div className="text-end font-semibold text-text-primary">{formatCurrency(item.price * item.quantity)}</div>
                </li>
            ))}
        </ul>

        <div className="mt-6 pt-4 border-t border-border/80 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                 <div className="flex justify-between font-bold text-lg text-text-primary">
                    <span>{t('grandTotal')}:</span>
                    <span>{formatCurrency(order.totalPrice)}</span>
                </div>
            </div>
        </div>
    </div>
    );
};


const OrdersPage: React.FC = () => {
    const { orders, t, formatCurrency, formatDate } = useAppContext();

    const ordersByCustomer = useMemo(() => {
        return orders.reduce((acc, order) => {
            (acc[order.customerName] = acc[order.customerName] || []).push(order);
            return acc;
        }, {} as Record<string, Order[]>);
    }, [orders]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">{t('invoicesAndSales')}</h1>
                    <p className="mt-1 text-text-secondary">{t('allInvoicesIssued')}</p>
                </div>
                <Link to="/admin/new-order" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  {t('newInvoice')}
                </Link>
            </div>

            {Object.keys(ordersByCustomer).length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-text-primary">{t('noInvoicesYet')}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{t('startByCreatingInvoice')}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* FIX: Replaced Object.entries with Object.keys to ensure type safety for customerOrders. */}
                    {Object.keys(ordersByCustomer).map((customerName) => {
                        const customerOrders = ordersByCustomer[customerName];
                        return (
                        <div key={customerName} className="bg-card rounded-xl shadow-lg overflow-hidden">
                            <div className="p-4 bg-card-secondary border-b border-border">
                                <h2 className="font-bold text-lg text-accent">{customerName}</h2>
                            </div>
                            <div className="divide-y divide-border">
                                {customerOrders.map(order => (
                                    <details key={order.id} className="p-4 group">
                                        <summary className="flex justify-between items-center cursor-pointer list-none">
                                            <div>
                                                <p className="font-semibold text-text-primary">{t('invoiceNo')}: {order.id.slice(-6)}</p>
                                                <p className="text-sm text-text-secondary">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-lg text-text-primary">{formatCurrency(order.totalPrice)}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </summary>
                                        <OrderDetails order={order} />
                                    </details>
                                ))}
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;