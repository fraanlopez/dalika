import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowLeft, Clock, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { quoteRequestsService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatDateTime } from '@/utils';
import { useToast } from '@/components/ui/Toast';
import type { QuoteRequest } from '@/types';

const statusConfig: Record<string, { variant: 'warning' | 'success' | 'danger' | 'default'; label: string; icon: React.ReactNode }> = {
  PENDING: { variant: 'warning', label: 'Pendiente', icon: <Clock className="h-4 w-4" /> },
  QUOTED: { variant: 'success', label: 'Cotizado', icon: <CheckCircle className="h-4 w-4" /> },
  EXPIRED: { variant: 'danger', label: 'Expirado', icon: <Clock className="h-4 w-4" /> },
  CANCELLED: { variant: 'default', label: 'Cancelado', icon: <Clock className="h-4 w-4" /> },
};

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [quoteLink, setQuoteLink] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  const isAdminOrRep = user?.role === 'ADMIN' || user?.role === 'REP';

  useEffect(() => {
    if (!id) return;
    const quoteId = id;
    async function fetchQuote() {
      try {
        const data = await quoteRequestsService.getById(quoteId);
        setQuote(data);
      } catch {
        addToast({ type: 'error', title: 'Error', message: 'No se pudo cargar la cotizacion' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuote();
  }, [id, addToast]);

  const handleRespond = async () => {
    if (!id || !quoteLink.trim()) {
      addToast({ type: 'error', title: 'Error', message: 'El link de cotizacion es requerido' });
      return;
    }
    setIsResponding(true);
    try {
      const updated = await quoteRequestsService.respond(id, {
        quoteUrl: quoteLink.trim(),
        adminNotes: adminNotes.trim() || undefined,
      });
      setQuote(updated);
      setShowRespondModal(false);
      setQuoteLink('');
      setAdminNotes('');
      addToast({ type: 'success', title: 'Respuesta enviada', message: 'La cotizacion ha sido enviada al cliente.' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo enviar la respuesta' });
    } finally {
      setIsResponding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardBody>
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </CardBody>
            </Card>
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontro la cotizacion</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4" leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Volver
        </Button>
      </div>
    );
  }

  const status = statusConfig[quote.status] || statusConfig.PENDING;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
          <p className="text-sm text-gray-500">
            Solicitud {quote.id} - Creada el {formatDate(quote.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Detalles de la solicitud</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Descripcion</h3>
                  <p className="text-gray-900">{quote.description || 'Sin descripcion'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Productos solicitados ({quote.items.length})</h3>
                  <div className="space-y-2">
                    {quote.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.productName || item.productUrl}</p>
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-700 truncate block"
                          >
                            {item.productUrl}
                          </a>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {quote.status === 'QUOTED' && quote.response && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Respuesta de la cotizacion</h2>
              </CardHeader>
              <CardBody>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm font-medium text-emerald-900 mb-2">Cotizacion disponible</p>
                  {quote.response.adminNotes && (
                    <p className="text-sm text-emerald-700 mb-3">{quote.response.adminNotes}</p>
                  )}
                  <a
                    href={quote.response.quoteUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Ver Cotizacion Completa
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                {quote.respondedAt && (
                  <p className="text-xs text-gray-500 mt-3">
                    Respondida el {formatDateTime(quote.respondedAt)}
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardBody>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Informacion</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Estado</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Creada</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(quote.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Actualizada</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(quote.updatedAt)}</span>
                </div>
                {quote.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Expira</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(quote.expiresAt)}</span>
                  </div>
                )}
                {isAdminOrRep && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Cliente</span>
                    <span className="text-sm font-medium text-gray-900">{quote.clientName}</span>
                  </div>
                )}
              </div>
            </CardBody>
            {isAdminOrRep && quote.status === 'PENDING' && (
              <CardFooter>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowRespondModal(true)}
                >
                  Responder Cotizacion
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showRespondModal}
        onClose={() => setShowRespondModal(false)}
        title="Responder Cotizacion"
        description="Envia el link de la cotizacion al cliente."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRespondModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleRespond} isLoading={isResponding}>
              Enviar Respuesta
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Link de cotizacion"
            placeholder="https://cotizacion.dalika.com/..."
            value={quoteLink}
            onChange={(e) => setQuoteLink(e.target.value)}
            required
          />
          <Textarea
            label="Notas internas (opcional)"
            placeholder="Agrega notas sobre la cotizacion..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
