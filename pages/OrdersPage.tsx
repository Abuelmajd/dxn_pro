import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Order, Customer } from '../types';
import { Link } from 'react-router-dom';

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

const WhatsAppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.586-1.54l-6.235 1.728zM7.494 18.021l.349.206c1.498.887 3.232 1.365 5.016 1.365 5.42 0 9.82-4.4 9.821-9.821s-4.4-9.82-9.82-9.82c-5.42 0-9.82 4.4-9.82 9.82 0 1.83.504 3.579 1.397 5.028l.229.386-1.096 4.004 4.105-1.07z" />
    </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
  
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useAppContext();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4"
      aria-labelledby="confirmation-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="confirmation-modal-title" className="text-xl font-bold text-text-primary">{title}</h3>
        <p className="text-text-secondary mt-4 whitespace-pre-wrap">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-semibold bg-card-secondary text-text-primary hover:bg-border transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetails: React.FC<{ order: Order }> = ({ order }) => {
    const { t, formatCurrency, formatInteger } = useAppContext();
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
                    <div className="text-center text-text-secondary">×{formatInteger(item.quantity)}</div>
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
    const { orders, t, formatCurrency, formatDate, deleteOrder, isUpdating, getCustomerById, formatInteger } = useAppContext();
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [activeShareMenu, setActiveShareMenu] = useState<string | null>(null);

    useEffect(() => {
        if (!activeShareMenu) return;

        const closeMenu = () => setActiveShareMenu(null);
        
        setTimeout(() => window.addEventListener('click', closeMenu), 0);
        return () => window.removeEventListener('click', closeMenu);
    }, [activeShareMenu]);

    const ordersByCustomer = useMemo(() => {
        return orders.reduce((acc, order) => {
            (acc[order.customerName] = acc[order.customerName] || []).push(order);
            return acc;
        }, {} as Record<string, Order[]>);
    }, [orders]);

    const handleDeleteRequest = (order: Order, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setOrderToDelete(order);
    };

    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;
        await deleteOrder(orderToDelete.id);
        setOrderToDelete(null);
    };

    const handleCancelDelete = () => {
        setOrderToDelete(null);
    };

    const generateInvoiceText = (order: Order, customer: Customer) => {
        const header = `${t('invoiceNo')}: ${order.id.slice(-6)}\n` +
                     `${t('customerName')}: ${customer.name}\n` +
                     `${t('date')}: ${formatDate(order.createdAt)}\n\n` +
                     `------------------------------------\n`;

        const itemsText = order.items.map(item => 
            `${item.name}\n` +
            `  ${formatInteger(item.quantity)} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`
        ).join('\n\n');

        const footer = `\n------------------------------------\n` +
                       `${t('grandTotal')}: ${formatCurrency(order.totalPrice)}`;

        return header + itemsText + footer;
    };

    const handleShare = (type: 'whatsapp' | 'email', order: Order) => {
        const customer = getCustomerById(order.customerId);
        if (!customer) return;

        const invoiceText = generateInvoiceText(order, customer);
        const encodedText = encodeURIComponent(invoiceText);

        if (type === 'whatsapp') {
            const whatsappNumber = customer.whatsapp || customer.phone;
            if (whatsappNumber) {
                let cleanedNumber = String(whatsappNumber).replace(/\D/g, '');
                // Prepend international prefix to the full number, including the leading zero as requested.
                window.open(`https://wa.me/972${cleanedNumber}?text=${encodedText}`, '_blank');
            }
        } else if (type === 'email') {
            const subject = encodeURIComponent(`${t('invoiceNo')}: ${order.id.slice(-6)} - ${customer.name}`);
            const recipientEmail = customer.email || '';
            window.open(`mailto:${recipientEmail}?subject=${subject}&body=${encodedText}`, '_blank');
        }
        setActiveShareMenu(null);
    };

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
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg text-text-primary">{formatCurrency(order.totalPrice)}</span>
                                                <div className="relative">
                                                    <button 
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveShareMenu(activeShareMenu === order.id ? null : order.id); }} 
                                                        className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-accent transition-colors"
                                                        title={t('shareInvoice')}
                                                    >
                                                        <ShareIcon />
                                                    </button>
                                                    {activeShareMenu === order.id && (
                                                        <div 
                                                            className="absolute end-0 mt-2 w-56 bg-background rounded-md shadow-lg z-20 border border-card"
                                                            onClick={(e) => { e.stopPropagation(); }}
                                                        >
                                                            <ul className="py-1">
                                                                <li>
                                                                    <button 
                                                                        onClick={() => handleShare('whatsapp', order)}
                                                                        className="w-full text-start px-4 py-2 text-sm text-text-primary hover:bg-card-secondary flex items-center gap-3"
                                                                    >
                                                                        <WhatsAppIcon /> {t('shareViaWhatsapp')}
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button 
                                                                        onClick={() => handleShare('email', order)}
                                                                        className="w-full text-start px-4 py-2 text-sm text-text-primary hover:bg-card-secondary flex items-center gap-3"
                                                                    >
                                                                        <EmailIcon /> {t('shareViaEmail')}
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={(e) => handleDeleteRequest(order, e)}
                                                    disabled={isUpdating}
                                                    title={t('deleteInvoice')}
                                                    className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-red-400 transition-colors disabled:opacity-50"
                                                >
                                                    <TrashIcon />
                                                </button>
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
            <ConfirmationModal 
                isOpen={!!orderToDelete}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t('confirmDeletionTitle')}
                message={t('confirmDeleteOrder')}
            />
        </div>
    );
};

export default OrdersPage;