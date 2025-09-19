
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex items-center gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className={`rounded-full p-4 shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 truncate">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;