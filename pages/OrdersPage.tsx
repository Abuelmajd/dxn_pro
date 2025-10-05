import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Order } from '../types';
import { Link } from 'react-router-dom';

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    const { orders, t, formatCurrency, formatDate, deleteOrder, isUpdating } = useAppContext();
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

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