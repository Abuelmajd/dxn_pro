import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CartItem, Product, Customer, CustomerSelection, Order } from '../types';
import ButtonSpinner from '../components/ButtonSpinner';
import AddressDropdown from '../components/AddressDropdown';
import ProductSearchModal from '../components/ProductSearchModal';

const NewOrderPage: React.FC = () => {    
  const { customers, addOrder, t, formatCurrency, isUpdating, rawProducts, settings, getOrderById, getCustomerById, updateOrder } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams<{ orderId: string }>();
  const selection: CustomerSelection | undefined = location.state?.selection;

  const isEditMode = !!orderId;
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [originalCustomer, setOriginalCustomer] = useState<Customer | null>(null);

  const [customerData, setCustomerData] = useState({
      name: '',
      address: '',
      phone: '',
      whatsapp: '',
      email: ''
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState('');
  const [originalSelectionId, setOriginalSelectionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [shippingCost, setShippingCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(settings.profitMarginILS);
  const [applyProfitMargin, setApplyProfitMargin] = useState(true);

  useEffect(() => {
    if (isEditMode) return;
    if (selection) {
        setOriginalSelectionId(selection.id);
        const existingCustomer = customers.find(c => c.phone === selection.customerPhone);

        setCustomerData({
            name: existingCustomer?.name || selection.customerName,
            phone: existingCustomer?.phone || selection.customerPhone,
            whatsapp: existingCustomer?.whatsapp || selection.customerPhone,
            address: existingCustomer?.address || selection.customerAddress,
            email: existingCustomer?.email || selection.customerEmail
        });
        
        const newCartItems: CartItem[] = selection.items.map(item => {
          const productDetails = rawProducts.find(p => p.id === item.productId);
          if (!productDetails) return null;

          return {
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            points: productDetails.points,
            basePrice: productDetails.price,
            baseMemberPrice: productDetails.memberPrice,
            selectedPriceType: 'normal',
            price: 0, 
          };
        }).filter((item): item is CartItem => item !== null);

        setCart(newCartItems);
        navigate('.', { state: {}, replace: true }); 
    }
  }, [selection, navigate, customers, rawProducts, isEditMode]);

  useEffect(() => {
    if (isEditMode && orderId) {
      const order = getOrderById(orderId);
      if (order) {
        setEditingOrder(order);
        const customer = getCustomerById(order.customerId);
        if (customer) {
            setOriginalCustomer(customer);
            setCustomerData({
              name: customer.name || order.customerName,
              phone: customer.phone || '',
              whatsapp: customer.whatsapp || '',
              email: customer.email || '',
              address: customer.address || ''
            });
        }
        
        const cartItemsWithFullData = order.items.map((item): CartItem => {
            const productDetails = rawProducts.find(p => p.id === item.productId);
            if (!productDetails) {
                 return {
                    ...item,
                    basePrice: item.price,
                    baseMemberPrice: item.price,
                    selectedPriceType: 'normal',
                };
            }
            return {
                ...item,
                basePrice: item.basePrice ?? productDetails.price,
                baseMemberPrice: item.baseMemberPrice ?? productDetails.memberPrice,
                // FIX: Correctly ensure selectedPriceType is of type 'normal' | 'member'.
                selectedPriceType: item.selectedPriceType === 'member' ? 'member' : 'normal',
            };
        });
        setCart(cartItemsWithFullData);
        setShippingCost(order.shippingCost || 0);
      }
    }
  }, [isEditMode, orderId, getOrderById, getCustomerById, rawProducts, settings.profitMarginILS]);


  useEffect(() => {
    setCart(currentCart => currentCart.map(item => {
      const basePriceToUse = item.selectedPriceType === 'member' ? item.baseMemberPrice : item.basePrice;
      const margin = applyProfitMargin ? profitMargin : 0;
      const finalPrice = basePriceToUse + margin;
      return { ...item, price: finalPrice };
    }));
  }, [profitMargin, applyProfitMargin, cart.map(i => i.selectedPriceType + i.productId).join(',')]);


  const handleCustomerDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'whatsapp') {
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length <= 10) {
            setCustomerData({ ...customerData, [name]: numericValue });
        }
    } else {
        setCustomerData({ ...customerData, [name]: value });
    }
  };

  const addToCart = (product: Product) => {
    if (!product.isAvailable) return;

    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
        updateQuantity(product.id, existingItem.quantity + 1);
    } else {
        const rawProduct = rawProducts.find(p => p.id === product.id);
        if (!rawProduct) return;

        const newCartItem: CartItem = { 
            productId: product.id, 
            name: product.name, 
            quantity: 1, 
            points: product.points,
            basePrice: rawProduct.price,
            baseMemberPrice: rawProduct.memberPrice,
            selectedPriceType: 'normal',
            price: 0, 
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

  const handlePriceTypeChange = (productId: string, type: 'normal' | 'member') => {
    setCart(cart.map(item => item.productId === productId ? { ...item, selectedPriceType: type } : item));
  };
  
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name.trim() || !String(customerData.phone).trim() || !String(customerData.whatsapp).trim() || !customerData.address.trim()) {
        setError(t('errorFillAllFields'));
        return;
    }
    if (cart.length === 0) {
        setError(t('errorAddProductsToInvoice'));
        return;
    }
    setError('');

    if (isEditMode) {
        if (!editingOrder || !originalCustomer) return;
        const totalPoints = cart.reduce((sum, item) => sum + (item.points * item.quantity), 0);
        const updatedOrder: Order = {
            ...editingOrder,
            customerName: customerData.name,
            items: cart,
            totalPrice: total,
            totalPoints,
            shippingCost: shippingCost || 0,
        };
        const updatedCustomer: Customer = {
            ...originalCustomer,
            name: customerData.name,
            address: customerData.address,
            phone: customerData.phone,
            whatsapp: customerData.whatsapp,
            email: customerData.email,
        };
        const success = await updateOrder(updatedOrder, updatedCustomer);
        if (success) {
            navigate('/admin/orders');
        } else {
            setError("فشل تحديث الفاتورة. يرجى المحاولة مرة أخرى.");
        }
    } else {
        const customerToAdd: Omit<Customer, 'id' | 'registrationDate'> = {
            name: customerData.name,
            address: customerData.address,
            phone: customerData.phone,
            whatsapp: customerData.whatsapp,
            email: customerData.email,
        };
        const success = await addOrder(customerToAdd, cart, shippingCost, originalSelectionId);
        if (success) {
          navigate('/admin/orders');
        } else {
          setError("فشل إنشاء الفاتورة. يرجى المحاولة مرة أخرى.");
        }
    }
  };

  return (
    <>
      {isModalOpen && <ProductSearchModal onClose={() => setIsModalOpen(false)} onAddToCart={addToCart} />}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary">{isEditMode ? t('editInvoice') : t('createNewInvoice')}</h1>
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
                  <input type="email" name="email" id="email" value={customerData.email} onChange={handleCustomerDataChange} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent" title={t('email_invalid_error')} />
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
                  const margin = applyProfitMargin ? profitMargin : 0;
                  const finalNormalPrice = item.basePrice + margin;
                  const finalMemberPrice = item.baseMemberPrice + margin;
                  
                  return (
                    <div key={item.productId} className="flex justify-between items-start bg-card-secondary p-3 rounded-lg flex-wrap gap-4">
                      <div className="flex-grow">
                        <p className="font-semibold text-text-primary">{item.name}</p>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`priceType-${item.productId}`} checked={item.selectedPriceType === 'normal'} onChange={() => handlePriceTypeChange(item.productId, 'normal')} className="w-4 h-4 text-accent bg-gray-100 border-gray-300 focus:ring-accent dark:focus:ring-accent dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                            <span className="text-sm text-text-secondary">{t('normalPrice')}: <span className="font-bold text-text-primary">{formatCurrency(finalNormalPrice)}</span></span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`priceType-${item.productId}`} checked={item.selectedPriceType === 'member'} onChange={() => handlePriceTypeChange(item.productId, 'member')} className="w-4 h-4 text-accent bg-gray-100 border-gray-300 focus:ring-accent dark:focus:ring-accent dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                             <span className="text-sm text-text-secondary">{t('memberPrice')}: <span className="font-bold text-text-primary">{formatCurrency(finalMemberPrice)}</span></span>
                          </label>
                        </div>
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

             {/* Invoice Adjustments Section */}
            <div>
                <h3 className="text-xl font-semibold text-text-primary border-b border-border pb-3 mb-4">{t('invoiceAdjustments')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label htmlFor="shippingCost" className="block text-sm font-medium text-text-primary mb-1">{t('shippingCost')}</label>
                        <input type="number" name="shippingCost" id="shippingCost" value={shippingCost || ''} onChange={e => setShippingCost(Number(e.target.value))} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent" min="0" step="0.1" />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-1">
                            <input type="checkbox" checked={applyProfitMargin} onChange={e => setApplyProfitMargin(e.target.checked)} className="w-4 h-4 text-accent bg-gray-100 rounded border-gray-300 focus:ring-accent" />
                            <span className="text-sm font-medium text-text-primary">{t('profitMargin')}</span>
                        </label>
                        <input type="number" name="profitMargin" id="profitMargin" value={profitMargin || ''} onChange={e => setProfitMargin(Number(e.target.value))} disabled={!applyProfitMargin} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent disabled:bg-gray-200 dark:disabled:bg-gray-700" min="0" step="0.1" />
                    </div>
                </div>
            </div>
          </div>
          
          <div className="p-6 pt-4 mt-auto border-t border-border flex-shrink-0 bg-card-secondary/50 rounded-b-xl">
            {cart.length > 0 && (
                <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center text-md">
                        <span className="text-text-secondary">{t('subtotal')}</span>
                        <span className="text-text-secondary">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-md">
                        <span className="text-text-secondary">{t('shippingCost')}</span>
                        <span className="text-text-secondary">{formatCurrency(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-border/50">
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
              {isUpdating ? <><ButtonSpinner /> {isEditMode ? t('savingChanges') : t('creatingInvoice')}</> : (isEditMode ? t('saveChanges') : t('confirmAndCreateInvoice'))}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewOrderPage;