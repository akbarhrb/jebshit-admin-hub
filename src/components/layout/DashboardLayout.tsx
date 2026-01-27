import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import LanguageToggle from '@/components/LanguageToggle';
import { 
  Newspaper, 
  Users, 
  BookOpen, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Calendar,
  BookMarked
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/news', label: t('nav.news'), icon: Newspaper },
    { path: '/martyrs', label: t('nav.martyrs'), icon: Users },
    { path: '/sheikh-stories', label: t('nav.sheikhStories'), icon: BookOpen },
    { path: '/activities', label: t('nav.activities'), icon: Calendar },
    { path: '/topics', label: t('nav.topics'), icon: BookMarked },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        rtl:left-auto rtl:right-0 rtl:translate-x-full rtl:lg:translate-x-0
        ${isSidebarOpen ? 'rtl:translate-x-0' : ''}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-foreground">{t('common.appName')}</h1>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-sidebar-foreground hover:text-sidebar-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Toggle */}
          <div className="px-3 py-3 border-b border-sidebar-border">
            <LanguageToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-3 py-4 border-t border-sidebar-border">
            <div className="px-4 py-2 mb-2">
              <p className="text-sm text-sidebar-muted">{t('nav.loggedInAs')}</p>
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="sidebar-link w-full hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('auth.signOut')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">{t('common.appName')}</h1>
          <div className="w-9" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
