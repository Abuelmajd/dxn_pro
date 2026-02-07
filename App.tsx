
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import NewOrderPage from './pages/NewOrderPage';
import OrdersPage from './pages/OrdersPage';
import AddProductPage from './pages/AddProductPage';
import CustomersPage from './pages/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import ReportsPage from './pages/ReportsPage';
import ExpensesPage from './pages/ExpensesPage';
import ProductsListPage from './pages/ProductsListPage';
import EditProductPage from './pages/EditProductPage';
import CustomerSelectionPage from './pages/CustomerSelectionPage';
import CustomerSelectionsListPage from './pages/CustomerSelectionsListPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import SetupCheckPage from './pages/SetupCheckPage';
import Footer from './components/Footer';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-text-primary overflow-hidden">
        <div className="relative flex items-center justify-center w-64 h-64">
             {/* Orbiting icons */}
            <div className="absolute w-full h-full border-2 border-dashed border-border rounded-full animate-spin-slow"></div>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit" style={{ animationDelay: '0s' }}>
                <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-lg">
                    {/* Product Box Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
            </div>

            <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 animate-orbit" style={{ animationDelay: '-2s' }}>
                 <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-lg">
                    {/* Chart Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
            </div>

            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 animate-orbit" style={{ animationDelay: '-4s' }}>
                 <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-lg">
                     {/* Users Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3M15 21a2 2 0 002-2v-1a2 2 0 00-2-2h-3a2 2 0 00-2 2v1a2 2 0 002 2h3zm-3-9a3 3 0 00-3-3H6a3 3 0 00-3 3v6a3 3 0 003 3h6a3 3 0 003-3V9a3 3 0 00-3-3h-3z" />
                    </svg>
                </div>
            </div>
            
             {/* Center Logo */}
            <img 
                src="https://lh3.googleusercontent.com/d/1JVW882aiQIHcc91tEhn9_fOjRSOJFkS8"
                alt="DXN App Logo"
                className="h-24 w-24 rounded-3xl shadow-2xl"
            />
        </div>

        <h1 className="mt-12 text-2xl font-bold tracking-wider text-text-primary animate-pulse">جاري تجهيز الصفحة وتحميل البيانات...</h1>
        <p className="mt-2 text-text-secondary">لحظات من فضلك</p>
        
        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
          }
          
          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(128px) rotate(0deg) scale(0.8); opacity: 0.7;}
            50% { transform: rotate(180deg) translateX(128px) rotate(-180deg) scale(1); opacity: 1; }
            100% { transform: rotate(360deg) translateX(128px) rotate(-360deg) scale(0.8); opacity: 0.7; }
          }
          .animate-orbit {
            animation: orbit 6s linear infinite;
          }
        `}</style>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-red-500/10 text-red-500 dark:text-red-400 p-4">
        <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
        <p className="text-center">{message}</p>
        <p className="mt-4 text-sm">يرجى التأكد من صحة رابط Google Apps Script في الكود، ومنح الأذونات اللازمة، وتحديث الصفحة. يمكنك استخدام أداة فحص الإعدادات لتشخيص المشكلة.</p>
    </div>
);

const AdminRoutes: React.FC = () => {
  const { fetchData } = useAppContext();

  useEffect(() => {
    // Fetch data automatically when entering the admin area
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchData();
    }, 300000); // 5 minutes in milliseconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsListPage />} />
          <Route path="/products/:productId/edit" element={<EditProductPage />} />
          <Route path="/new-order" element={<NewOrderPage />} />
          <Route path="/orders/:orderId/edit" element={<NewOrderPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/customer-selections" element={<CustomerSelectionsListPage />} />
          <Route path="/setup-check" element={<SetupCheckPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}


const MainApp: React.FC = () => {
  const { isLoading, apiError } = useAppContext();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (apiError) {
    return <ErrorDisplay message={apiError} />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<CustomerSelectionPage />} />
      <Route path="/selection" element={<CustomerSelectionPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <MainApp />
      </HashRouter>
    </AppProvider>
  );
};

export default App;