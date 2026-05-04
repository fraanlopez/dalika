import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Tags } from 'lucide-react';
import { categoriesService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/utils';
import type { Category } from '@/types';

export function CategoriesManagementPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const data = await categoriesService.getAll();
      setCategories(data.data);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar las categorias' });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast({ type: 'error', title: 'Error', message: 'El nombre es requerido' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        addToast({ type: 'success', title: 'Categoria actualizada', message: `${formData.name} ha sido actualizada.` });
      } else {
        await categoriesService.create({
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        addToast({ type: 'success', title: 'Categoria creada', message: `${formData.name} ha sido creada.` });
      }
      setShowModal(false);
      fetchCategories();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar la categoria' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`¿Estas seguro de que deseas eliminar "${category.name}"?`)) return;
    try {
      await categoriesService.delete(category.id);
      addToast({ type: 'success', title: 'Categoria eliminada', message: `${category.name} ha sido eliminada.` });
      fetchCategories();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar la categoria' });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestion de Categorias"
        description="Administra las categorias del catalogo de marcas."
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            Nueva Categoria
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : filteredCategories.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              title="No hay categorias"
              description="No se encontraron categorias registradas."
              icon={<Tags className="h-16 w-16" />}
              action={
                <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
                  Crear Categoria
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
                  <TableCell as="th">Nombre</TableCell>
                  <TableCell as="th">Descripcion</TableCell>
                  <TableCell as="th">Marcas</TableCell>
                  <TableCell as="th">Creada</TableCell>
                  <TableCell as="th" className="text-right">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center">
                          <Tags className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">{category.description}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-900">{category.brandCount}</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(category.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(category)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(category)}>
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
        title={editingCategory ? 'Editar Categoria' : 'Nueva Categoria'}
        description={editingCategory ? 'Modifica los datos de la categoria.' : 'Completa los datos para crear una nueva categoria.'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoria'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la categoria"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Electronica"
            required
          />
          <Textarea
            label="Descripcion"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripcion de la categoria..."
            rows={3}
          />
        </form>
      </Modal>
    </div>
  );
}
