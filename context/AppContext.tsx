import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, Order, CartItem, Customer, AppSettings, Language, NumberFormat, Currency, Expense, CustomerSelection, Category, HealthCheckResult } from '../types';
import { translations, TranslationKeys } from '../translations';

// ================================================================================================
// =================================== خطوة هامة جداً ============================================
//
//               الرجاء لصق رابط الـ WEB APP الذي نسخته من GOOGLE APPS SCRIPT هنا
//
// ================================================================================================
const GOOGLE_SCRIPT_URL: string = 'https://script.google.com/macros/s/AKfycbxJWDL09TAfVeWmpANJj4Dyk-u2h4eedogMNSyj-GaraxPsqIXF2IoGt0ilkhmfNcPjzw/exec';
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
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
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

// FIX: Changed generic arrow function to a function declaration to avoid TSX parsing ambiguity.
function loadLocalState<T>(key: string, defaultValue: T): T {
  try {
    const savedState = localStorage.getItem(key);
    if (!savedState) return defaultValue;
    
    // Custom reviver for dates
    const reviver = (k: string, v: any) => {
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
        return new Date(v);
      }
      return v;
    };

    return JSON.parse(savedState, reviver);
  } catch (error: any) {
    console.error(`Failed to parse state from localStorage for key "${key}"`, error);
    return defaultValue;
  }
};

const parseData = (data: any) => {
  if (!data) return { products: [], orders: [], customers: [], expenses: [], customerSelections: [], categories: [] };

  // FIX: Changed generic arrow function to a function declaration to avoid TSX parsing ambiguity.
  function parseWithDates<T>(items: any[]): T[] {
    return items.map(item => ({
      ...item,
      ...(item.createdAt && { createdAt: new Date(item.createdAt) }),
      ...(item.date && { date: new Date(item.date) }),
    }));
  };
  
  return {
    products: data.products || [],
    orders: (parseWithDates<Order>(data.orders || [])).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()),
    customers: data.customers || [],
    expenses: (parseWithDates<Expense>(data.expenses || [])).sort((a,b) => b.date.getTime() - a.date.getTime()),
    customerSelections: parseWithDates<CustomerSelection>(data.customerSelections || []),
    categories: data.categories || [],
  };
};

// FIX: Changed generic arrow function to a function declaration to avoid TSX parsing ambiguity.
function saveLocalState<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error: any) {
    console.error(`Failed to save state to localStorage for key "${key}"`, error);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customerSelections, setCustomerSelections] = useState<CustomerSelection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>(() => loadLocalState('appSettings', {
    language: 'ar',
    currency: ILS_CURRENCY,
    numberFormat: 'ar',
    // FIX: Add default theme to AppSettings.
    theme: 'dark',
  }));
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadLocalState('isAuthenticated', false));
  const [exchangeRate, setExchangeRate] = useState<number>(FALLBACK_USD_TO_ILS_RATE);
  const [isRateLoading, setIsRateLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const callGoogleScript = async (action: string, payload?: any) => {
    setApiError(null);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        redirect: "follow",
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, payload }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'An unknown API error occurred');
      }

      return result.data;
    } catch (error: any) {
      console.error('Google Script API call failed:', error);
      setApiError(error.message || 'Failed to communicate with the server.');
      return null;
    }
  };
  
  const fetchData = async () => {
    setIsLoading(true);
    const data = await callGoogleScript('getAllData');
    if (data) {
      const parsed = parseData(data);
      setProducts(parsed.products);
      setOrders(parsed.orders);
      setCustomers(parsed.customers);
      setExpenses(parsed.expenses);
      setCustomerSelections(parsed.customerSelections);
      setCategories(parsed.categories);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    const fetchRate = async () => {
      setIsRateLoading(true);
      const data = await callGoogleScript('getExchangeRate');
      if (data && data.rate) {
        setExchangeRate(data.rate);
      } else {
        setExchangeRate(FALLBACK_USD_TO_ILS_RATE); // fallback
      }
      setIsRateLoading(false);
    };
    fetchRate();
  }, []);

  useEffect(() => {
    saveLocalState('appSettings', settings);
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    
    // Language and Direction
    root.lang = settings.language;
    root.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.title = 'DXN App';
    
    // Theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.language, settings.theme]);

  useEffect(() => {
    saveLocalState('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  const login = (username: string, password: string): boolean => {
    // This is a simplified, insecure login. In a real app, this would be an API call.
    if (username === 'admin' && password === 'amdxn') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const t = (key: TranslationKeys): string => {
    return translations[settings.language][key] || key;
  };

  const formatNumber = (num: number): string => {
    if (settings.numberFormat === 'ar') {
      return new Intl.NumberFormat('ar-EG').format(num);
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number): string => {
    if (settings.language === 'ar') {
       return `${formatNumber(amount)} ${settings.currency.symbol}`;
    }
    return `${settings.currency.symbol}${formatNumber(amount)}`;
  };
  
  const formatDate = (date: Date): string => {
    const langLocale = settings.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Date(date).toLocaleDateString(langLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory',
      numberingSystem: settings.numberFormat === 'ar' ? 'arab' : 'latn',
    });
  }
  
  const handleGenericUpdate = async (action: string, payload: any, dataToRefetch: ('products'|'orders'|'customers'|'expenses'|'customerSelections')[] = []) => {
    setIsUpdating(true);
    const result = await callGoogleScript(action, payload);
    if (result) {
      // Refetch data to ensure UI is up-to-date
      await fetchData(); 
    }
    setIsUpdating(false);
    return !!result;
  }
  
  const addOrder = async (customerData: Omit<Customer, 'id'>, items: CartItem[]) => {
    return handleGenericUpdate('addOrder', { customerData, items }, ['orders', 'customers']);
  };

  const addProduct = async (productData: AddProductData) => {
    return handleGenericUpdate('addProduct', productData, ['products']);
  };
  
  const updateProduct = async (productData: Product) => {
    return handleGenericUpdate('updateProduct', productData, ['products']);
  };

  const deleteProduct = async (productId: string) => {
    setIsUpdating(true);
    const result = await callGoogleScript('deleteProduct', { productId });
    if (result) {
        await fetchData();
    }
    setIsUpdating(false);
    return { success: !!result, error: result?.error };
  };

  const toggleProductAvailability = async (productId: string) => {
    return handleGenericUpdate('toggleProductAvailability', { productId }, ['products']);
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'date'> & { date: Date }) => {
    return handleGenericUpdate('addExpense', expenseData, ['expenses']);
  };
  
  const deleteExpense = async (expenseId: string) => {
    return handleGenericUpdate('deleteExpense', { expenseId }, ['expenses']);
  };
  
  const addCustomerSelection = async (selectionData: Omit<CustomerSelection, 'id' | 'createdAt' | 'status'>) => {
     return handleGenericUpdate('addCustomerSelection', selectionData, ['customerSelections']);
  };
  
  const processSelection = async (selectionId: string) => {
    return handleGenericUpdate('processSelection', { selectionId }, ['customerSelections']);
  };
  
  const runHealthCheck = async (): Promise<HealthCheckResult[]> => {
    const data = await callGoogleScript('runHealthCheck');
    return data || [];
  };
  
  const getProductById = (id: string): Product | undefined => products.find(p => p.id === id);
  const getCustomerById = (id: string): Customer | undefined => customers.find(c => c.id === id);
  const getCategoryNameById = (categoryId: string): string => categories.find(c => c.id === categoryId)?.name || categoryId;

  const contextValue: AppContextType = {
    products,
    orders,
    customers,
    expenses,
    customerSelections,
    categories,
    settings,
    isAuthenticated,
    exchangeRate,
    isRateLoading,
    isLoading,
    isUpdating,
    apiError,
    login,
    logout,
    updateSettings,
    t,
    formatCurrency,
    formatNumber,
    formatDate,
    addOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    addExpense,
    deleteExpense,
    addCustomerSelection,
    processSelection,
    getProductById,
    getCustomerById,
    getCategoryNameById,
    runHealthCheck,
  };

  return (
    <AppContext.Provider value={contextValue}>
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