import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CartItem, Product, Customer, CustomerSelection } from '../types';
import ButtonSpinner from '../components/ButtonSpinner';

const ProductSelectionCard: React.FC<{ product: Product, onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => {
    const { t, formatCurrency, getCategoryNameById } = useAppContext();
    const isAvailable = product.isAvailable ?? true;

    return (
        <div className={`bg-card rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${!isAvailable ? 'opacity-60' : ''}`}>
            <div className="w-full h-32 bg-background/50 relative">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
              {!isAvailable && (
                <div className="absolute inset-0 bg-card/60 flex items-center justify-center">
                    <span className="px-3 py-1 bg-red-500 text-white font-bold rounded-full text-sm">{t('unavailable')}</span>
                </div>
              )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg text-text-primary text-right">{product.name}</h3>
                <p className="text-sm text-text-secondary text-right">{getCategoryNameById(product.categoryId)}</p>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-lg font-semibold text-text-primary">{formatCurrency(product.price)}</p>
                </div>
                <button 
                    onClick={() => onAddToCart(product)}
                    disabled={!isAvailable}
                    className="mt-4 w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-hover disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    {t('addToCart')}
                </button>
            </div>
        </div>
    );
};


const NewOrderPage: React.FC = () => {    
  const { products, categories, customers, addOrder, t, formatCurrency, isUpdating } = useAppContext();
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
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [error, setError] = useState('');
  const [cameFromSelection, setCameFromSelection] = useState(false);
  const [originalSelectionId, setOriginalSelectionId] = useState<string | null>(null);

  useEffect(() => {
    if (selection) {
        setCameFromSelection(true);
        setOriginalSelectionId(selection.id);

        // Find if this customer already exists in the main customer list
        const existingCustomer = customers.find(c => c.phone === selection.customerPhone);

        // Use existing customer data if available, otherwise fall back to selection data
        setCustomerData({
            name: existingCustomer?.name || selection.customerName,
            phone: existingCustomer?.phone || selection.customerPhone,
            whatsapp: existingCustomer?.whatsapp || selection.customerPhone,
            address: existingCustomer?.address || selection.customerAddress,
            email: existingCustomer?.email || selection.customerEmail
        });
        
        setCart(selection.items);
        
        // Clear state from location to avoid re-populating on refresh
        navigate('.', { state: {}, replace: true }); 
    }
  }, [selection, navigate, customers]);

  const handleCustomerDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'whatsapp') {
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length <= 10) {
            setCustomerData({
                ...customerData,
                [name]: numericValue
            });
        }
    } else {
        setCustomerData({
            ...customerData,
            [name]: value
        });
    }
  };

  const addToCart = (product: Product) => {
    if (!product.isAvailable) return; // Do not add unavailable products
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
        updateQuantity(product.id, existingItem.quantity + 1);
    } else {
        setCart([...cart, { 
            productId: product.id, 
            name: product.name, 
            price: product.price, // Using the normal price for orders
            quantity: 1, 
            points: product.points,
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
    if (!customerData.name.trim() || !customerData.phone.trim() || !customerData.whatsapp.trim() || !customerData.email.trim() || !customerData.address.trim()) {
        setError(t('errorFillAllFields'));
        return;
    }
    if (cart.length === 0) {
        setError(t('errorAddProductsToInvoice'));
        return;
    }
    setError('');

    const customerToAdd: Omit<Customer, 'id' | 'registrationDate'> = {
        name: customerData.name,
        address: customerData.address,
        phone: customerData.phone,
        whatsapp: customerData.whatsapp,
        email: customerData.email,
    };

    const success = await addOrder(customerToAdd, cart, originalSelectionId);
    
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

  const filteredProducts = products.filter(p => {
    const nameMatch = String(p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = !selectedCategoryId || p.categoryId === selectedCategoryId;
    return nameMatch && categoryMatch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold mb-2 text-text-primary">{t('createNewInvoice')}</h1>
        <p className="text-text-secondary mb-6">{t('selectProductsToAdd')}</p>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder={t('searchForProduct')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-grow p-3 bg-card rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
          />
          <select
            value={selectedCategoryId}
            onChange={e => setSelectedCategoryId(e.target.value)}
            className="sm:w-1/3 p-3 bg-card rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(p => <ProductSelectionCard key={p.id} product={p} onAddToCart={addToCart} />)}
        </div>
      </div>

      <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-lg flex flex-col max-h-[calc(100vh-8rem)]">
          {/* Header - Not scrollable */}
          <div className="p-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-bold border-b pb-4 border-border">{t('invoiceSummary')}</h2>
          </div>
          
          {/* Scrollable content area */}
          <div className="px-6 overflow-y-auto flex-grow">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">{t('customerInfo')}</h3>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">{t('customerName')}</label>
                <input type="text" name="name" id="name" value={customerData.name} onChange={handleCustomerDataChange} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent" required />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">{t('phoneNumber')}</label>
                <input type="tel" name="phone" id="phone" value={customerData.phone} onChange={handleCustomerDataChange} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent" required pattern="[0-9]{10}" title={t('phone_10_digits_error')} placeholder="05..." />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-text-primary mb-1">{t('whatsappOptional')}</label>
                <input type="tel" name="whatsapp" id="whatsapp" value={customerData.whatsapp} onChange={handleCustomerDataChange} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent" required pattern="[0-9]{10}" title={t('phone_10_digits_error')} placeholder="05..." />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">{t('emailOptional')}</label>
                <input type="email" name="email" id="email" value={customerData.email} onChange={handleCustomerDataChange} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent" required title={t('email_invalid_error')} />
              </div>
               <div>
                <label htmlFor="address" className="block text-sm font-medium text-text-primary mb-1">{t('addressOptional')}</label>
                <textarea name="address" id="address" value={customerData.address} onChange={handleCustomerDataChange} rows={2} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent" required />
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4 mt-4">
              {cart.length > 0 ? cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-text-primary">{item.name}</p>
                    <p className="text-sm text-text-secondary">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateQuantity(item.productId, parseInt(e.target.value, 10))}
                      className="w-16 p-1 text-center rounded-md border border-border bg-input-bg"
                    />
                  </div>
                </div>
              )) : (
                <p className="text-center text-text-secondary py-8">{t('cartIsEmpty')}</p>
              )}
            </div>
          </div>
          
          {/* Footer - Not scrollable */}
          <div className="p-6 pt-4 mt-auto border-t border-border flex-shrink-0">
            {cart.length > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-text-primary">{t('total')}</span>
                        <span className="text-text-primary">{formatCurrency(total)}</span>
                    </div>
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isUpdating || cart.length === 0 || !customerData.name || !customerData.phone}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-hover disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isUpdating ? <><ButtonSpinner /> {t('creatingInvoice')}</> : t('confirmAndCreateInvoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrderPage;