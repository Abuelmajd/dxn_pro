import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Product } from '../types';

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .527-1.666 1.32-3.206 2.274-4.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-18-18M9.536 4.904A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-2.036 3.874" />
    </svg>
);

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  errorMessage?: string;
  warningMessage?: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText, errorMessage, warningMessage }) => {
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
        
        {warningMessage && (
          <div className="mt-4 p-3 bg-yellow-900/30 text-yellow-300 rounded-md text-sm border border-yellow-500/30">
            {warningMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-900/30 text-red-400 rounded-md text-sm border border-red-500/30">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-semibold bg-card-secondary text-text-primary hover:bg-border transition-colors"
          >
            {confirmText === 'Delete' ? 'Cancel' : 'إلغاء'}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};


const ProductsListPage: React.FC = () => {
    const { products, categories, orders, t, formatCurrency, formatInteger, getCategoryNameById, deleteProduct, toggleProductAvailability, isUpdating, removeDiscount, settings } = useAppContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(''); // '', 'available', 'unavailable'
    
    const [modalState, setModalState] = useState<{ type: 'deleteProduct' | 'removeDiscount' | null, product: Product | null }>({ type: null, product: null });
    const [deleteError, setDeleteError] = useState<string | undefined>(undefined);
    const [deleteWarning, setDeleteWarning] = useState<string | undefined>(undefined);

    const openModal = (type: 'deleteProduct' | 'removeDiscount', product: Product) => {
        setDeleteError(undefined);
        setDeleteWarning(undefined);

        if (type === 'deleteProduct') {
            const isInOrder = orders.some(order => order.items.some(item => item.productId === product.id));
            if (isInOrder) {
                setDeleteWarning(t('confirmDeleteProductWarning'));
            }
        }
        setModalState({ type, product });
    };

    const closeModal = () => {
        setModalState({ type: null, product: null });
    };

    const handleConfirm = async () => {
        if (!modalState.product || !modalState.type) return;

        if (modalState.type === 'deleteProduct') {
            const result = await deleteProduct(modalState.product.id);
            if (!result.success) {
                setDeleteError(result.error || "An unknown error occurred.");
                setDeleteWarning(undefined);
            } else {
                closeModal();
            }
        } else if (modalState.type === 'removeDiscount') {
            const discount = settings.discounts.find(d => d.productId === modalState.product!.id || d.productId === 'ALL');
            if (discount) {
                removeDiscount(discount.productId);
            }
            closeModal();
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const nameMatch = String(product.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = !selectedCategoryId || product.categoryId === selectedCategoryId;
            const statusMatch = selectedStatus === '' ||
                                (selectedStatus === 'available' && (product.isAvailable ?? true)) ||
                                (selectedStatus === 'unavailable' && !(product.isAvailable ?? true)) ||
                                (selectedStatus === 'on_sale' && (product.discountPercentage && product.discountPercentage > 0));
            return nameMatch && categoryMatch && statusMatch;
        });
    }, [products, searchTerm, selectedCategoryId, selectedStatus]);


    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">{t('productList')}</h1>
                    <p className="mt-1 text-text-secondary">{t('productListDescription')}</p>
                </div>
                 <Link to="/admin/add-product" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    {t('addNewProduct')}
                  </Link>
            </div>
            
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder={t('searchForProduct')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="p-3 bg-card rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                />
                <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="p-3 bg-card rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                >
                    <option value="">{t('allCategories')}</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="p-3 bg-card rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                >
                    <option value="">{t('allStatuses')}</option>
                    <option value="available">{t('available')}</option>
                    <option value="unavailable">{t('unavailable')}</option>
                    <option value="on_sale">{t('onSaleFilter')}</option>
                </select>
            </div>

            <div className="bg-card rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-text-secondary">
                        <thead className="text-xs text-text-primary uppercase bg-card-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3 min-w-[80px]"></th>
                                <th scope="col" className="px-6 py-3 min-w-[200px] text-right">{t('productName')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('sellingPrice')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('points')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => {
                                    const isAvailable = product.isAvailable ?? true;
                                    const hasDiscount = !!product.discountPercentage;
                                    return (
                                        <tr 
                                            key={product.id} 
                                            className={`border-b border-border hover:bg-card-secondary transition-opacity ${!isAvailable ? 'opacity-50' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-md object-contain bg-background/50"/>
                                            </td>
                                            <th scope="row" className="px-6 py-4 font-bold text-text-primary whitespace-nowrap text-right">
                                                {product.name}
                                                <div>
                                                    {!isAvailable && <span className="me-2 text-xs font-semibold text-red-500 bg-red-900/50 px-2 py-0.5 rounded-full">{t('unavailable')}</span>}
                                                    {hasDiscount && 
                                                        <span className="text-xs font-semibold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">
                                                          -{formatInteger(product.discountPercentage!)}%
                                                        </span>
                                                    }
                                                </div>
                                                <p className="font-normal text-text-secondary">{getCategoryNameById(product.categoryId)}</p>
                                            </th>
                                            <td className="px-6 py-4 text-center font-semibold">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-lg text-accent">{formatCurrency(product.price)}</span>
                                                    {hasDiscount && <span className="text-xs text-text-secondary line-through">{formatCurrency(product.originalPrice!)}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-accent">
                                                {formatInteger(product.points)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    {hasDiscount && (
                                                        <button 
                                                            onClick={() => openModal('removeDiscount', product)}
                                                            disabled={isUpdating}
                                                            title={t('removeDiscount')}
                                                            className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-red-400 transition-colors disabled:opacity-50"
                                                        >
                                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => toggleProductAvailability(product.id)}
                                                        disabled={isUpdating}
                                                        title={isAvailable ? t('markUnavailable') : t('markAvailable')}
                                                        className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                                                    >
                                                        {isAvailable ? <EyeIcon /> : <EyeOffIcon />}
                                                    </button>
                                                    <Link
                                                        to={`/admin/products/${product.id}/edit`}
                                                        title={t('edit')}
                                                        className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-accent transition-colors"
                                                    >
                                                        <PencilIcon />
                                                    </Link>
                                                    <button 
                                                        onClick={() => openModal('deleteProduct', product)} 
                                                        disabled={isUpdating}
                                                        title={t('delete')}
                                                        className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-red-400 transition-colors disabled:opacity-50"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <p className="text-text-secondary">{t('noProducts')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {modalState.type && modalState.product && (
              <ConfirmationModal 
                  isOpen={!!modalState.type}
                  onClose={closeModal}
                  onConfirm={handleConfirm}
                  title={modalState.type === 'deleteProduct' ? t('confirmDeletionTitle') : t('removeDiscount')}
                  message={modalState.type === 'deleteProduct' ? t('confirmDeleteProduct') : t('confirmRemoveDiscount')}
                  confirmText={modalState.type === 'deleteProduct' ? t('delete') : t('removeDiscount')}
                  errorMessage={deleteError}
                  warningMessage={deleteWarning}
              />
            )}
        </div>
    );
};

export default ProductsListPage;