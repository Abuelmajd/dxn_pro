import React from 'react';
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

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-card-secondary rounded-full animate-spin"></div>
        <p className="mt-4 text-text-primary">جاري تحميل البيانات...</p>
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
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsListPage />} />
          <Route path="/products/:productId/edit" element={<EditProductPage />} />
          <Route path="/new-order" element={<NewOrderPage />} />
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