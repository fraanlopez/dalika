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
import { useTranslation } from 'react-i18next';
import type { Brand } from '@/types';

export function BrandsManagementPage() {
  const { t } = useTranslation();
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
      addToast({ type: 'error', title: t('brands.errorLoading'), message: t('brands.errorLoading') });
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
      addToast({ type: 'error', title: t('brands.nameRequired'), message: t('brands.nameRequired') });
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
        addToast({ type: 'success', title: t('brands.brandUpdated'), message: `${formData.name} ${t('brands.brandUpdated')}` });
      } else {
        await brandsService.create({
          name: formData.name.trim(),
          logoUrl: formData.logoUrl.trim() || `https://placehold.co/120x60/e2e8f0/64748b?text=${formData.name.trim().charAt(0)}`,
          description: formData.description.trim(),
          externalLink: formData.externalLink.trim(),
          categoryIds: formData.categoryIds,
        });
        addToast({ type: 'success', title: t('brands.brandCreated'), message: `${formData.name} ${t('brands.brandCreated')}` });
      }
      setShowModal(false);
      fetchData();
    } catch {
      addToast({ type: 'error', title: t('brands.errorSave'), message: t('brands.errorSave') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(t('brands.confirmDelete', { name: brand.name }))) return;
    try {
      await brandsService.delete(brand.id);
      addToast({ type: 'success', title: t('brands.brandDeleted'), message: `${brand.name} ${t('brands.brandDeleted')}` });
      fetchData();
    } catch {
      addToast({ type: 'error', title: t('brands.errorDelete'), message: t('brands.errorDelete') });
    }
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const getCategoryName = (brand: Brand) => {
    if (!brand.categories || brand.categories.length === 0) return t('brands.noCategory');
    return brand.categories.map(c => c.name).join(', ');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('brands.manageTitle')}
        description={t('brands.manageDescription')}
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            {t('brands.newBrand')}
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder={t('brands.searchPlaceholder')}
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
              title={t('brands.noBrands')}
              description={t('brands.noBrandsRegistered')}
              action={
                <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
                  {t('brands.createBrand')}
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
                  <TableCell as="th">{t('brands.name')}</TableCell>
                  <TableCell as="th">{t('brands.category')}</TableCell>
                  <TableCell as="th">{t('brands.status')}</TableCell>
                  <TableCell as="th">{t('brands.created')}</TableCell>
                  <TableCell as="th" className="text-right">{t('brands.actions')}</TableCell>
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
                        {brand.isActive ? t('brands.active') : t('brands.inactive')}
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
        title={editingBrand ? t('brands.editBrand') : t('brands.newBrand')}
        description={editingBrand ? t('brands.editDescription') : t('brands.createDescription')}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              {t('brands.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingBrand ? t('brands.saveChanges') : t('brands.createBrand')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('brands.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('brands.namePlaceholder')}
            required
          />
          <Input
            label={t('brands.logoUrl')}
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder={t('brands.logoPlaceholder')}
          />
          <Textarea
            label={t('brands.description')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('brands.descPlaceholder')}
            rows={3}
          />
          <Input
            label={t('brands.externalLink')}
            value={formData.externalLink}
            onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
            placeholder={t('brands.linkPlaceholder')}
          />
          <Select
            label={t('brands.category')}
            options={categoryOptions}
            value={formData.categoryIds[0] || ''}
            onChange={(e) => setFormData({ ...formData, categoryIds: [e.target.value] })}
            placeholder={t('brands.selectCategory')}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">{t('brands.active')}</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
