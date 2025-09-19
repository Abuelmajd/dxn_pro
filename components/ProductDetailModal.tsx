import React from 'react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const { t, formatCurrency, getCategoryNameById } = useAppContext();

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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl m-4 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animationFillMode: 'forwards' }}
      >
        <div className="grid md:grid-cols-2">
          <div className="h-64 md:h-full bg-slate-700">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
          </div>
          <div className="p-6 flex flex-col">
            <div>
              <h2 id="modal-title" className="text-3xl font-bold text-white mt-1 rtl:text-right">{product.name}</h2>
              <p className="text-sm text-green-400 font-semibold mt-2">{getCategoryNameById(product.categoryId)}</p>
              <p className="text-slate-300 mt-4 text-base leading-relaxed h-56 overflow-y-auto">
                {product.description || t('noDescriptionAvailable')}
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700 flex-grow flex flex-col justify-end">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-slate-300">{t('sellingPrice')}</span>
                    <span className="text-2xl font-bold text-green-400">{formatCurrency(product.price)}</span>
                </div>
            </div>
             <div className="mt-8 flex gap-4">
                 <button
                    onClick={onClose}
                    type="button"
                    className="flex-1 px-6 py-3 rounded-lg text-sm font-bold bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
                  >
                    {t('close')}
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    type="button"
                    className="flex-1 px-6 py-3 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
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