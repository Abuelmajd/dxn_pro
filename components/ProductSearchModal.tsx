import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface ProductSearchModalProps {
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductSearchModal: React.FC<ProductSearchModalProps> = ({ onClose, onAddToCart }) => {
  const { t, products, categories, formatCurrency, getCategoryNameById } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
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
  }, [onClose]);

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedProductIds(prev => new Set(prev).add(product.id));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
        const isAvailable = p.isAvailable ?? true;
        const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = !selectedCategoryId || p.categoryId === selectedCategoryId;
        return isAvailable && nameMatch && categoryMatch;
    });
  }, [products, searchTerm, selectedCategoryId]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4"
      aria-labelledby="product-search-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-2xl w-full max-w-2xl transform transition-all flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 id="product-search-modal-title" className="text-lg font-bold text-text-primary">{t('addProduct')}</h2>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-border">
          <input
            type="text"
            placeholder={t('searchForProduct')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-grow p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
            autoFocus
          />
          <select
            value={selectedCategoryId}
            onChange={e => setSelectedCategoryId(e.target.value)}
            className="sm:w-1/3 p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-y-auto p-4">
          {filteredProducts.length > 0 ? (
            <div className="space-y-3">
              {filteredProducts.map(product => {
                const isAdded = addedProductIds.has(product.id);
                const hasDiscount = !!product.discountPercentage && typeof product.originalPrice === 'number';
                return (
                  <div key={product.id} className="flex items-center gap-4 p-2 bg-card-secondary rounded-lg">
                    <img src={product.imageUrl} alt={product.name} className="h-12 w-12 object-contain rounded-md bg-background/50" />
                    <div className="flex-grow">
                      <p className="font-semibold text-text-primary">{product.name}</p>
                      <p className="text-sm text-text-secondary">{getCategoryNameById(product.categoryId)}</p>
                    </div>
                    <div className="text-right">
                        <p className={`font-bold ${hasDiscount ? 'text-accent' : 'text-text-primary'}`}>{formatCurrency(product.price)}</p>
                        {hasDiscount && <p className="text-xs text-text-secondary line-through">{formatCurrency(product.originalPrice!)}</p>}
                    </div>
                    <button 
                        onClick={() => handleAdd(product)}
                        className={`w-24 text-center px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                            isAdded 
                            ? 'bg-green-600 text-white cursor-default' 
                            : 'bg-primary text-white hover:bg-primary-hover'
                        }`}
                    >
                        {isAdded ? t('available') : t('addToCart')}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-text-secondary py-12">{t('noProducts')}</p>
          )}
        </div>
        
        <div className="p-4 border-t border-border text-right">
             <button
                onClick={onClose}
                className="px-6 py-2 rounded-md font-semibold bg-card-secondary text-text-primary hover:bg-border transition-colors"
              >
                {t('close')}
              </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchModal;