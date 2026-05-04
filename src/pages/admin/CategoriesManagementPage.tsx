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
import { useTranslation } from 'react-i18next';
import type { Category } from '@/types';

export function CategoriesManagementPage() {
  const { t } = useTranslation();
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
      addToast({ type: 'error', title: t('categories.errorLoading'), message: t('categories.errorLoading') });
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
      addToast({ type: 'error', title: t('categories.nameRequired'), message: t('categories.nameRequired') });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        addToast({ type: 'success', title: t('categories.categoryUpdated'), message: `${formData.name} ${t('categories.categoryUpdated')}` });
      } else {
        await categoriesService.create({
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        addToast({ type: 'success', title: t('categories.categoryCreated'), message: `${formData.name} ${t('categories.categoryCreated')}` });
      }
      setShowModal(false);
      fetchCategories();
    } catch {
      addToast({ type: 'error', title: t('categories.errorSave'), message: t('categories.errorSave') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(t('categories.confirmDelete', { name: category.name }))) return;
    try {
      await categoriesService.delete(category.id);
      addToast({ type: 'success', title: t('categories.categoryDeleted'), message: `${category.name} ${t('categories.categoryDeleted')}` });
      fetchCategories();
    } catch {
      addToast({ type: 'error', title: t('categories.errorDelete'), message: t('categories.errorDelete') });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('categories.manageTitle')}
        description={t('categories.manageDescription')}
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            {t('categories.newCategory')}
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder={t('categories.searchPlaceholder')}
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
              title={t('categories.noCategories')}
              description={t('categories.noCategoriesDescription')}
              icon={<Tags className="h-16 w-16" />}
              action={
                <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
                  {t('categories.createCategory')}
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
                  <TableCell as="th">{t('categories.name')}</TableCell>
                  <TableCell as="th">{t('categories.description')}</TableCell>
                  <TableCell as="th">{t('categories.brands')}</TableCell>
                  <TableCell as="th">{t('categories.created')}</TableCell>
                  <TableCell as="th" className="text-right">{t('categories.actions')}</TableCell>
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
        title={editingCategory ? t('categories.editCategory') : t('categories.newCategory')}
        description={editingCategory ? t('categories.editDescription') : t('categories.createDescription')}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              {t('categories.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingCategory ? t('categories.saveChanges') : t('categories.createCategory')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('categories.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('categories.namePlaceholder')}
            required
          />
          <Textarea
            label={t('categories.description')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('categories.descPlaceholder')}
            rows={3}
          />
        </form>
      </Modal>
    </div>
  );
}
