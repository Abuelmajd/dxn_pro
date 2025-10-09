export type Language = 'ar' | 'en';
export type NumberFormat = 'ar' | 'en';

export interface Currency {
  code: 'SAR' | 'ILS' | 'USD' | 'EUR';
  symbol: string;
}

export interface Discount {
  productId: string; // 'ALL' for a global discount
  percentage: number;
}

export interface AppSettings {
  language: Language;
  currency: Currency;
  numberFormat: NumberFormat;
  theme: 'light' | 'dark';
  profitMarginILS: number;
  discounts: Discount[];
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
  price: number; // Final price (after profit margin and discount)
  memberPrice: number; // Final member price (after profit margin and discount)
  normalPriceUSD: number; // Base Normal Price in USD (without $0.50 margin)
  memberPriceUSD: number; // Base Member Price in USD (without $0.50 margin)
  imageUrl: string;
  isAvailable: boolean;
  points: number;
  originalPrice?: number; // Original price before discount
  originalMemberPrice?: number; // Original member price before discount
  discountPercentage?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number; // The final price for this item in the cart
  quantity: number;
  points: number;
  originalPrice?: number; // The price before any discount was applied for this transaction
  appliedDiscountPercentage?: number; // The discount % that was available
}

// FIX: Completed the Order interface and added createdAt property
export interface Order {
  id: string;
  customerId: string;
  customerName: string; // Kept for display convenience
  items: CartItem[];
  totalPrice: number;
  totalPoints: number;
  createdAt: Date;
}

// FIX: Added missing Expense type definition
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  isProductPurchase?: boolean;
  quantityPurchased?: number;
  purchasePricePerItem?: number;
}

// FIX: Added missing CustomerSelection type definition
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

// FIX: Added missing HealthCheckResult type definition
export interface HealthCheckResult {
  check: string;
  status: 'success' | 'error';
  details: string;
}