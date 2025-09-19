


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CartItem, Product, Customer, CustomerSelection } from '../types';

const ProductSelectionCard: React.FC<{ product: Product, onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => {
    const { t, formatCurrency, getCategoryNameById } = useAppContext();
    const isAvailable = product.isAvailable ?? true;

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${!isAvailable ? 'opacity-60' : ''}`}>
            <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 relative">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
              {!isAvailable && (
                <div className="absolute inset-0 bg-slate-400/50 dark:bg-slate-800/60 flex items-center justify-center">
                    <span className="px-3 py-1 bg-red-500 text-white font-bold rounded-full text-sm">{t('unavailable')}</span>
                </div>
              )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white text-right">{product.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-right">{getCategoryNameById(product.categoryId)}</p>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(product.price)}</p>
                </div>
                <button 
                    onClick={() => onAddToCart(product)}
                    disabled={!isAvailable}
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    {t('addToCart')}
                </button>
            </div>
        </div>
    );
};


const NewOrderPage: React.FC = () => {    
  const { products, addOrder, t, formatCurrency, isUpdating } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const selection: CustomerSelection | undefined = location.state?.selection;

  const [customerData, setCustomerData] = useState({
      name: '',
      address: '',
      phone: '',
      whatsapp: '',
      email: ''
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [cameFromSelection, setCameFromSelection] = useState(false);

  useEffect(() => {
    if (selection) {
        setCameFromSelection(true);
        setCustomerData({
            name: selection.customerName,
            phone: selection.customerPhone,
            whatsapp: selection.customerPhone,
            address: '', // Address is not in selection
            email: selection.customerEmail || ''
        });
        setCart(selection.items);
        // Clear state from location to avoid re-populating on refresh
        navigate('.', { state: {}, replace: true }); 
    }
  }, [selection, navigate]);

  const handleCustomerDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCustomerData({
          ...customerData,
          [e.target.name]: e.target.value
      });
  };

  const addToCart = (product: Product) => {
    if (!(product.isAvailable ?? true)) return; // Do not add unavailable products
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
        updateQuantity(product.id, existingItem.quantity + 1);
    } else {
        setCart([...cart, { 
            productId: product.id, 
            name: product.name, 
            price: product.price, // Using the normal price for orders
            quantity: 1, 
            points: product.points || 0,
        }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
        setCart(cart.filter(item => item.productId !== productId));
    } else {
        setCart(cart.map(item => item.productId === productId ? { ...item, quantity } : item));
    }
  };
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name.trim() || !customerData.phone.toString().trim()) {
        setError(t('errorCustomerNamePhone'));
        return;
    }
    if (cart.length === 0) {
        setError(t('errorAddProductsToInvoice'));
        return;
    }
    setError('');

    const customerToAdd: Omit<Customer, 'id'> = {
        name: customerData.name,
        address: customerData.address,
        phone: customerData.phone,
        whatsapp: customerData.whatsapp || customerData.phone,
        email: customerData.email,
    };

    const success = await addOrder(customerToAdd, cart);
    
    if (success) {
      if (cameFromSelection) {
          navigate('/admin/customer-selections');
      } else {
          navigate('/admin/orders');
      }
    } else {
      setError("فشل إنشاء الفاتورة. يرجى المحاولة مرة أخرى.");
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold mb-2">{t('createNewInvoice')}</h1>
        <p className="text-slate-500 mb-6">{t('selectProductsToAdd')}</p>
        <input
          type="text"
          placeholder={t('searchForProduct')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-3 mb-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(p => <ProductSelectionCard key={p.id} product={p} onAddToCart={addToCart} />)}
        </div>
      </div>

      <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col max-h-[calc(100vh-8rem)]">
          {/* Header - Not scrollable */}
          <div className="p-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-bold border-b pb-4 border-slate-200 dark:border-slate-700">{t('invoiceSummary')}</h2>
          </div>
          
          {/* Scrollable content area */}
          <div className="px-6 overflow-y-auto flex-grow">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('customerInfo')}</h3>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('customerName')}</label>
                <input type="text" name="name" id="name" value={customerData.name} onChange={handleCustomerDataChange} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500" required />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('phoneNumber')}</label>
                <input type="tel" name="phone" id="phone" value={customerData.phone} onChange={handleCustomerDataChange} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500" required />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('whatsappOptional')}</label>
                <input type="tel" name="whatsapp" id="whatsapp" value={customerData.whatsapp} onChange={handleCustomerDataChange} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('emailOptional')}</label>
                <input type="email" name="email" id="email" value={customerData.email} onChange={handleCustomerDataChange} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500" />
              </div>
               <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('addressOptional')}</label>
                <textarea name="address" id="address" value={customerData.address} onChange={handleCustomerDataChange} rows={2} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500" />
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
              {cart.length > 0 ? cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateQuantity(item.productId, parseInt(e.target.value, 10))}
                      className="w-16 p-1 text-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-500 py-8">{t('cartIsEmpty')}</p>
              )}
            </div>
          </div>
          
          {/* Footer - Not scrollable */}
          <div className="p-6 pt-4 mt-auto border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            {cart.length > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>{t('total')}</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isUpdating || cart.length === 0 || !customerData.name || !customerData.phone}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'جاري الإنشاء...' : t('confirmAndCreateInvoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrderPage;