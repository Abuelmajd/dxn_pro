import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';

const DxnLogo = () => (
    <img 
        src="https://lh3.googleusercontent.com/d/1JVW882aiQIHcc91tEhn9_fOjRSOJFkS8"
        alt="DXN App Logo"
        className="h-10 w-auto rounded-2xl"
    />
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChecklistIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Header: React.FC = () => {
  const { t, customerSelections, logout, settings, formatNumber, exchangeRate, isRateLoading } = useAppContext();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pendingCount = customerSelections.filter(s => s.status === 'pending').length;
  const isRTL = settings.language === 'ar';

  useEffect(() => {
    if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
      isActive
        ? 'bg-primary text-white'
        : 'text-text-primary hover:bg-card-secondary'
    }`;
    
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `block w-full text-start px-4 py-3 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'bg-primary/20 text-primary'
        : 'text-text-primary hover:bg-card-secondary'
    }`;

  const renderNavLinks = (isMobile = false) => {
    const linkClass = isMobile ? mobileNavLinkClass : navLinkClass;
    const closeMenu = () => isMobile && setIsMenuOpen(false);
    return (
      <>
        <NavLink to="/admin" end className={linkClass} onClick={closeMenu}>{t('dashboard')}</NavLink>
        <NavLink to="/admin/products" className={linkClass} onClick={closeMenu}>{t('products')}</NavLink>
        <NavLink to="/admin/customer-selections" className={linkClass} onClick={closeMenu}>
          {t('customerSelections')}
          {!isMobile && pendingCount > 0 && (
            <span className="absolute -top-2 -right-2.5 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {pendingCount}
            </span>
          )}
          {isMobile && pendingCount > 0 && <span className="ms-2 inline-block bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">{pendingCount}</span>}
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass} onClick={closeMenu}>{t('invoices')}</NavLink>
        <NavLink to="/admin/customers" className={linkClass} onClick={closeMenu}>{t('customers')}</NavLink>
        <NavLink to="/admin/reports" className={linkClass} onClick={closeMenu}>{t('reports')}</NavLink>
        <NavLink to="/admin/expenses" className={linkClass} onClick={closeMenu}>{t('expenses')}</NavLink>
      </>
    );
  };

  return (
    <>
      <header className="bg-card/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-border">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/admin" className="flex-shrink-0">
                <DxnLogo />
              </NavLink>
              <div className="ms-4 border-s border-border ps-4 hidden md:block">
                <span className="text-sm font-medium text-text-secondary">
                  {isRateLoading ? `${t('exchangeRate')}: ...` : `${t('exchangeRate')}: $1 = ${formatNumber(exchangeRate)}${settings.currency.symbol}`}
                </span>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-s-4">
              {renderNavLinks(false)}
              <ThemeToggle className="text-text-primary hover:text-accent transition-colors p-2 rounded-full hover:bg-card-secondary" />
              <NavLink to="/admin/setup-check" title={t('setupCheck')} className="text-text-primary hover:text-accent transition-colors p-2 rounded-full hover:bg-card-secondary">
                <ChecklistIcon />
              </NavLink>
              <NavLink to="/admin/settings" title={t('settings')} className="text-text-primary hover:text-accent transition-colors p-2 rounded-full hover:bg-card-secondary">
                <SettingsIcon />
              </NavLink>
              <button onClick={handleLogout} title={t('logout')} className="text-text-primary hover:text-red-600 transition-colors p-2 rounded-full hover:bg-card-secondary">
                <LogoutIcon />
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(true)} className="text-text-primary p-2 rounded-md">
                    <span className="sr-only">{t('menu')}</span>
                    <MenuIcon />
                </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 bottom-0 w-64 bg-card shadow-xl transition-transform duration-300 ease-in-out ${isRTL ? 'right-0' : 'left-0'} ${isMenuOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`}>
            <div className="flex justify-between items-center p-4 border-b border-border">
                <span className="font-bold text-lg text-text-primary">{t('menuTitle')}</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-text-primary">
                    <XIcon />
                </button>
            </div>
            <div className="h-[calc(100vh-65px)] overflow-y-auto">
                <nav className="p-4 flex flex-col gap-2">
                    {renderNavLinks(true)}
                </nav>
                <div className="p-4 mt-4 border-t border-border space-y-2">
                    <NavLink to="/admin/setup-check" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-text-primary hover:bg-card-secondary p-3 rounded-md">
                        <ChecklistIcon /> <span>{t('setupCheck')}</span>
                    </NavLink>
                    <NavLink to="/admin/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-text-primary hover:bg-card-secondary p-3 rounded-md">
                        <SettingsIcon /> <span>{t('settings')}</span>
                    </NavLink>
                     <button onClick={handleLogout} className="w-full flex items-center gap-3 text-text-primary hover:bg-card-secondary p-3 rounded-md">
                        <LogoutIcon /> <span>{t('logout')}</span>
                    </button>
                </div>
                 <div className="p-4 mt-4 border-t border-border">
                    <ThemeToggle className="text-text-primary hover:text-accent hover:bg-card-secondary w-full flex justify-center"/>
                 </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;