import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Link, Trash2 } from 'lucide-react';
import { quoteRequestsService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

interface ProductLinkInput {
  id: string;
  url: string;
  name: string;
}

export function NewQuoteRequestPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productLinks, setProductLinks] = useState<ProductLinkInput[]>([
    { id: 'link-1', url: '', name: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProductLink = () => {
    setProductLinks((prev) => [
      ...prev,
      { id: `link-${Date.now()}`, url: '', name: '' },
    ]);
  };

  const removeProductLink = (id: string) => {
    setProductLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const updateProductLink = (id: string, field: 'url' | 'name', value: string) => {
    setProductLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validLinks = productLinks.filter((link) => link.url.trim());
    if (!title.trim()) {
      addToast({ type: 'error', title: 'Error', message: 'El titulo es requerido' });
      return;
    }
    if (validLinks.length === 0) {
      addToast({ type: 'error', title: 'Error', message: 'Agrega al menos un link de producto' });
      return;
    }

    setIsSubmitting(true);
    try {
      await quoteRequestsService.create({
        title: title.trim(),
        description: description.trim(),
        items: validLinks.map((link) => ({
          productUrl: link.url.trim(),
          productName: link.name.trim() || undefined,
        })),
      });
      addToast({ type: 'success', title: 'Solicitud creada', message: 'Tu solicitud de cotizacion ha sido enviada exitosamente.' });
      navigate('/quotes');
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo crear la solicitud. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Nueva Solicitud de Cotizacion"
        description="Completa el formulario para solicitar una cotizacion de productos."
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardBody>
                <div className="space-y-5">
                  <Input
                    label="Titulo de la solicitud"
                    placeholder="Ej: Equipamiento de oficina"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <Textarea
                    label="Descripcion"
                    placeholder="Describe los productos que necesitas cotizar, cantidades, especificaciones..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addProductLink} leftIcon={<Plus className="h-4 w-4" />}>
                    Agregar link
                  </Button>
                </div>

                <div className="space-y-4">
                  {productLinks.map((link, index) => (
                    <div key={link.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Link className="h-4 w-4 text-gray-400" />
                          Producto {index + 1}
                        </span>
                        {productLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProductLink(link.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <Input
                        placeholder="URL del producto"
                        value={link.url}
                        onChange={(e) => updateProductLink(link.id, 'url', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Nombre del producto (opcional)"
                        value={link.name}
                        onChange={(e) => updateProductLink(link.id, 'name', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Productos agregados</span>
                    <span className="font-medium text-gray-900">
                      {productLinks.filter((l) => l.url.trim()).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Estado</span>
                    <span className="font-medium text-gray-900">Borrador</span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full">
                    Enviar Solicitud
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/quotes')}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
