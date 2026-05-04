import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Store, Users, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { dashboardService } from '@/services';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/utils';
import { useTranslation } from 'react-i18next';
import type { DashboardMetrics } from '@/types';

const statusBadgeMap: Record<string, { variant: 'warning' | 'info' | 'danger' | 'success' | 'default'; label: string }> = {
  PENDING: { variant: 'warning', label: 'status.PENDING' },
  QUOTED: { variant: 'success', label: 'status.QUOTED' },
  EXPIRED: { variant: 'danger', label: 'status.EXPIRED' },
  CANCELLED: { variant: 'default', label: 'status.CANCELLED' },
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch {
        setError(t('dashboard.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{error || t('dashboard.noMetrics')}</p>
      </div>
    );
  }

  const getWelcomeMessage = () => {
    if (user?.role === 'CLIENT') return t('dashboard.welcomeClient');
    if (user?.role === 'REP') return t('dashboard.welcomeRep');
    return t('dashboard.welcomeAdmin');
  };

  const getClientCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title={t('dashboard.totalRequests')}
        value={metrics.totalQuoteRequests}
        icon={<FileText className="h-5 w-5" />}
        color="blue"
      />
      <StatCard
        title={t('dashboard.pending')}
        value={metrics.pendingQuoteRequests}
        icon={<Clock className="h-5 w-5" />}
        color="amber"
      />
      <StatCard
        title={t('dashboard.quoted')}
        value={metrics.quotedQuoteRequests}
        icon={<CheckCircle className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        title={t('dashboard.availableBrands')}
        value={metrics.totalBrands}
        icon={<Store className="h-5 w-5" />}
        color="purple"
      />
    </div>
  );

  const getAdminCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title={t('dashboard.totalRequests')}
        value={metrics.totalQuoteRequests}
        icon={<FileText className="h-5 w-5" />}
        color="blue"
      />
      <StatCard
        title={t('dashboard.pending')}
        value={metrics.pendingQuoteRequests}
        icon={<Clock className="h-5 w-5" />}
        color="amber"
      />
      <StatCard
        title={t('dashboard.expired')}
        value={metrics.expiredQuoteRequests}
        icon={<AlertTriangle className="h-5 w-5" />}
        color="red"
      />
      <StatCard
        title={t('dashboard.activeClients')}
        value={metrics.totalClients}
        icon={<Users className="h-5 w-5" />}
        color="green"
      />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{getWelcomeMessage()}</h1>
        <p className="mt-1 text-gray-500">{t('dashboard.welcome', { name: user?.name })}</p>
      </div>

      {user?.role === 'CLIENT' ? getClientCards() : getAdminCards()}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recentRequests')}</h2>
            <Link
              to={user?.role === 'CLIENT' ? '/quotes' : '/admin/quotes'}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
            >
              {t('dashboard.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {metrics.recentQuoteRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('dashboard.noRecentRequests')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentQuoteRequests.map((qr) => {
                const status = statusBadgeMap[qr.status] || statusBadgeMap.PENDING;
                return (
                  <div
                    key={qr.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{qr.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(qr.createdAt)}
                        {user?.role !== 'CLIENT' && <span> - {qr.clientName}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Badge variant={status.variant}>{t(status.label)}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
