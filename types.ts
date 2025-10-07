export type Language = 'ar' | 'en';
export type NumberFormat = 'ar' | 'en';

export interface Currency {
  code: 'SAR' | 'ILS' | 'USD' | 'EUR';
  symbol: string;
}

export interface AppSettings {
  language: Language;
  currency: Currency;
  numberFormat: NumberFormat;
  theme: 'light' | 'dark';
  profitMarginILS: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  registrationDate: Date;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number; // Base Normal Price in ILS (without profit margin)
  memberPrice: number; // Base Member Price in ILS (without profit margin)
  normalPriceUSD: number; // Base Normal Price in USD (without $0.50 margin)
  memberPriceUSD: number; // Base Member Price in USD (without $0.50 margin)
  imageUrl: string;
  isAvailable: boolean;
  points: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  points: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string; // Kept for display convenience
  items: CartItem[];
  totalPrice: number;
  totalPoints: number;
  createdAt: Date;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: Date;
    // Fix: Add optional properties for product purchase expenses to resolve type errors in ExpensesPage.
    isProductPurchase?: boolean;
    quantityPurchased?: number;
    purchasePricePerItem?: number;
}

export interface CustomerSelection {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: CartItem[];
  createdAt: Date;
  status: 'pending' | 'processed';
}

export interface HealthCheckResult {
  check: string;
  status: 'success' | 'error';
  details: string;
}
