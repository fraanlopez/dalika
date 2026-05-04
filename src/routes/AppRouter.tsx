import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { BrandCatalogPage } from '@/pages/brands/BrandCatalogPage';
import { QuoteRequestsPage } from '@/pages/quotes/QuoteRequestsPage';
import { NewQuoteRequestPage } from '@/pages/quotes/NewQuoteRequestPage';
import { QuoteDetailPage } from '@/pages/quotes/QuoteDetailPage';
import { UsersManagementPage } from '@/pages/admin/UsersManagementPage';
import { BrandsManagementPage } from '@/pages/admin/BrandsManagementPage';
import { CategoriesManagementPage } from '@/pages/admin/CategoriesManagementPage';
import { AdminQuotesPage } from '@/pages/admin/AdminQuotesPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';

function RedirectBasedOnRole() {
  const { user } = useAuthStore();
  if (user?.role === 'ADMIN' || user?.role === 'REP') {
    return <Navigate to="/admin/quotes" replace />;
  }
  return <Navigate to="/quotes" replace />;
}

export function AppRouter() {
  const { isLoading } = useAuthStore();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin-slow" />
          <p className="text-sm text-gray-500">{t('sidebar.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/brands"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <MainLayout>
              <BrandCatalogPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotes"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <MainLayout>
              <QuoteRequestsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotes/new"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <MainLayout>
              <NewQuoteRequestPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotes/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <QuoteDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <UsersManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/brands"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <BrandsManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <CategoriesManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/quotes"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'REP']}>
            <MainLayout>
              <AdminQuotesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
