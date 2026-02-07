import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-card rounded-xl shadow-lg p-6 flex items-center gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className={`rounded-full p-4 shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-3xl font-bold text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;