import { useEffect, useState } from 'react';
import { ExternalLink, Search, Store } from 'lucide-react';
import { brandsService, categoriesService } from '@/services';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDebounce } from '@/hooks';
import { useTranslation } from 'react-i18next';
import type { Brand, Category } from '@/types';

export function BrandCatalogPage() {
  const { t } = useTranslation();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    async function fetchData() {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          brandsService.getAll(),
          categoriesService.getAll(),
        ]);
        setBrands(brandsData.data);
        setCategories(categoriesData.data);
      } catch {
        // error handling
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchBrands() {
      setIsLoading(true);
      try {
        const data = await brandsService.getAll();
        let filtered = data.data;

        if (selectedCategory) {
          filtered = filtered.filter((b) =>
            b.categories?.some((c) => c.id === selectedCategory)
          );
        }

        if (debouncedSearch) {
          const search = debouncedSearch.toLowerCase();
          filtered = filtered.filter(
            (b) =>
              b.name.toLowerCase().includes(search) ||
              b.description.toLowerCase().includes(search)
          );
        }

        setBrands(filtered);
      } catch {
        // error handling
      } finally {
        setIsLoading(false);
      }
    }
    fetchBrands();
  }, [debouncedSearch, selectedCategory]);

  const categoryOptions = [
    { value: '', label: t('brands.allCategories') },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  const getCategoryName = (brand: Brand) => {
    if (!brand.categories || brand.categories.length === 0) return t('brands.noCategory');
    return brand.categories.map(c => c.name).join(', ');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('brands.catalog')}
        description={t('brands.catalogDescription')}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder={t('brands.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton className="h-12 w-24 mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          title={t('brands.noBrands')}
          description={t('brands.noBrandsDescription')}
          icon={<Store className="h-16 w-16" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <img
                    src={brand.logoUrl || `https://placehold.co/120x60/e2e8f0/64748b?text=${brand.name.charAt(0)}`}
                    alt={brand.name}
                    className="h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/120x60/e2e8f0/64748b?text=${brand.name.charAt(0)}`;
                    }}
                  />
                  {!brand.isActive && <Badge variant="default">{t('brands.inactive')}</Badge>}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{brand.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{brand.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <Badge variant="info">{getCategoryName(brand)}</Badge>
                  <a
                    href={brand.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {t('brands.visitSite')}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
