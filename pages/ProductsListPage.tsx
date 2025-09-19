

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

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


const ProductsListPage: React.FC = () => {
    const { products, t, formatCurrency, formatNumber, getCategoryNameById, deleteProduct, toggleProductAvailability, isUpdating } = useAppContext();

    const handleDelete = async (productId: string) => {
        if (window.confirm(t('confirmDeleteProduct'))) {
            await deleteProduct(productId);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('productList')}</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{t('productListDescription')}</p>
                </div>
                 <Link to="/admin/add-product" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    {t('addNewProduct')}
                  </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3 min-w-[80px]">{t('image')}</th>
                                <th scope="col" className="px-6 py-3 min-w-[200px] text-right">{t('productName')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('normalPrice')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('memberPrice')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('points')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map(product => {
                                    const isAvailable = product.isAvailable ?? true;
                                    return (
                                        <tr 
                                            key={product.id} 
                                            className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/30 transition-opacity ${!isAvailable ? 'opacity-50' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-md object-contain bg-slate-100 dark:bg-slate-700"/>
                                            </td>
                                            <th scope="row" className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap text-right">
                                                {product.name}
                                                {!isAvailable && <span className="ms-2 text-xs font-semibold text-red-500 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-full">{t('unavailable')}</span>}
                                                <p className="font-normal text-slate-500 dark:text-slate-400">{getCategoryNameById(product.categoryId)}</p>
                                            </th>
                                            <td className="px-6 py-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-amber-500 dark:text-amber-400">
                                                {formatCurrency(product.memberPrice)}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-blue-600 dark:text-blue-400">
                                                {formatNumber(product.points)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button 
                                                        onClick={() => toggleProductAvailability(product.id)}
                                                        disabled={isUpdating}
                                                        title={isAvailable ? t('markUnavailable') : t('markAvailable')}
                                                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                                                    >
                                                        {isAvailable ? <EyeIcon /> : <EyeOffIcon />}
                                                    </button>
                                                    <Link
                                                        to={`/admin/products/${product.id}/edit`}
                                                        title={t('edit')}
                                                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                    >
                                                        <PencilIcon />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)} 
                                                        disabled={isUpdating}
                                                        title={t('delete')}
                                                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
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
                                        <p className="text-slate-500 dark:text-slate-400">{t('noProducts')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductsListPage;