import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import StatCard from '../components/StatCard';

// Icons
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

// Chart Components
const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-card rounded-xl shadow-lg p-6 h-full flex flex-col">
        <h3 className="text-lg font-bold text-accent mb-4">{title}</h3>
        <div className="flex-grow">{children}</div>
    </div>
);

interface VerticalBarChartProps {
    data: { label: string; value: number }[];
    valueFormatter: (value: number) => string;
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({ data, valueFormatter }) => {
    const { t, formatInteger } = useAppContext();
     if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">{t('noDataForPeriod')}</div>;
    }
    
    // Calculate Y-axis ticks
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const numTicks = 5;
    let effectiveMaxValue = 10;
    let tickIncrement = 2;

    if (maxValue > 0) {
        const roughTick = maxValue / numTicks;
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughTick)));
        const niceFractions = [magnitude, magnitude * 2, magnitude * 5, magnitude * 10];
        tickIncrement = niceFractions.find(fraction => fraction >= roughTick) || magnitude * 10;
        effectiveMaxValue = tickIncrement * numTicks;
    }

    const yAxisLabels = Array.from({ length: numTicks + 1 }, (_, i) => {
        return (numTicks - i) * tickIncrement;
    });
    
    return (
        <div className="flex h-72">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between text-xs text-text-secondary pr-4 text-right py-[10px] h-full box-border">
                {yAxisLabels.map(label => (
                    <span key={label}>{formatInteger(label)}</span>
                ))}
            </div>

            {/* Chart Area */}
            <div className="flex-grow flex justify-around items-end gap-2 border-l border-b border-border pl-4 relative">
                {/* Grid lines */}
                {yAxisLabels.slice(1).map(label => (
                    <div key={`grid-${label}`} className="absolute left-0 w-full border-t border-border/50" style={{ bottom: `${(label / effectiveMaxValue) * 100}%` }}></div>
                ))}
                
                {/* Bars */}
                {data.map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center w-full h-full justify-end group relative text-center">
                        <div className="absolute -top-7 mb-1 w-max px-2 py-1 bg-card text-text-primary text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {valueFormatter(value)}
                        </div>
                        <div
                            className="w-3/4 max-w-[40px] bg-primary rounded-t-md transition-all duration-300 hover:bg-primary-hover"
                            style={{ height: value > 0 ? `${(value / effectiveMaxValue) * 100}%` : '0%' }}
                        ></div>
                        <span className="text-xs text-text-secondary mt-2 px-1 break-words w-full h-8 flex items-start justify-center">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Dashboard Page Component
const DashboardPage: React.FC = () => {
  const { orders, expenses, t, formatCurrency, formatNumber, settings, getCustomerById, formatInteger } = useAppContext();
  
  // --- Data Aggregation ---
  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalPointsThisMonth = orders
      .filter(order => new Date(order.createdAt) >= startOfMonth)
      .reduce((sum, order) => sum + (order.totalPoints || 0), 0);
  
  const bestSellingProducts = useMemo(() => {
    const productSales: { [key: string]: { name: string; quantity: number } } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, quantity: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(p => ({ label: p.name, value: p.quantity }));
  }, [orders]);

  const topCustomers = useMemo(() => {
    const customerSpending: { [key: string]: { name: string; total: number } } = {};
    orders.forEach(order => {
      if (!customerSpending[order.customerId]) {
        const customer = getCustomerById(order.customerId);
        customerSpending[order.customerId] = { name: customer ? customer.name : t('customerNotFound'), total: 0 };
      }
      customerSpending[order.customerId].total += order.totalPrice;
    });
    return Object.values(customerSpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(c => ({ label: c.name, value: c.total }));
  }, [orders, getCustomerById, t]);
  
  const salesLast7Days = useMemo(() => {
    const lang = settings.language === 'ar' ? 'ar-SA' : 'en-US';
    const salesByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
            label: date.toLocaleDateString(lang, { weekday: 'short' }),
            sales: 0,
            date: date.setHours(0,0,0,0)
        };
    });

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt).setHours(0,0,0,0);
        const dayData = salesByDay.find(d => d.date === orderDate);
        if (dayData) {
            dayData.sales += order.totalPrice;
        }
    });
    
    return salesByDay.map(d => ({ label: d.label, value: d.sales }));
  }, [orders, settings.language]);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{t('welcomeBack')}</h1>
        <p className="mt-1 text-text-secondary">{t('overview')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('totalSales')} value={formatCurrency(totalSales)} icon={<DollarSignIcon />} color="bg-gradient-to-br from-accent to-yellow-600" />
        <StatCard title={t('totalExpenses')} value={formatCurrency(totalExpenses)} icon={<TrendingDownIcon />} color="bg-gradient-to-br from-red-500 to-red-600" />
        <StatCard title={t('ordersCount')} value={formatInteger(orders.length)} icon={<ClipboardListIcon />} color="bg-gradient-to-br from-primary to-primary-hover" />
        <StatCard title={t('totalPointsThisMonth')} value={formatNumber(totalPointsThisMonth)} icon={<StarIcon />} color="bg-gradient-to-br from-teal-500 to-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ChartContainer title={t('bestSellingProducts')}>
            <VerticalBarChart
                data={bestSellingProducts}
                valueFormatter={(value) => `${formatInteger(value)} ${t('quantitySold')}`}
            />
        </ChartContainer>
        <ChartContainer title={t('topCustomers')}>
            <VerticalBarChart
                data={topCustomers}
                valueFormatter={(value) => formatCurrency(value)}
            />
        </ChartContainer>
      </div>
      
      <div>
        <ChartContainer title={t('salesLast7Days')}>
            <VerticalBarChart
                data={salesLast7Days}
                valueFormatter={(value) => formatCurrency(value)}
            />
        </ChartContainer>
      </div>
    </div>
  );
};

export default DashboardPage;