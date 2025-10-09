import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CartItem, Product, Customer, CustomerSelection } from '../types';
import ButtonSpinner from '../components/ButtonSpinner';
import AddressDropdown from '../components/AddressDropdown';
import ProductSearchModal from '../components/ProductSearchModal';

const NewOrderPage: React.FC = () => {    
  const { customers, addOrder, t, formatCurrency, isUpdating, formatInteger } = useAppContext();
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
  const [error, setError] = useState('');
  const [cameFromSelection, setCameFromSelection] = useState(false);
  const [originalSelectionId, setOriginalSelectionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (selection) {
        setCameFromSelection(true);
        setOriginalSelectionId(selection.id);

        const existingCustomer = customers.find(c => c.phone === selection.customerPhone);

        setCustomerData({
            name: existingCustomer?.name || selection.customerName,
            phone: existingCustomer?.phone || selection.customerPhone,
            whatsapp: existingCustomer?.whatsapp || selection.customerPhone,
            address: existingCustomer?.address || selection.customerAddress,
            email: existingCustomer?.email || selection.customerEmail
        });
        
        setCart(selection.items);
        
        navigate('.', { state: {}, replace: true }); 
    }
  }, [selection, navigate, customers]);

  const handleCustomerDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    if (!product.isAvailable) return;
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
        updateQuantity(product.id, existingItem.quantity + 1);
    } else {
        const newCartItem: CartItem = { 
            productId: product.id, 
            name: product.name, 
            price: product.price, // This is already the discounted price from context
            quantity: 1, 
            points: product.points,
            originalPrice: product.originalPrice, // Add original price if it exists
            appliedDiscountPercentage: product.discountPercentage // Add discount % if it exists
        };
        setCart([...cart, newCartItem]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
        setCart(cart.filter(item => item.productId !== productId));
    } else {
        setCart(cart.map(item => item.productId === productId ? { ...item, quantity } : item));
    }
  };

  const toggleDiscountForItem = (productId: string) => {
    setCart(currentCart => currentCart.map(item => {
      if (item.productId === productId && typeof item.originalPrice === 'number' && typeof item.appliedDiscountPercentage === 'number') {
        const isDiscountApplied = item.price < item.originalPrice;
        if (isDiscountApplied) {
          // Remove discount
          return { ...item, price: item.originalPrice };
        } else {
          // Re-apply discount
          const discountedPrice = item.originalPrice * (1 - (item.appliedDiscountPercentage / 100));
          return { ...item, price: discountedPrice };
        }
      }
      return item;
    }));
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

  return (
    <>
      {isModalOpen && <ProductSearchModal onClose={() => setIsModalOpen(false)} onAddToCart={addToCart} />}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary">{t('createNewInvoice')}</h1>
          <p className="mt-1 text-text-secondary">{t('enterProductDetails')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-lg">
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-text-primary border-b border-border pb-3 mb-4">{t('customerInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="md:col-span-2">
                  <AddressDropdown
                    label={t('addressOptional')}
                    id="address"
                    name="address"
                    value={customerData.address}
                    onChange={handleCustomerDataChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-text-primary border-b border-border pb-3 mb-4">{t('invoiceSummary')}</h3>
              <div className="space-y-4">
                {cart.length > 0 ? cart.map(item => {
                  const hasDiscountOption = typeof item.originalPrice === 'number' && typeof item.appliedDiscountPercentage === 'number';
                  const isDiscountApplied = hasDiscountOption && item.price < item.originalPrice;
                  
                  return (
                    <div key={item.productId} className="flex justify-between items-center bg-card-secondary p-3 rounded-lg flex-wrap gap-2">
                      <div className="flex-grow">
                        <p className="font-semibold text-text-primary">{item.name}</p>
                         <div className="flex items-baseline gap-2">
                           <p className="text-sm font-medium text-accent">{formatCurrency(item.price)}</p>
                           {isDiscountApplied && <p className="text-xs text-text-secondary line-through">{formatCurrency(item.originalPrice!)}</p>}
                         </div>
                         {hasDiscountOption && (
                            <button
                                type="button"
                                onClick={() => toggleDiscountForItem(item.productId)}
                                className={`mt-2 text-xs font-semibold py-1 px-2 rounded-md ${isDiscountApplied ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
                            >
                                {isDiscountApplied ? t('removeDiscount') : t('reapplyDiscount')}
                            </button>
                         )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateQuantity(item.productId, parseInt(e.target.value, 10))}
                          className="w-16 p-1 text-center rounded-md border border-border bg-input-bg"
                          aria-label={`Quantity for ${item.name}`}
                        />
                         <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, 0)}
                          className="p-1.5 text-red-500 hover:text-red-700"
                          title={t('delete')}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-center text-text-secondary py-8">{t('cartIsEmpty')}</p>
                )}
                 <button 
                  type="button" 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-accent hover:text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border-2 border-dashed border-accent/50 hover:border-primary/50 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    {t('addProduct')}
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-4 mt-auto border-t border-border flex-shrink-0 bg-card-secondary/50 rounded-b-xl">
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
    </>
  );
};

export default NewOrderPage;