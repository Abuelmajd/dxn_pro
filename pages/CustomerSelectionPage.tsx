import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CartItem, Product } from '../types';
import { Link } from 'react-router-dom';
import ProductDetailModal from '../components/ProductDetailModal';

const ProductSelectionCard: React.FC<{ 
    product: Product, 
    onViewDetails: (product: Product) => void,
    quantityInCart: number,
    onUpdateQuantity: (productId: string, newQuantity: number) => void
}> = ({ product, onViewDetails, quantityInCart, onUpdateQuantity }) => {
    const { t, formatCurrency, getCategoryNameById, formatNumber } = useAppContext();
    return (
        <div className="bg-slate-900 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex flex-col group">
            <button 
              onClick={() => onViewDetails(product)} 
              className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-t-lg"
              aria-label={`View details for ${product.name}`}
            >
              <div className="w-full h-40 bg-slate-700">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
              </div>
            </button>
            <div className="p-4 flex-grow flex flex-col">
                <button onClick={() => onViewDetails(product)} className="text-right w-full focus:outline-none">
                     <h3 className="font-bold text-lg text-slate-100 group-hover:text-green-400 transition-colors">{product.name}</h3>
                    <p className="text-sm text-slate-400">{getCategoryNameById(product.categoryId)}</p>
                </button>
                <div className="mt-4 flex-grow flex items-end">
                    <p className="text-xl font-semibold text-green-400">{formatCurrency(product.price)}</p>
                </div>
                 <div className="mt-4">
                    {quantityInCart === 0 ? (
                         <button 
                            onClick={() => onUpdateQuantity(product.id, 1)}
                            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            {t('addToCart')}
                        </button>
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <button 
                                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors font-bold text-2xl"
                                aria-label={`Decrease quantity of ${product.name}`}
                            >
                                −
                            </button>
                            <span className="text-lg font-bold w-12 text-center text-white" aria-live="polite">{formatNumber(quantityInCart)}</span>
                            <button 
                                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors font-bold text-2xl"
                                aria-label={`Increase quantity of ${product.name}`}
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const CustomerSelectionPage: React.FC = () => {    
  const { products, addCustomerSelection, t, formatCurrency, formatNumber, isUpdating } = useAppContext();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [view, setView] = useState<'browsing' | 'checkout'>('browsing');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);


  const handleReset = () => {
      setIsSubmitted(false);
      setView('browsing');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
  }

  useEffect(() => {
    if (isSubmitted) {
        const timer = setTimeout(() => {
            handleReset();
        }, 4000); // Automatically return after 4 seconds
        return () => clearTimeout(timer);
    }
  }, [isSubmitted]);


  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);

      if (!existingItem && quantity > 0) {
        // Add new item
        const productToAdd = products.find(p => p.id === productId);
        if (!productToAdd) return prevCart;
        return [...prevCart, { 
            productId: productToAdd.id, 
            name: productToAdd.name, 
            price: productToAdd.price, 
            quantity: quantity,
            // FIX: Add missing 'points' property to satisfy the CartItem type.
            points: productToAdd.points || 0,
        }];
      } else if (existingItem && quantity <= 0) {
        // Remove item
        return prevCart.filter(item => item.productId !== productId);
      } else if (existingItem) {
        // Update quantity
        return prevCart.map(item =>
          item.productId === productId ? { ...item, quantity: quantity } : item
        );
      }
      
      return prevCart; // No change
    });
  };
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
        setError(t('errorCustomerNamePhoneSelection'));
        return;
    }
    if (cart.length === 0) {
        setError(t('errorAddProductsToSelection'));
        return;
    }
    setError('');

    const success = await addCustomerSelection({
        customerName,
        customerPhone,
        customerEmail,
        items: cart,
    });
    
    if (success) {
      setIsSubmitted(true);
    } else {
      setError("فشل إرسال الاختيار. يرجى المحاولة مرة أخرى.");
    }
  };

  const filteredProducts = products.filter(p => 
      (p.isAvailable ?? true) && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isSubmitted) {
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="max-w-md mx-auto text-center bg-slate-900 rounded-xl shadow-lg p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h1 className="text-2xl font-bold mt-4 text-white">{t('selectionSubmittedSuccessfully')}</h1>
                  <p className="text-slate-400 mt-2">سيقوم التاجر بالتواصل معك قريباً.</p>
                  <button onClick={handleReset} className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
                      {t('backToSelection')}
                  </button>
              </div>
          </div>
      )
  }

  if (view === 'checkout') {
    return (
        <div className="max-w-2xl mx-auto my-8 p-4">
            <div className="bg-slate-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between border-b pb-4 border-slate-700">
                    <h1 className="text-2xl font-bold text-white">{t('invoiceSummary')}</h1>
                    <button onClick={() => setView('browsing')} className="text-sm text-green-400 hover:underline">
                        {t('continueShopping')}
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="my-6 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-200">{t('yourInfo')}</h3>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">{t('yourName')}</label>
                            <input type="text" name="name" id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-green-500 focus:border-green-500 text-white" required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">{t('yourPhone')}</label>
                            <input type="tel" name="phone" id="phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-green-500 focus:border-green-500 text-white" required />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">{t('yourEmailOptional')}</label>
                            <input type="email" name="email" id="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-green-500 focus:border-green-500 text-white" />
                        </div>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 rtl:pr-0 rtl:pl-2 border-t border-slate-700 pt-6">
                        <h3 className="text-lg font-semibold text-slate-200">{t('yourSelection')}</h3>
                        {cart.length > 0 ? cart.map(item => (
                            <div key={item.productId} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{item.name}</p>
                                    <p className="text-sm text-slate-400">{formatCurrency(item.price)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="1" value={item.quantity} onChange={e => updateQuantity(item.productId, parseInt(e.target.value, 10) || 1)} className="w-16 p-1 text-center rounded-md border border-slate-600 bg-slate-700 text-white" />
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-slate-500 py-8">{t('cartIsEmpty')}</p>
                        )}
                    </div>
                    {cart.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-700">
                            <div className="flex justify-between items-center font-bold text-lg text-white">
                                <span>{t('total')}</span>
                                <span>{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    <button type="submit" disabled={isUpdating || cart.length === 0 || !customerName || !customerPhone} className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                        {isUpdating ? 'جاري الإرسال...' : t('submitSelection')}
                    </button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <>
    {selectedProduct && (
        <ProductDetailModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(product) => {
                updateQuantity(product.id, 1);
                setSelectedProduct(null);
            }}
        />
    )}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-end py-4">
            <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                {t('merchantLogin')}
            </Link>
        </div>
        <div className="text-center mb-8 mt-4">
            <img 
                src="https://github.com/Abuelmajd/DXN/blob/16947febcb04734eaed7e2f1d98c76d7cc4e8046/logo.png?raw=true" 
                alt="DXN App Logo" 
                className="h-24 w-auto mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{t('productSelectionPage')}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-300">{t('selectYourProducts')}</p>
        </div>
        <input
          type="text"
          placeholder={t('searchForProduct')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-3 mb-8 bg-slate-900 text-white placeholder-slate-400 rounded-lg shadow-sm border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(p => {
            const itemInCart = cart.find(item => item.productId === p.id);
            const quantityInCart = itemInCart ? itemInCart.quantity : 0;
            return (
              <ProductSelectionCard 
                  key={p.id} 
                  product={p} 
                  onViewDetails={setSelectedProduct}
                  quantityInCart={quantityInCart}
                  onUpdateQuantity={updateQuantity}
              />
            );
          })}
        </div>

        {cart.length > 0 && (
            <div className="fixed bottom-4 right-4 rtl:right-auto rtl:left-4 z-50">
                <button 
                    onClick={() => setView('checkout')}
                    className="bg-green-600 text-white rounded-full shadow-lg p-3 sm:p-4 hover:bg-green-700 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <div className="flex items-center gap-3 sm:gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div className="text-left rtl:text-right">
                            <div className="font-bold text-base sm:text-lg">{formatCurrency(totalPrice)}</div>
                            <div className="text-xs sm:text-sm">{formatNumber(totalItems)} {t('products')}</div>
                        </div>
                        <div className="ps-2 hidden sm:block">
                           <span className="font-semibold">{t('proceedToCheckout')}</span>
                        </div>
                    </div>
                </button>
            </div>
        )}
    </main>
    </>
  );
};

export default CustomerSelectionPage;