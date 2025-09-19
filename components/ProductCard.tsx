import React from 'react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t, formatCurrency, getCategoryNameById } = useAppContext();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-40 bg-slate-100 dark:bg-slate-700">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {product.categoryId && <p className="text-sm text-slate-500 dark:text-slate-400 text-right">{getCategoryNameById(product.categoryId)}</p>}
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1 text-right">{product.name}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex-grow text-right line-clamp-2">{product.description || t('noDescriptionAvailable')}</p>
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">{t('normalPrice')}</span>
            <span className="text-sm text-slate-600 dark:text-slate-300">{formatCurrency(product.price)}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-md font-bold text-amber-500 dark:text-amber-400">{t('memberPrice')}</span>
            <span className="text-xl font-bold text-amber-500 dark:text-amber-400">{formatCurrency(product.memberPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;