import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Order, Expense } from '../types';

interface FinancialStats {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
}

const calculateStats = (orders: Order[], expenses: Expense[], startDate: Date, endDate: Date): FinancialStats => {
    const relevantOrders = orders.filter(o => new Date(o.createdAt) >= startDate && new Date(o.createdAt) <= endDate);
    const relevantExpenses = expenses.filter(e => new Date(e.date) >= startDate && new Date(e.date) <= endDate);

    const totalRevenue = relevantOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalExpenses = relevantExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return { totalRevenue, totalExpenses, netProfit };
};

const ReportCard: React.FC<{ title: string, stats: FinancialStats }> = ({ title, stats }) => {
    const { t, formatCurrency } = useAppContext();
    const { totalRevenue, totalExpenses, netProfit } = stats;
    const hasData = totalRevenue > 0 || totalExpenses > 0;
    const netProfitColor = netProfit >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="bg-card rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">{title}</h3>
            {hasData ? (
                 <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-text-secondary">{t('totalRevenue')}</span>
                        <span className="font-semibold text-text-primary">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-text-secondary">{t('totalExpenses')}</span>
                        <span className="font-semibold text-text-primary">{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between pt-3">
                        <span className="text-sm font-bold text-text-primary">{t('netProfit')}</span>
                        <span className={`font-bold text-lg ${netProfitColor}`}>{formatCurrency(netProfit)}</span>
                    </div>
                </div>
            ) : (
                <p className="text-center text-text-secondary py-16">{t('noDataForPeriod')}</p>
            )}
        </div>
    );
};


const ReportsPage: React.FC = () => {
    const { orders, expenses, t, settings, formatNumber } = useAppContext();

    const reports = useMemo(() => {
        const now = new Date(); // The current time, which we won't mutate.
        
        // --- Daily Report ---
        // Create a new Date object representing the start of today.
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

        // --- Weekly Report ---
        // Start from `todayStart` and go back to the beginning of the week (Sunday).
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); 
        
        // --- Monthly Report ---
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // --- Yearly Report ---
        const yearStart = new Date(now.getFullYear(), 0, 1);
        
        return {
            daily: calculateStats(orders, expenses, todayStart, now),
            weekly: calculateStats(orders, expenses, weekStart, now),
            monthly: calculateStats(orders, expenses, monthStart, now),
            yearly: calculateStats(orders, expenses, yearStart, now),
        }
    }, [orders, expenses]);

    const monthlyPoints = useMemo(() => {
        const pointsByMonth: { [key: string]: { totalPoints: number; date: Date } } = {};
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
            if (!pointsByMonth[monthKey]) {
                pointsByMonth[monthKey] = { totalPoints: 0, date: new Date(orderDate.getFullYear(), orderDate.getMonth(), 1) };
            }
            pointsByMonth[monthKey].totalPoints += (order.totalPoints || 0);
        });
        
        return Object.values(pointsByMonth)
          .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by date descending
          .map(data => ({
              month: data.date.toLocaleString(settings.language, { year: 'numeric', month: 'long', calendar: 'gregory' }),
              totalPoints: data.totalPoints
          }));
    }, [orders, settings.language]);


    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">{t('reports')}</h1>
                <p className="mt-1 text-text-secondary">{t('financialSummary')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ReportCard title={t('dailyReport')} stats={reports.daily} />
                <ReportCard title={t('weeklyReport')} stats={reports.weekly} />
                <ReportCard title={t('monthlyReport')} stats={reports.monthly} />
                <ReportCard title={t('yearlyReport')} stats={reports.yearly} />
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('monthlyPointsSummary')}</h2>
                <div className="bg-card rounded-xl shadow-lg p-6">
                {monthlyPoints.length > 0 ? (
                    <ul className="space-y-3">
                        {monthlyPoints.map(({ month, totalPoints }) => (
                            <li key={month} className="flex justify-between items-center py-2 border-b border-border">
                                <span className="font-medium text-text-primary">{month}</span>
                                <span className="font-bold text-accent">{formatNumber(totalPoints)} {t('points')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-text-secondary py-8">{t('noDataForPeriod')}</p>
                )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;