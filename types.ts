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
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email?: string;
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
  price: number; // Normal Price in ILS
  memberPrice: number; // Member Price in ILS
  imageUrl: string;
  isAvailable?: boolean;
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
    isProductPurchase?: boolean;
    productName?: string;
    quantityPurchased?: number;
    purchasePricePerItem?: number;
}

export interface CustomerSelection {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: CartItem[];
  createdAt: Date;
  status: 'pending' | 'processed';
}

export interface HealthCheckResult {
  check: string;
  status: 'success' | 'error';
  details: string;
}