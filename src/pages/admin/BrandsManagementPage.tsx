import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { brandsService, categoriesService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/utils';
import type { Brand } from '@/types';

export function BrandsManagementPage() {
  const { addToast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    description: '',
    externalLink: '',
    categoryIds: [] as string[],
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [brandsData, categoriesData] = await Promise.all([
        brandsService.getAll(),
        categoriesService.getAll(),
      ]);
      setBrands(brandsData.data);
      setCategories(categoriesData.data);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los datos' });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({ name: '', logoUrl: '', description: '', externalLink: '', categoryIds: [], isActive: true });
    setShowModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logoUrl: brand.logoUrl || '',
      description: brand.description,
      externalLink: brand.externalLink,
      categoryIds: brand.categories?.map(c => c.id) || [],
      isActive: brand.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast({ type: 'error', title: 'Error', message: 'Nombre es requerido' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBrand) {
        await brandsService.update(editingBrand.id, {
          name: formData.name.trim(),
          logoUrl: formData.logoUrl.trim() || editingBrand.logoUrl,
          description: formData.description.trim(),
          externalLink: formData.externalLink.trim(),
          categories: formData.categoryIds.map(id => ({ id, name: categories.find(c => c.id === id)?.name || '' })),
          isActive: formData.isActive,
        });
        addToast({ type: 'success', title: 'Marca actualizada', message: `${formData.name} ha sido actualizada.` });
      } else {
        await brandsService.create({
          name: formData.name.trim(),
          logoUrl: formData.logoUrl.trim() || `https://placehold.co/120x60/e2e8f0/64748b?text=${formData.name.trim().charAt(0)}`,
          description: formData.description.trim(),
          externalLink: formData.externalLink.trim(),
          categoryIds: formData.categoryIds,
        });
        addToast({ type: 'success', title: 'Marca creada', message: `${formData.name} ha sido creada.` });
      }
      setShowModal(false);
      fetchData();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar la marca' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`¿Estas seguro de que deseas eliminar "${brand.name}"?`)) return;
    try {
      await brandsService.delete(brand.id);
      addToast({ type: 'success', title: 'Marca eliminada', message: `${brand.name} ha sido eliminada.` });
      fetchData();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar la marca' });
    }
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const getCategoryName = (brand: Brand) => {
    if (!brand.categories || brand.categories.length === 0) return 'Sin categoria';
    return brand.categories.map(c => c.name).join(', ');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestion de Marcas"
        description="Administra las marcas disponibles en el catalogo."
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            Nueva Marca
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Buscar marcas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : filteredBrands.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              title="No hay marcas"
              description="No se encontraron marcas registradas."
              action={
                <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
                  Crear Marca
                </Button>
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
                  <TableCell as="th">Marca</TableCell>
                  <TableCell as="th">Categoria</TableCell>
                  <TableCell as="th">Estado</TableCell>
                  <TableCell as="th">Creada</TableCell>
                  <TableCell as="th" className="text-right">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={brand.logoUrl || `https://placehold.co/60x30/e2e8f0/64748b?text=${brand.name.charAt(0)}`}
                          alt={brand.name}
                          className="w-10 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/60x30/e2e8f0/64748b?text=${brand.name.charAt(0)}`;
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{brand.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{brand.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{getCategoryName(brand)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={brand.isActive ? 'success' : 'default'}>
                        {brand.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(brand.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={brand.externalLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(brand)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(brand)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}
        description={editingBrand ? 'Modifica los datos de la marca.' : 'Completa los datos para crear una nueva marca.'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingBrand ? 'Guardar Cambios' : 'Crear Marca'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la marca"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Samsung"
            required
          />
          <Input
            label="URL del logo (opcional)"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
          <Textarea
            label="Descripcion"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripcion de la marca..."
            rows={3}
          />
          <Input
            label="Link externo"
            value={formData.externalLink}
            onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
            placeholder="https://www.samsung.com"
          />
          <Select
            label="Categoria"
            options={categoryOptions}
            value={formData.categoryIds[0] || ''}
            onChange={(e) => setFormData({ ...formData, categoryIds: [e.target.value] })}
            placeholder="Selecciona una categoria"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Marca activa</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
