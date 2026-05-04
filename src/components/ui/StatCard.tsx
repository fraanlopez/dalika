import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const colorMap: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  red: { bg: 'bg-red-50', icon: 'text-red-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
};

export function StatCard({ title, value, icon, trend, className, color = 'blue' }: StatCardProps) {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-6', className)}>
      <div className="flex items-center justify-between">
        <div className={cn('p-2.5 rounded-lg', colors.bg)}>
          <div className={colors.icon}>{icon}</div>
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
            )}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  );
}
