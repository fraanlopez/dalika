import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  FileText,
  PlusCircle,
  Users,
  Tags,
  Settings,
  LogOut,
  Package,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/utils';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'sidebar.general',
    items: [
      { label: 'nav.dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['ADMIN', 'REP', 'CLIENT'] },
    ],
  },
  {
    title: 'sidebar.quotes',
    items: [
      { label: 'nav.myQuotes', path: '/quotes', icon: <FileText className="h-5 w-5" />, roles: ['CLIENT'] },
      { label: 'nav.newRequest', path: '/quotes/new', icon: <PlusCircle className="h-5 w-5" />, roles: ['CLIENT'] },
      { label: 'nav.allQuotes', path: '/admin/quotes', icon: <FileText className="h-5 w-5" />, roles: ['ADMIN', 'REP'] },
    ],
  },
  {
    title: 'sidebar.catalog',
    items: [
      { label: 'nav.brands', path: '/brands', icon: <Store className="h-5 w-5" />, roles: ['CLIENT'] },
      { label: 'nav.brandManagement', path: '/admin/brands', icon: <Package className="h-5 w-5" />, roles: ['ADMIN'] },
      { label: 'nav.categories', path: '/admin/categories', icon: <Tags className="h-5 w-5" />, roles: ['ADMIN'] },
    ],
  },
  {
    title: 'sidebar.administration',
    items: [
      { label: 'nav.users', path: '/admin/users', icon: <Users className="h-5 w-5" />, roles: ['ADMIN'] },
    ],
  },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, closeSidebar } = useUIStore();
  const { t } = useTranslation();

  if (!user) return null;

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(user.role)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-sidebar text-white transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-lg font-bold">Dalika</span>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {filteredSections.map((section) => (
              <div key={section.title} className="mb-6">
                <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {t(section.title)}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path !== '/dashboard'}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-active text-white'
                            : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                        )
                      }
                    >
                      {item.icon}
                      {t(item.label)}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 px-3 py-4">
            <NavLink
              to="/settings"
              onClick={closeSidebar}
              className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <Settings className="h-4 w-4 text-gray-400" />
            </NavLink>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {t('sidebar.closeSession')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
