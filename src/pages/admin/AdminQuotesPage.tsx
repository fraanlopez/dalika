import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Eye } from 'lucide-react';
import { quoteRequestsService } from '@/services';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDate } from '@/utils';
import type { QuoteRequest } from '@/types';

const statusConfig: Record<string, { variant: 'warning' | 'success' | 'danger' | 'default'; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pendiente' },
  QUOTED: { variant: 'success', label: 'Cotizado' },
  EXPIRED: { variant: 'danger', label: 'Expirado' },
  CANCELLED: { variant: 'default', label: 'Cancelado' },
};

export function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    qr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.clientName.toLowerCase().includes(searchTerm.toLowerCase())
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
        title="Todas las Cotizaciones"
        description="Gestiona todas las solicitudes de cotizacion del sistema."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar por titulo o cliente..."
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
              title="No hay cotizaciones"
              description="No se encontraron solicitudes de cotizacion."
              icon={<FileText className="h-16 w-16" />}
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell as="th">ID</TableCell>
                  <TableCell as="th">Titulo</TableCell>
                  <TableCell as="th">Cliente</TableCell>
                  <TableCell as="th">Productos</TableCell>
                  <TableCell as="th">Estado</TableCell>
                  <TableCell as="th">Fecha</TableCell>
                  <TableCell as="th" className="text-right">Acciones</TableCell>
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
                      <TableCell className="text-sm text-gray-600">{qr.clientName}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{qr.items.length} producto(s)</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(qr.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/quotes/${qr.id}`}>
                          <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                            Ver
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
