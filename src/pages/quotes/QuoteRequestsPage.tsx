import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Eye } from 'lucide-react';
import { quoteRequestsService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDate } from '@/utils';
import { useTranslation } from 'react-i18next';
import type { QuoteRequest } from '@/types';

const statusConfig: Record<string, { variant: 'warning' | 'success' | 'danger' | 'default'; label: string }> = {
  PENDING: { variant: 'warning', label: 'status.PENDING' },
  QUOTED: { variant: 'success', label: 'status.QUOTED' },
  EXPIRED: { variant: 'danger', label: 'status.EXPIRED' },
  CANCELLED: { variant: 'default', label: 'status.CANCELLED' },
};

export function QuoteRequestsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const isAdminOrRep = user?.role === 'ADMIN' || user?.role === 'REP';

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const data = await quoteRequestsService.getAll({
          status: statusFilter || undefined,
        });
        setQuotes(data.data);
      } catch {
        // error
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuotes();
  }, [statusFilter]);

  const filteredQuotes = quotes.filter((qr) =>
    qr.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'QUOTED', label: 'Cotizado' },
    { value: 'EXPIRED', label: 'Expirado' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('quotes.myQuotes')}
        description={t('quotes.description')}
        actions={
          <Link to="/quotes/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              {t('quotes.newRequest')}
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder={t('quotes.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : filteredQuotes.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              title={t('quotes.noQuotes')}
              description={
                searchTerm
                  ? t('quotes.noQuotesResult')
                  : t('quotes.noQuotesDescription')
              }
              icon={<FileText className="h-16 w-16" />}
              action={
                !searchTerm ? (
                  <Link to="/quotes/new">
                    <Button leftIcon={<Plus className="h-4 w-4" />}>{t('quotes.createRequest')}</Button>
                  </Link>
                ) : undefined
              }
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell as="th">{t('quotes.table.id')}</TableCell>
                  <TableCell as="th">{t('quotes.table.title')}</TableCell>
                  {isAdminOrRep && <TableCell as="th">{t('quotes.table.client')}</TableCell>}
                  <TableCell as="th">{t('quotes.table.products')}</TableCell>
                  <TableCell as="th">{t('quotes.table.status')}</TableCell>
                  <TableCell as="th">{t('quotes.table.date')}</TableCell>
                  <TableCell as="th" className="text-right">{t('quotes.table.actions')}</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((qr) => {
                  const status = statusConfig[qr.status] || statusConfig.PENDING;
                  return (
                    <TableRow key={qr.id}>
                      <TableCell className="font-mono text-xs text-gray-500">{qr.id}</TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900">{qr.title}</p>
                      </TableCell>
                      {isAdminOrRep && (
                        <TableCell className="text-sm text-gray-600">{qr.clientName}</TableCell>
                      )}
                      <TableCell>
                        <span className="text-sm text-gray-600">{t('quotes.productCount', { count: qr.items.length })}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{t(status.label)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(qr.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/quotes/${qr.id}`}>
                          <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                            {t('quotes.table.view')}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
