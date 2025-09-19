

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, Order, CartItem, Customer, AppSettings, Language, NumberFormat, Currency, Expense, CustomerSelection, Category, HealthCheckResult } from '../types';
import { translations, TranslationKeys } from '../translations';

// ================================================================================================
// =================================== خطوة هامة جداً ============================================
//
//               الرجاء لصق رابط الـ WEB APP الذي نسخته من GOOGLE APPS SCRIPT هنا
//
// ================================================================================================
const GOOGLE_SCRIPT_URL: string = 'https://script.google.com/macros/s/AKfycbxDGaH1gdfYBE2sYHm2GIJnOVNw7-1rb9Ybqs0yrM_c4DwEQwQnQRzV7_RH7zAsY_3RdQ/exec';
// ================================================================================================
// ================================================================================================


const FALLBACK_USD_TO_ILS_RATE = 3.7;
const ILS_CURRENCY: Currency = { code: 'ILS', symbol: '₪' };

type AddProductData = Omit<Product, 'id' | 'isAvailable'>;

interface AppContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  expenses: Expense[];
  customerSelections: CustomerSelection[];
  categories: Category[];
  settings: AppSettings;
  isAuthenticated: boolean;
  exchangeRate: number;
  isRateLoading: boolean;
  isLoading: boolean; // For initial data load
  isUpdating: boolean; // For create/update/delete operations
  apiError: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  t: (key: TranslationKeys) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
  formatDate: (date: Date) => string;
  addOrder: (customerData: Omit<Customer, 'id'>, items: CartItem[]) => Promise<boolean>;
  addProduct: (productData: AddProductData) => Promise<boolean>;
  updateProduct: (productData: Product) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  toggleProductAvailability: (productId: string) => Promise<boolean>;
  addExpense: (expenseData: Omit<Expense, 'id' | 'date'> & { date: Date }) => Promise<boolean>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  addCustomerSelection: (selectionData: Omit<CustomerSelection, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  processSelection: (selectionId: string) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getCategoryNameById: (categoryId: string) => string;
  runHealthCheck: () => Promise<HealthCheckResult[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadLocalState = <T,>(key: string, defaultValue: T): T => {
  try {
    const savedState = localStorage.getItem(key);
    return savedState ? JSON.parse(savedState) : defaultValue;
  } catch (error) {
    console.error(`Failed to parse state from localStorage for key "${key}"`, error);
    return defaultValue;
  }
};

const parseData = (data: any) => {
    // Helper to safely parse dates and other types from backend string representations
    const parseWithDates = (items: any[], dateKey: string) => 
        items ? items.map((item: any) => ({ ...item, [dateKey]: new Date(item[dateKey]) }))
              .sort((a: any, b: any) => b[dateKey].getTime() - a[dateKey].getTime())
              : [];
    
    const parsedOrders = parseWithDates(data.orders || [], 'createdAt').map((o: any) => ({
      ...o,
      totalPoints: Number(o.totalPoints) || 0,
      items: (o.items || []).map((i: any) => ({ ...i, points: Number(i.points) || 0 }))
    }));

    return {
        products: (data.products || []).map((p: any) => ({...p, isAvailable: p.isAvailable ?? true, points: Number(p.points) || 0})),
        categories: data.categories || [],
        customers: data.customers || [],
        expenses: parseWithDates(data.expenses, 'date'),
        orders: parsedOrders,
        customerSelections: parseWithDates(data.customerSelections, 'createdAt'),
    };
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customerSelections, setCustomerSelections] = useState<CustomerSelection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = loadLocalState<Pick<AppSettings, 'language' | 'numberFormat'>>('app-settings', {
      language: 'ar',
      numberFormat: 'ar',
    });
    return { ...savedSettings, currency: ILS_CURRENCY };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadLocalState('app-auth', false));
  
  const [exchangeRate, setExchangeRate] = useState<number>(FALLBACK_USD_TO_ILS_RATE);
  const [isRateLoading, setIsRateLoading] = useState<boolean>(true);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('app-auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  // Fetch all data from Google Sheets on initial load
  useEffect(() => {
    const fetchData = async () => {
      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
        setApiError('الرجاء لصق رابط Google Apps Script الخاص بك في ملف context/AppContext.tsx');
        setIsLoading(false);
        return;
      }
      try {
        setApiError(null);
        setIsLoading(true);
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error(`خطأ في الشبكة: ${response.status} ${response.statusText}`);
        
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message || 'فشل جلب البيانات من السيرفر.');
        
        const parsed = parseData(result.data);
        setProducts(parsed.products);
        setCategories(parsed.categories);
        setCustomers(parsed.customers);
        setExpenses(parsed.expenses);
        setOrders(parsed.orders);
        setCustomerSelections(parsed.customerSelections);

      } catch (error: any) {
        console.error("Failed to fetch data from Google Sheets:", error);
        setApiError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // This is a separate effect for the exchange rate, which is independent of our backend
    const fetchExchangeRate = async () => {
      setIsRateLoading(true);
      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=ILS');
        if (!response.ok) throw new Error('Network response was not ok for exchange rate.');
        const data = await response.json();
        setExchangeRate(data.rates?.ILS || FALLBACK_USD_TO_ILS_RATE);
      } catch (error) {
        console.error("Failed to fetch exchange rate, using fallback.", error);
        setExchangeRate(FALLBACK_USD_TO_ILS_RATE);
      } finally {
        setIsRateLoading(false);
      }
    };
    fetchExchangeRate();
  }, []);

  const apiCall = async (action: string, payload: any) => {
    try {
        setIsUpdating(true);
        setApiError(null);
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            cache: 'no-cache',
            redirect: 'follow',
            body: JSON.stringify({ action, payload })
        });

        if (!response.ok) {
           throw new Error(`خطأ في الشبكة: ${response.status} ${response.statusText}`);
        }

        const resultText = await response.text();
        // Try parsing, but catch errors for non-JSON responses (like HTML error pages)
        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse API response as JSON:", resultText);
            throw new Error("استجابة غير صالحة من الخادم. قد يكون رابط Apps Script غير صحيح أو أن هناك مشكلة في النشر.");
        }

        if (result.status !== 'success') {
          throw new Error(result.message || `API call for "${action}" failed.`);
        }
        return result;

    } catch (error: any) {
        console.error(`API call failed for action "${action}":`, error);
        setApiError(error.message);
        return { status: 'error', message: error.message };
    } finally {
        setIsUpdating(false);
    }
  };


  const login = (username: string, password: string): boolean => {
    // This remains a simple client-side login
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const settingsToUpdate = { ...newSettings };
    setSettings(prev => ({ ...prev, ...settingsToUpdate }));
  };

  const t = (key: TranslationKeys): string => translations[settings.language][key] || key;

  const formatNumber = (num: number): string => num.toLocaleString(settings.numberFormat === 'ar' ? 'ar-SA' : 'en-US', { useGrouping: false });

  const formatCurrency = (amount: number): string => `${amount.toLocaleString(settings.numberFormat === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${settings.currency.symbol}`;
  
  const formatDate = (date: Date): string => new Date(date).toLocaleString(settings.language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', numberingSystem: settings.numberFormat === 'ar' ? 'arab' : 'latn', calendar: 'gregory' });

  const getProductById = (id: string) => products.find(p => p.id === id);
  const getCustomerById = (id:string) => customers.find(c => c.id === id);
  const getCategoryNameById = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  // --- ASYNC DATA MODIFICATION FUNCTIONS ---

  const addProduct = async (productData: AddProductData): Promise<boolean> => {
    const result = await apiCall('addProduct', productData);
    if(result.status === 'success') {
      const newProduct: Product = result.data;
      setProducts(prev => [newProduct, ...prev]);
      return true;
    }
    return false;
  };
  
  const updateProduct = async (productData: Product): Promise<boolean> => {
    const result = await apiCall('updateProduct', productData);
    if(result.status === 'success') {
      const updatedProduct: Product = result.data;
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      return true;
    }
    return false;
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    const result = await apiCall('deleteProduct', { productId });
    if (result.status === 'success') {
      setProducts(prev => prev.filter(p => p.id !== productId));
      return true;
    }
    return false;
  };

  const toggleProductAvailability = async (productId: string): Promise<boolean> => {
    const productToUpdate = products.find(p => p.id === productId);
    if (!productToUpdate) return false;
    const newStatus = !(productToUpdate.isAvailable ?? true);

    const result = await apiCall('updateProductStatus', { id: productId, isAvailable: newStatus });
    if (result.status === 'success') {
      const updatedProduct: Product = result.data;
      setProducts(currentProducts => currentProducts.map(p => p.id === productId ? updatedProduct : p));
      return true;
    }
    return false;
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<boolean> => {
    const result = await apiCall('addExpense', expenseData);
     if(result.status === 'success') {
      const newExpense = { ...result.data, date: new Date(result.data.date) };
      setExpenses(prev => [newExpense, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
      return true;
    }
    return false;
  };
  
  const deleteExpense = async (expenseId: string): Promise<boolean> => {
    const result = await apiCall('deleteExpense', { expenseId });
    if(result.status === 'success') {
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      return true;
    }
    return false;
  };

  const addOrder = async (customerData: Omit<Customer, 'id'>, items: CartItem[]): Promise<boolean> => {
    const result = await apiCall('addOrder', { customerData, items });
    if(result.status === 'success') {
        const { newOrder, updatedCustomer } = result.data;

        // Update customer list
        const customerExists = customers.some(c => c.id === updatedCustomer.id);
        if (customerExists) {
            setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        } else {
            setCustomers(prev => [updatedCustomer, ...prev]);
        }
        
        // Add new order
        setOrders(prev => [{...newOrder, createdAt: new Date(newOrder.createdAt), totalPoints: newOrder.totalPoints || 0}, ...prev].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));

        return true;
    }
    return false;
  };

  const addCustomerSelection = async (selectionData: Omit<CustomerSelection, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    const result = await apiCall('addCustomerSelection', selectionData);
    if(result.status === 'success') {
      const newSelection = {...result.data, createdAt: new Date(result.data.createdAt) };
      setCustomerSelections(prev => [newSelection, ...prev].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
      return true;
    }
    return false;
  };
    
  const processSelection = async (selectionId: string): Promise<boolean> => {
    const result = await apiCall('processSelection', { selectionId });
    if(result.status === 'success') {
      setCustomerSelections(prev => prev.map(s => s.id === selectionId ? { ...s, status: 'processed' } : s));
      return true;
    }
    return false;
  };

  const runHealthCheck = async (): Promise<HealthCheckResult[]> => {
    const result = await apiCall('healthCheck', {});
    if (result.status === 'success') {
        return result.data as HealthCheckResult[];
    }
    return [{
        check: 'API Connection',
        status: 'error',
        details: apiError || 'Failed to connect to the Google Apps Script backend.'
    }];
  };


  return (
    <AppContext.Provider value={{
      products, orders, customers, expenses, customerSelections, categories, 
      addOrder, addProduct, updateProduct, deleteProduct, toggleProductAvailability, addExpense, deleteExpense, getProductById, getCustomerById, getCategoryNameById,
      addCustomerSelection, processSelection, settings, updateSettings, 
      t, formatCurrency, formatNumber, formatDate,
      isAuthenticated, login, logout,
      exchangeRate, isRateLoading, isLoading, isUpdating, apiError,
      runHealthCheck
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};