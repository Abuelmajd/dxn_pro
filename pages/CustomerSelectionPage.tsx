import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useAppContext } from "../context/AppContext";
import { CartItem, Product } from "../types";
import { Link } from "react-router-dom";
import ProductDetailModal from "../components/ProductDetailModal";
import ThemeToggle from "../components/ThemeToggle";
import ButtonSpinner from "../components/ButtonSpinner";
import Footer from "../components/Footer";
import AddressDropdown from "../components/AddressDropdown";

const ArrowLeftIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ArrowRightIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const SyncIcon: React.FC<{ isSyncing: boolean }> = ({ isSyncing }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${isSyncing ? "animate-spin" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h5M20 20v-5h-5M4 4a8 8 0 0113.856 5.292M20 20a8 8 0 01-13.856-5.292"
    />
  </svg>
);

const NewProductCard: React.FC<{
  product: Product;
  onViewDetails: (product: Product) => void;
}> = ({ product, onViewDetails }) => {
  const { t, formatCurrency } = useAppContext();
  const hasDiscount =
    !!product.discountPercentage && typeof product.originalPrice === "number";

  return (
    <div className="w-48 flex-shrink-0 group h-full snap-start">
      <button
        onClick={() => onViewDetails(product)}
        className="w-full h-full text-left bg-card rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent flex flex-col"
        aria-label={`View details for ${product.name}`}
      >
        <div className="w-full h-32 bg-background/50 relative flex-shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            {t("new")}
          </div>
        </div>
        <div className="p-2 flex-grow flex flex-col">
          <h4 className="font-bold text-sm text-text-primary group-hover:text-accent transition-colors min-h-[2.5rem]">
            {product.name}
          </h4>
          <div className="mt-auto pt-2 flex items-baseline gap-2">
            <p className="text-base font-semibold text-primary">
              {formatCurrency(product.price)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-text-secondary line-through">
                {formatCurrency(product.originalPrice!)}
              </p>
            )}
          </div>
        </div>
      </button>
    </div>
  );
};

const ProductSelectionCard: React.FC<{
  product: Product;
  onViewDetails: (product: Product) => void;
  quantityInCart: number;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}> = ({ product, onViewDetails, quantityInCart, onUpdateQuantity }) => {
  const { t, formatCurrency, getCategoryNameById, formatInteger } =
    useAppContext();
  const hasDiscount =
    !!product.discountPercentage && typeof product.originalPrice === "number";

  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex flex-col group relative">
      {hasDiscount && (
        <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
          -{formatInteger(product.discountPercentage!)}%
        </div>
      )}
      <button
        onClick={() => onViewDetails(product)}
        className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-t-lg"
        aria-label={`View details for ${product.name}`}
      >
        <div className="w-full h-40 bg-background/50">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>
      </button>
      <div className="p-4 flex-grow flex flex-col">
        <button
          onClick={() => onViewDetails(product)}
          className="text-right w-full focus:outline-none"
        >
          <h3 className="font-bold text-lg text-text-primary group-hover:text-accent transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
          <p className="text-sm text-text-secondary">
            {getCategoryNameById(product.categoryId)}
          </p>
        </button>
        <div className="mt-4 flex-grow flex items-end justify-start rtl:justify-end">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-semibold text-accent">
              {formatCurrency(product.price)}
            </p>
            {hasDiscount && (
              <p className="text-sm text-text-secondary line-through">
                {formatCurrency(product.originalPrice!)}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          {quantityInCart === 0 ? (
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
            >
              {t("addToCart")}
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-card-secondary text-text-primary hover:bg-border transition-colors font-bold text-2xl"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                −
              </button>
              <span
                className="text-lg font-bold w-12 text-center text-text-primary"
                aria-live="polite"
              >
                {formatInteger(quantityInCart)}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-card-secondary text-text-primary hover:bg-border transition-colors font-bold text-2xl"
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
  const {
    products,
    rawProducts,
    categories,
    addCustomerSelection,
    t,
    formatCurrency,
    formatInteger,
    isUpdating,
    isRefreshing,
    settings,
  } = useAppContext();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [view, setView] = useState<"browsing" | "checkout">("browsing");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // New state and refs for scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollBackward, setCanScrollBackward] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const newProducts = useMemo(
    () =>
      [...products]
        .filter((p) => (p.isAvailable ?? true) && p.isNewlyArrived === true)
        .reverse(),
    [products]
  );

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const isRTL = settings.language === "ar";
      const tolerance = 2; // Allow for pixel rounding errors
      const hasOverflow = el.scrollWidth > el.clientWidth + tolerance;

      if (!hasOverflow) {
        setCanScrollBackward(false);
        setCanScrollForward(false);
        return;
      }

      const currentScroll = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (isRTL) {
        // For RTL in modern browsers (WebKit/Blink), scrollLeft is 0 at the rightmost end
        // and becomes negative as you scroll left. maxScroll is still positive.
        // "Forward" is scrolling left (towards -maxScroll)
        // "Backward" is scrolling right (towards 0)
        setCanScrollForward(Math.abs(currentScroll) < maxScroll - tolerance);
        setCanScrollBackward(currentScroll < -tolerance);
      } else {
        // LTR standard behavior
        setCanScrollBackward(currentScroll > tolerance);
        setCanScrollForward(currentScroll < maxScroll - tolerance);
      }
    }
  }, [settings.language]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const handleScroll = () => checkScrollability();
      const handleResize = () => checkScrollability();

      el.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleResize);

      // Initial check after a short delay to allow images to load and affect scrollWidth
      const timer = setTimeout(handleResize, 300);

      return () => {
        el.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
        clearTimeout(timer);
      };
    }
  }, [checkScrollability, newProducts]);

  const scroll = (direction: "forward" | "backward") => {
    const el = scrollContainerRef.current;
    if (el) {
      const isRTL = settings.language === "ar";
      const scrollAmount = el.clientWidth * 0.9; // Scroll 90% of visible width
      let modifier = direction === "forward" ? 1 : -1;

      // In LTR, 'forward' scrolls right (+). In RTL, 'forward' should scroll left (-).
      if (isRTL) {
        modifier *= -1;
      }

      el.scrollBy({ left: modifier * scrollAmount, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setView("browsing");
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    if (value.length <= 10) {
      // Limit to 10 digits
      setCustomerPhone(value);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerAddress(e.target.value);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === productId
      );

      if (!existingItem && quantity > 0) {
        // Add new item
        const productToAdd = products.find((p) => p.id === productId);
        if (!productToAdd) return prevCart;

        // FIX: The new cart item must include all required properties from the CartItem type.
        const rawProduct = rawProducts.find((p) => p.id === productId);
        if (!rawProduct) return prevCart; // Should not happen if productToAdd exists

        const newCartItem: CartItem = {
          productId: productToAdd.id,
          name: productToAdd.name,
          quantity: quantity,
          points: productToAdd.points,
          price: productToAdd.price,
          basePrice: rawProduct.price,
          baseMemberPrice: rawProduct.memberPrice,
          selectedPriceType: "normal",
        };

        return [...prevCart, newCartItem];
      } else if (existingItem && quantity <= 0) {
        // Remove item
        return prevCart.filter((item) => item.productId !== productId);
      } else if (existingItem) {
        // Update quantity
        return prevCart.map((item) =>
          item.productId === productId ? { ...item, quantity: quantity } : item
        );
      }

      return prevCart; // No change
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !customerName.trim() ||
      !String(customerPhone).trim() ||
      !customerAddress.trim()
    ) {
      setError(t("errorFillAllFields"));
      return;
    }
    if (cart.length === 0) {
      setError(t("errorAddProductsToSelection"));
      return;
    }
    setError("");

    const success = await addCustomerSelection({
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      items: cart,
    });

    if (success) {
      setIsSubmitted(true);
    } else {
      setError("فشل إرسال الاختيار. يرجى المحاولة مرة أخرى.");
    }
  };

  const filteredProducts = products.filter((p) => {
    const availableMatch = p.isAvailable ?? true;
    const nameMatch = String(p.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch =
      !selectedCategoryId || p.categoryId === selectedCategoryId;
    return availableMatch && nameMatch && categoryMatch;
  });

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md mx-auto text-center bg-card rounded-xl shadow-lg p-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-2xl font-bold mt-4 text-text-primary">
              {t("selectionSubmittedSuccessfully")}
            </h1>
            <p className="text-text-secondary mt-2">
              {t("selectionSubmittedSubtitle")}
            </p>
            <button
              onClick={handleReset}
              className="mt-6 w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors"
            >
              {t("backToSelection")}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (view === "checkout") {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow max-w-2xl mx-auto my-8 p-4 w-full">
          <div className="bg-card rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between border-b pb-4 border-border">
              <h1 className="text-2xl font-bold text-text-primary">
                {t("invoiceSummary")}
              </h1>
              <button
                onClick={() => setView("browsing")}
                className="text-sm text-accent hover:underline"
              >
                {t("continueShopping")}
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="my-6 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {t("yourInfo")}
                </h3>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    {t("yourName")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent text-text-primary"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    {t("yourPhone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent text-text-primary"
                    required
                    pattern="[0-9]{10}"
                    title={t("phone_10_digits_error")}
                    placeholder="05..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    {t("yourEmailOptional")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent text-text-primary"
                    title={t("email_invalid_error")}
                  />
                </div>
                <AddressDropdown
                  label={t("addressOptional")}
                  id="address"
                  name="address"
                  value={customerAddress}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 rtl:pr-0 rtl:pl-2 border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  {t("yourSelection")}
                </h3>
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-text-primary">
                          {item.name}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="w-16 p-1 text-center rounded-md border border-border bg-input-bg text-text-primary"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-text-secondary py-8">
                    {t("cartIsEmpty")}
                  </p>
                )}
              </div>
              {cart.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-center font-bold text-lg text-text-primary">
                    <span>{t("total")}</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              )}
              {error && (
                <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={
                  isUpdating ||
                  cart.length === 0 ||
                  !customerName ||
                  !customerPhone ||
                  !customerAddress
                }
                className="mt-6 w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-hover disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isUpdating ? (
                  <>
                    <ButtonSpinner /> {t("submittingSelection")}
                  </>
                ) : (
                  t("submitSelection")
                )}
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full bg-background">
        <div className="text-end py-4 flex items-center justify-end gap-4">
          {isRefreshing && (
            <div
              className="flex items-center gap-2 text-accent animate-pulse"
              aria-live="polite"
            >
              <SyncIcon isSyncing={true} />
              <span className="text-sm font-medium">{t("refreshData")}...</span>
            </div>
          )}
          <ThemeToggle className="text-text-primary hover:text-accent transition-colors hover:bg-card-secondary" />
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-text-primary bg-card/80 hover:bg-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            {t("merchantLogin")}
          </Link>
        </div>
        <div className="text-center mb-8 mt-4">
          <img
            src="https://lh3.googleusercontent.com/d/1JVW882aiQIHcc91tEhn9_fOjRSOJFkS8"
            alt="DXN App Logo"
            className="h-24 w-auto mx-auto mb-6 rounded-3xl"
          />
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            {t("productSelectionPage")}
          </h1>
          <p className="mt-4 text-lg leading-8 text-text-secondary">
            {t("selectYourProducts")}
          </p>
        </div>

        {newProducts.length > 0 && (
          <div className="mb-12 relative">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              {t("newlyArrived")}
            </h2>

            <div
              className={`absolute top-1/2 -translate-y-1/2 w-full flex justify-between items-center z-20 pointer-events-none ${
                settings.language === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              <button
                onClick={() => scroll("backward")}
                disabled={!canScrollBackward}
                className="pointer-events-auto p-2 bg-card/80 backdrop-blur-sm rounded-full shadow-lg transition-all hover:bg-card hover:scale-110 disabled:opacity-0 disabled:scale-50 ms-2"
                aria-label={
                  settings.language === "ar" ? "Scroll right" : "Scroll left"
                }
              >
                {settings.language === "ar" ? (
                  <ArrowRightIcon />
                ) : (
                  <ArrowLeftIcon />
                )}
              </button>
              <button
                onClick={() => scroll("forward")}
                disabled={!canScrollForward}
                className="pointer-events-auto p-2 bg-card/80 backdrop-blur-sm rounded-full shadow-lg transition-all hover:bg-card hover:scale-110 disabled:opacity-0 disabled:scale-50 me-2"
                aria-label={
                  settings.language === "ar" ? "Scroll left" : "Scroll right"
                }
              >
                {settings.language === "ar" ? (
                  <ArrowLeftIcon />
                ) : (
                  <ArrowRightIcon />
                )}
              </button>
            </div>

            <div className="-mx-4 sm:-mx-6 lg:-mx-8">
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 py-4 px-4 sm:px-6 lg:px-8 scrollbar-hide snap-x snap-mandatory"
              >
                {newProducts.map((p) => (
                  <NewProductCard
                    key={p.id}
                    product={p}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder={t("searchForProduct")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-3 bg-card text-text-primary placeholder-text-secondary rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
          />
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="sm:w-1/3 p-3 bg-card text-text-primary rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((p) => {
            const itemInCart = cart.find((item) => item.productId === p.id);
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
              onClick={() => setView("checkout")}
              className="bg-primary text-white rounded-full shadow-lg p-3 sm:p-4 hover:bg-primary-hover transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <div className="text-left rtl:text-right">
                  <div className="font-bold text-base sm:text-lg">
                    {formatCurrency(totalPrice)}
                  </div>
                  <div className="text-xs sm:text-sm">
                    {formatInteger(totalItems)} {t("products")}
                  </div>
                </div>
                <div className="ps-2 hidden sm:block">
                  <span className="font-semibold">
                    {t("proceedToCheckout")}
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CustomerSelectionPage;
