
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { Product, Order, CartItem, Customer, AppSettings, Language, NumberFormat, Currency, Expense, CustomerSelection, Category, HealthCheckResult, Discount, OrderStatus } from '../types';
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
const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  currency: ILS_CURRENCY,
  numberFormat: 'en',
  theme: 'light',
  profitMarginILS: 20,
  discounts: [],
};

type AddProductData = Omit<Product, 'id' | 'isAvailable'>;

interface AppContextType {
  products: Product[];
  rawProducts: Product[]; // Expose raw products for base price calculations
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
  isRefreshing: boolean; // For manual data sync
  apiError: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<boolean>;
  removeDiscount: (productId: string) => void;
  t: (key: TranslationKeys) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
  formatInteger: (num: number) => string;
  formatDate: (date: Date) => string;
  formatDateTime: (date: Date) => string;
  addOrder: (customerData: Omit<Customer, 'id' | 'registrationDate'>, items: CartItem[], shippingCost: number, selectionId?: string | null) => Promise<boolean>;
  updateOrder: (order: Order, customer: Customer) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  addProduct: (productData: AddProductData) => Promise<boolean>;
  updateProduct: (productData: Product) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  toggleProductAvailability: (productId: string) => Promise<boolean>;
  toggleProductNewlyArrived: (productId: string) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  deleteCustomer: (customerId: string) => Promise<boolean>;
  addExpense: (expenseData: Omit<Expense, 'id' | 'date'> & { date: Date }) => Promise<boolean>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  addCustomerSelection: (selectionData: Omit<CustomerSelection, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  processSelection: (selectionId: string) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
  getOrderById: (id: string) => Order | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getCategoryNameById: (categoryId: string) => string;
  runHealthCheck: () => Promise<HealthCheckResult[]>;
  fetchData: (isInitialLoad?: boolean) => Promise<void>;
  bulkUpdateProductPrices: (payload: { productIds: string[]; updateType: 'profitMargin' | 'exchangeRate'; value: number }) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

const parseData = (data: any, productOrder: string[] = []) => {
  if (!data) return { products: [], orders: [], customers: [], expenses: [], customerSelections: [], categories: [], settings: DEFAULT_SETTINGS };

  function parseWithDates<T>(items: any[]): T[] {
    return items.map(item => ({
      ...item,
      ...(item.createdAt && { createdAt: new Date(item.createdAt) }),
      ...(item.date && { date: new Date(item.date) }),
      ...(item.registrationDate && { registrationDate: new Date(item.registrationDate) }),
      ...(item.status ? {} : { status: 'pending' }), // Default status for old orders
    }));
  };

  const ordersWithRecalculatedPoints = (data.orders || []).map((order: Order) => {
    // FIX: Recalculate totalPoints if it's missing or invalid in the sheet data.
    // This provides backward compatibility and ensures data integrity for reports.
    if (typeof order.totalPoints !== 'number' || isNaN(order.totalPoints)) {
      if (order.items && Array.isArray(order.items)) {
        order.totalPoints = order.items.reduce((sum, item) => sum + ((item.points || 0) * (item.quantity || 0)), 0);
      } else {
        order.totalPoints = 0;
      }
    }
    return order;
  });
  
  let parsedProducts: Product[] = data.products || [];

  if (productOrder.length > 0 && parsedProducts.length > 0) {
      const productMap = new Map(parsedProducts.map(p => [p.id, p]));
      const sortedProducts = productOrder
        .map(id => productMap.get(id))
        .filter((p): p is Product => p !== undefined);
      
      const productsInOrder = new Set(productOrder);
      const newProductsFromSheet = parsedProducts.filter(p => !productsInOrder.has(p.id));
      
      parsedProducts = [...sortedProducts, ...newProductsFromSheet];
  }

  return {
    products: parsedProducts,
    orders: (parseWithDates<Order>(ordersWithRecalculatedPoints)).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()),
    customers: parseWithDates<Customer>(data.customers || []),
    expenses: (parseWithDates<Expense>(data.expenses || [])).sort((a,b) => b.date.getTime() - a.date.getTime()),
    customerSelections: parseWithDates<CustomerSelection>(data.customerSelections || []),
    categories: data.categories || [],
    settings: data.settings ? { ...DEFAULT_SETTINGS, ...data.settings } : DEFAULT_SETTINGS,
  };
};

function saveLocalState<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error: any) {
    console.error(`Failed to save state to localStorage for key "${key}"`, error);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customerSelections, setCustomerSelections] = useState<CustomerSelection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load only theme and language from local storage for faster initial UI paint
    const savedTheme = loadLocalState('appTheme', 'dark');
    const savedLang = loadLocalState('appLang', 'ar');
    return { ...DEFAULT_SETTINGS, theme: savedTheme, language: savedLang };
  });

  const [newlyArrivedProductIds, setNewlyArrivedProductIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('dxnApp_newlyArrived');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error("Failed to parse newly arrived product IDs from localStorage", e);
      return new Set();
    }
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadLocalState('isAuthenticated', false));
  const [exchangeRate, setExchangeRate] = useState<number>(FALLBACK_USD_TO_ILS_RATE);
  const [isRateLoading, setIsRateLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Memoize products to dynamically apply profit margin and discounts from settings
  const products = useMemo(() => {
    const profitMargin = settings.profitMarginILS || 0;
    const discounts = settings.discounts || [];
    const globalDiscount = discounts.find(d => d.productId === 'ALL');

    return rawProducts.map(p => {
      const priceWithMargin = p.price + profitMargin;
      const memberPriceWithMargin = p.memberPrice + profitMargin;

      let finalPrice = priceWithMargin;
      let finalMemberPrice = memberPriceWithMargin;
      let originalPrice: number | undefined = undefined;
      let originalMemberPrice: number | undefined = undefined;
      let discountPercentage: number | undefined = undefined;

      const productDiscount = discounts.find(d => d.productId === p.id);
      const applicableDiscount = productDiscount || globalDiscount;

      if (applicableDiscount && applicableDiscount.percentage > 0) {
        discountPercentage = applicableDiscount.percentage;
        originalPrice = priceWithMargin;
        originalMemberPrice = memberPriceWithMargin;

        const discountMultiplier = 1 - (discountPercentage / 100);
        finalPrice = priceWithMargin * discountMultiplier;
        finalMemberPrice = memberPriceWithMargin * discountMultiplier;
      }

      const isNewlyArrived = newlyArrivedProductIds.has(p.id);

      return {
        ...p,
        price: finalPrice,
        memberPrice: finalMemberPrice,
        originalPrice,
        originalMemberPrice,
        discountPercentage,
        isNewlyArrived,
      };
    });
  }, [rawProducts, settings.profitMarginILS, settings.discounts, newlyArrivedProductIds]);

  const callGoogleScript = useCallback(async (action: string, payload?: any, returnFullResponse = false) => {
    setApiError(null);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        redirect: "follow",
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, payload }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text) {
          throw new Error('Received an empty response from the server.');
      }

      const result = JSON.parse(text);
      
      if (result.status === 'error') {
        throw new Error(result.message || 'An unknown API error occurred');
      }

      return returnFullResponse ? result : result.data;
    } catch (error: any) {
      console.error(`Google Script API call failed for action "${action}":`, error);
      let errorMessage = 'Failed to communicate with the server.';
       if (error.message.includes('Failed to fetch')) {
        errorMessage = `Network error or CORS issue. Please check your internet connection and ensure the Google Apps Script is deployed correctly with "Anyone" access. Error: ${error.message}`;
      } else if (error.message.includes('JSON.parse')) {
        errorMessage = 'Failed to parse server response. The response may not be valid JSON.';
      } else {
        errorMessage = error.message;
      }
      setApiError(errorMessage);
      return null;
    }
  }, []);
  
  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    else setIsRefreshing(true);

    const data = await callGoogleScript('getAllData');
    if (data) {
      let productOrder: string[] = [];
      try {
        const savedOrder = localStorage.getItem('dxnApp_productOrder');
        if (savedOrder) {
          productOrder = JSON.parse(savedOrder);
        }
      } catch (e) {
        console.error("Failed to parse product order from localStorage", e);
      }

      const parsed = parseData(data, productOrder);
      setRawProducts(parsed.products);
      setOrders(parsed.orders);
      setCustomers(parsed.customers);
      setExpenses(parsed.expenses);
      setCustomerSelections(parsed.customerSelections);
      setCategories(parsed.categories);
      setSettings(parsed.settings);
    }
    if (isInitialLoad) setIsLoading(false);
    else setIsRefreshing(false);
  }, [callGoogleScript]);
  
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);
  
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
  }, [callGoogleScript]);

  useEffect(() => {
    const root = document.documentElement;
    
    // Language and Direction
    root.lang = settings.language;
    root.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.title = 'DXN App';
    saveLocalState('appLang', settings.language);
    
    // Theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveLocalState('appTheme', settings.theme);

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

  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<boolean> => {
    const originalSettings = settings;
    const updatedSettingsData = { ...settings, ...newSettings };

    // Optimistically update the UI
    setSettings(updatedSettingsData);
    setIsUpdating(true); // Still indicate background activity

    const result = await callGoogleScript('updateSettings', updatedSettingsData);
    
    setIsUpdating(false);
    if (result) {
        // API call succeeded, update with the confirmed data from the server
        setSettings(result);
        return true;
    } else {
        // API call failed, roll back to the original state
        setSettings(originalSettings);
        // The error will be shown via apiError state
        return false;
    }
  };

  const removeDiscount = (productIdToDelete: string) => {
    const updatedDiscounts = (settings.discounts || []).filter(d => d.productId !== productIdToDelete);
    updateSettings({ discounts: updatedDiscounts });
  };

  const t = (key: TranslationKeys): string => {
    return translations[settings.language][key] || key;
  };

  const formatNumber = (num: number): string => {
    if (settings.numberFormat === 'ar') {
      return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    }
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const formatInteger = (num: number): string => {
    const options: Intl.NumberFormatOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };
    if (settings.numberFormat === 'ar') {
        return new Intl.NumberFormat('ar-EG', options).format(num);
    }
    return new Intl.NumberFormat('en-US', options).format(num);
  };

  const formatCurrency = (amount: number): string => {
    const roundedAmount = Math.round(amount * 10) / 10;
    const isInteger = roundedAmount % 1 === 0;

    const formattedAmount = isInteger 
      ? formatInteger(roundedAmount) 
      : formatNumber(roundedAmount);
    
    if (settings.language === 'ar') {
       return `${formattedAmount} ${settings.currency.symbol}`;
    }
    return `${settings.currency.symbol}${formattedAmount}`;
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

  const formatDateTime = (date: Date): string => {
    const langLocale = settings.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Date(date).toLocaleString(langLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory',
      numberingSystem: settings.numberFormat === 'ar' ? 'arab' : 'latn',
    });
  }
  
  const addOrder = async (customerData: Omit<Customer, 'id' | 'registrationDate'>, items: CartItem[], shippingCost: number, selectionId: string | null = null) => {
    setIsUpdating(true);
    const result = await callGoogleScript('addOrder', { customerData, items, shippingCost, selectionId });
    setIsUpdating(false);
    if (result) {
        const newOrderWithDate = { ...result.newOrder, createdAt: new Date(result.newOrder.createdAt) };
        setOrders(prev => [newOrderWithDate, ...prev].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
        setCustomers(prev => {
            const index = prev.findIndex(c => c.id === result.updatedCustomer.id);
            const updatedCustomerWithDate = {
              ...result.updatedCustomer,
              registrationDate: new Date(result.updatedCustomer.registrationDate),
            };
            if (index > -1) {
                const newCustomers = [...prev];
                newCustomers[index] = updatedCustomerWithDate;
                return newCustomers;
            } else {
                return [...prev, updatedCustomerWithDate];
            }
        });
        
        if (selectionId && result.processedSelectionId === selectionId) {
            setCustomerSelections(prev => prev.map(s => 
                s.id === selectionId ? { ...s, status: 'processed' } : s
            ));
        }

        return true;
    }
    return false;
  };

  const updateOrder = async (orderData: Order, customerData: Customer): Promise<boolean> => {
    setIsUpdating(true);
    const result = await callGoogleScript('updateOrder', { order: orderData, customer: customerData });
    setIsUpdating(false);
    if (result) {
        const updatedOrderWithDate = { ...result.updatedOrder, createdAt: new Date(result.updatedOrder.createdAt) };
        setOrders(prev => prev.map(o => o.id === updatedOrderWithDate.id ? updatedOrderWithDate : o));
        
        const updatedCustomerWithDate = { ...result.updatedCustomer, registrationDate: new Date(result.updatedCustomer.registrationDate) };
        setCustomers(prev => prev.map(c => c.id === updatedCustomerWithDate.id ? updatedCustomerWithDate : c));
        
        return true;
    }
    return false;
  };
  
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    const originalOrders = orders;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    
    const result = await callGoogleScript('updateOrderStatus', { orderId, status });

    if (result) {
        return true;
    } else {
        setOrders(originalOrders);
        return false;
    }
  };

  const addProduct = async (productData: AddProductData) => {
    setIsUpdating(true);
    const newProduct = await callGoogleScript('addProduct', productData);
    setIsUpdating(false);
    if (newProduct) {
        setRawProducts(prev => [...prev, newProduct]);
        return true;
    }
    return false;
  };
  
  const updateProduct = async (productData: Product) => {
    setIsUpdating(true);
    const updatedProduct = await callGoogleScript('updateProduct', productData);
    setIsUpdating(false);
    if (updatedProduct) {
        setRawProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        return true;
    }
    return false;
  };

  const bulkUpdateProductPrices = async (payload: { productIds: string[]; updateType: 'profitMargin' | 'exchangeRate'; value: number }) => {
    setIsUpdating(true);
    const updatedProductsList: Product[] = await callGoogleScript('bulkUpdateProductPrices', payload);
    setIsUpdating(false);

    if (updatedProductsList) {
        setRawProducts(prev => {
            const updatedProductsMap = new Map(updatedProductsList.map(p => [p.id, p]));
            return prev.map(p => updatedProductsMap.get(p.id) || p);
        });
        return true;
    }
    return false;
  };

  const deleteProduct = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    const originalProducts = rawProducts;
    
    // Optimistically update the UI by removing the product
    setRawProducts(prev => prev.filter(p => p.id !== productId));
    setIsUpdating(true); // Indicate background activity

    const result = await callGoogleScript('deleteProduct', { productId }, true);
    
    setIsUpdating(false);
    if (result && result.status === 'success') {
        // API call succeeded, UI is already correct
        return { success: true };
    } else {
        // API call failed, roll back
        setRawProducts(originalProducts);
        return { success: false, error: apiError || 'Failed to delete product.' };
    }
  };


  const toggleProductAvailability = async (productId: string) => {
    setIsUpdating(true);
    const productBeforeToggle = rawProducts.find(p => p.id === productId);

    const result = await callGoogleScript('toggleProductAvailability', { productId });
    setIsUpdating(false);
    if (result) {
        setRawProducts(prev => {
            const productToUpdate = prev.find(p => p.id === result.productId);
            if (!productToUpdate) return prev;

            const updatedProduct = { ...productToUpdate, isAvailable: result.isAvailable };
            
            let newProductList = [...prev];

            // If product is now available AND it was previously unavailable
            if (result.isAvailable && productBeforeToggle && !productBeforeToggle.isAvailable) {
                // Move it to the end of the list.
                newProductList = prev.filter(p => p.id !== result.productId);
                newProductList.push(updatedProduct);
            } else {
                // Otherwise, just update it in its place.
                newProductList = prev.map(p => p.id === result.productId ? updatedProduct : p);
            }
            
            // Save the new order to localStorage
            try {
                const productOrder = newProductList.map(p => p.id);
                localStorage.setItem('dxnApp_productOrder', JSON.stringify(productOrder));
            } catch (e) {
                console.error("Failed to save product order to localStorage", e);
            }

            return newProductList;
        });
        return true;
    }
    return false;
  };

  const toggleProductNewlyArrived = async (productId: string) => {
    setNewlyArrivedProductIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(productId)) {
        newIds.delete(productId);
      } else {
        newIds.add(productId);
      }
      try {
        localStorage.setItem('dxnApp_newlyArrived', JSON.stringify(Array.from(newIds)));
      } catch (e) {
        console.error("Failed to save newly arrived product IDs to localStorage", e);
      }
      return newIds;
    });
    return Promise.resolve(true);
  };

  const deleteOrder = async (orderId: string) => {
    setIsUpdating(true);
    const result = await callGoogleScript('deleteOrder', { orderId });
    setIsUpdating(false);
    if (result) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        return true;
    }
    return false;
  }

  const deleteCustomer = async (customerId: string) => {
    setIsUpdating(true);
    const result = await callGoogleScript('deleteCustomer', { customerId });
    setIsUpdating(false);
    if (result) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        setOrders(prev => prev.filter(o => o.customerId !== customerId)); // Also remove their orders from local state
        return true;
    }
    return false;
  }

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'date'> & { date: Date }) => {
    setIsUpdating(true);
    const newExpense = await callGoogleScript('addExpense', expenseData);
    setIsUpdating(false);
    if (newExpense) {
        const newExpenseWithDate = { ...newExpense, date: new Date(newExpense.date) };
        setExpenses(prev => [...prev, newExpenseWithDate].sort((a, b) => b.date.getTime() - a.date.getTime()));
        return true;
    }
    return false;
  };
  
  const deleteExpense = async (expenseId: string) => {
    setIsUpdating(true);
    const result = await callGoogleScript('deleteExpense', { expenseId });
    setIsUpdating(false);
    if (result) {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
        return true;
    }
    return false;
  };
  
  const addCustomerSelection = async (selectionData: Omit<CustomerSelection, 'id' | 'createdAt' | 'status'>) => {
    setIsUpdating(true);
    const result = await callGoogleScript('addCustomerSelection', selectionData);
    setIsUpdating(false);
    // No optimistic update needed here as it navigates to a success page.
    return result !== null;
  };
  
  const processSelection = async (selectionId: string) => {
    setIsUpdating(true);
    const result = await callGoogleScript('processSelection', { selectionId });
    setIsUpdating(false);
    if (result) {
        setCustomerSelections(prev => prev.map(s => s.id === selectionId ? { ...s, status: 'processed' } : s));
        return true;
    }
    return false;
  };
  
  const runHealthCheck = async (): Promise<HealthCheckResult[]> => {
    const data = await callGoogleScript('runHealthCheck');
    return data || [];
  };
  
  const getProductById = (id: string): Product | undefined => products.find(p => p.id === id);
  const getOrderById = (id: string): Order | undefined => orders.find(o => o.id === id);
  const getCustomerById = (id: string): Customer | undefined => customers.find(c => c.id === id);
  const getCategoryNameById = (categoryId: string): string => categories.find(c => c.id === categoryId)?.name || categoryId;

  const contextValue: AppContextType = {
    products,
    rawProducts,
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
    isRefreshing,
    apiError,
    login,
    logout,
    updateSettings,
    removeDiscount,
    t,
    formatCurrency,
    formatNumber,
    formatInteger,
    formatDate,
    formatDateTime,
    addOrder,
    updateOrder,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    toggleProductNewlyArrived,
    deleteOrder,
    deleteCustomer,
    addExpense,
    deleteExpense,
    addCustomerSelection,
    processSelection,
    getProductById,
    getOrderById,
    getCustomerById,
    getCategoryNameById,
    runHealthCheck,
    fetchData,
    bulkUpdateProductPrices,
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
