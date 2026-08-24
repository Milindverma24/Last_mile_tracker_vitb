import React from 'react';
import { Card } from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'bg-brand-50 text-brand-600 border-brand-100',
  className = '',
}) => {
  return (
    <Card hover className={`p-5 relative overflow-hidden group ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}
              </span>
              <span className="text-xs text-slate-400">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl border ${accentColor} transition-transform group-hover:scale-110 duration-200`}>
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
};
