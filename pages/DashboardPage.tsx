

import React from 'react';
import { useAppContext } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const DollarSignIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 6v1m0-10a9 9 0 110 18 9 9 0 010-18z" />
    </svg>
);

const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const TrendingDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);


const DashboardPage: React.FC = () => {
  const { products, orders, expenses, t, formatCurrency, formatNumber } = useAppContext();

  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalPointsThisMonth = orders
      .filter(order => new Date(order.createdAt) >= startOfMonth)
      .reduce((sum, order) => sum + (order.totalPoints || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('welcomeBack')}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{t('overview')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('totalSales')} value={formatCurrency(totalSales)} icon={<DollarSignIcon />} color="bg-gradient-to-br from-green-500 to-green-600" />
        <StatCard title={t('totalExpenses')} value={formatCurrency(totalExpenses)} icon={<TrendingDownIcon />} color="bg-gradient-to-br from-red-500 to-red-600" />
        <StatCard title={t('ordersCount')} value={formatNumber(orders.length)} icon={<ClipboardListIcon />} color="bg-gradient-to-br from-amber-500 to-amber-600" />
        <StatCard title={t('totalPointsThisMonth')} value={formatNumber(totalPointsThisMonth)} icon={<StarIcon />} color="bg-gradient-to-br from-blue-500 to-blue-600" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('availableProducts')}</h2>
          <div className="flex items-center gap-4">
             <Link to="/admin/add-product" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                {t('addNewProduct')}
              </Link>
             <Link to="/admin/new-order" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                {t('newInvoice')}
              </Link>
          </div>
        </div>
        
        {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-16 text-center">
                <p className="text-slate-500 dark:text-slate-400">{t('noProducts')}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;