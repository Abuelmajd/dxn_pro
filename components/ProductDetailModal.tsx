import React from 'react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const { t, formatCurrency, getCategoryNameById, formatInteger } = useAppContext();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const hasDiscount = !!product.discountPercentage && typeof product.originalPrice === 'number';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-2xl w-full max-w-4xl m-4 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animationFillMode: 'forwards' }}
      >
        <div className="grid md:grid-cols-2">
          <div className="relative h-64 md:h-full bg-background/50">
            {hasDiscount && (
                <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-red-600 text-white text-base font-bold px-4 py-2 rounded-lg z-10 shadow-lg animate-pulse">
                    -{formatInteger(product.discountPercentage!)}%
                </div>
            )}
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
          </div>
          <div className="p-6 flex flex-col">
            <div>
              <h2 id="modal-title" className="text-3xl font-bold text-text-primary mt-1 rtl:text-right">{product.name}</h2>
              <p className="text-sm text-accent font-semibold mt-2">{getCategoryNameById(product.categoryId)}</p>
              <p className="text-text-secondary mt-4 text-base leading-relaxed h-56 overflow-y-auto">
                {product.description || t('noDescriptionAvailable')}
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-border flex-grow flex flex-col justify-end">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-text-primary">{t('sellingPrice')}</span>
                     <div className="flex items-baseline gap-3 rtl:flex-row-reverse">
                        <span className="text-2xl font-bold text-accent">{formatCurrency(product.price)}</span>
                        {hasDiscount && (
                            <span className="text-xl text-text-secondary line-through">{formatCurrency(product.originalPrice!)}</span>
                        )}
                    </div>
                </div>
            </div>
             <div className="mt-8 flex gap-4">
                 <button
                    onClick={onClose}
                    type="button"
                    className="flex-1 px-6 py-3 rounded-lg text-sm font-bold bg-card-secondary text-text-primary hover:bg-border transition-colors"
                  >
                    {t('close')}
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    type="button"
                    className="flex-1 px-6 py-3 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    {t('addToCart')}
                  </button>
             </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailModal;
