import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { Product } from "../types";
import ButtonSpinner from "../components/ButtonSpinner";

const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .527-1.666 1.32-3.206 2.274-4.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-18-18M9.536 4.904A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-2.036 3.874"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarOutlineIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.586-1.54l-6.235 1.728zM7.494 18.021l.349.206c1.498.887 3.232 1.365 5.016 1.365 5.42 0 9.82-4.4 9.821-9.821s-4.4-9.82-9.82-9.82c-5.42 0-9.82 4.4-9.82 9.82 0 1.83.504 3.579 1.397 5.028l.229.386-1.096 4.004 4.105-1.07z" />
  </svg>
);

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  errorMessage?: string;
  warningMessage?: string;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  errorMessage,
  warningMessage,
}) => {
  const { t } = useAppContext();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4"
      aria-labelledby="confirmation-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="confirmation-modal-title"
          className="text-xl font-bold text-text-primary"
        >
          {title}
        </h3>
        <p className="text-text-secondary mt-4 whitespace-pre-wrap">
          {message}
        </p>

        {warningMessage && (
          <div className="mt-4 p-3 bg-yellow-900/30 text-yellow-300 rounded-md text-sm border border-yellow-500/30">
            {warningMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-900/30 text-red-400 rounded-md text-sm border border-red-500/30">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-semibold bg-card-secondary text-text-primary hover:bg-border transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkPriceUpdateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    updateType: "profitMargin" | "exchangeRate",
    value: number
  ) => void;
  selectedCount: number;
}> = ({ isOpen, onClose, onConfirm, selectedCount }) => {
  const { t, settings, exchangeRate } = useAppContext();
  const [updateType, setUpdateType] = useState<"profitMargin" | "exchangeRate">(
    "profitMargin"
  );
  const [profitMarginValue, setProfitMarginValue] = useState(
    settings.profitMarginILS
  );
  const [exchangeRateValue, setExchangeRateValue] = useState(exchangeRate);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    const value =
      updateType === "profitMargin" ? profitMarginValue : exchangeRateValue;
    await onConfirm(updateType, value);
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-text-primary">
          تحديث أسعار {selectedCount} منتجات
        </h3>
        <p className="text-text-secondary mt-2">
          اختر طريقة التحديث وأدخل القيمة الجديدة.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 p-1 bg-input-bg rounded-lg border border-border">
            <button
              onClick={() => setUpdateType("profitMargin")}
              className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${
                updateType === "profitMargin"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-card-secondary"
              }`}
            >
              تحديث حسب هامش الربح
            </button>
            <button
              onClick={() => setUpdateType("exchangeRate")}
              className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${
                updateType === "exchangeRate"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-card-secondary"
              }`}
            >
              تحديث حسب سعر الصرف
            </button>
          </div>

          {updateType === "profitMargin" ? (
            <div>
              <label
                htmlFor="profitMargin"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                هامش الربح الجديد ({settings.currency.symbol})
              </label>
              <input
                type="number"
                id="profitMargin"
                value={profitMarginValue}
                onChange={(e) => setProfitMarginValue(Number(e.target.value))}
                className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
              />
              <p className="mt-2 text-xs text-text-secondary">
                سيتم إعادة حساب أسعار البيع بناءً على السعر بالدولار + سعر الصرف
                الحالي + هامش الربح هذا.
              </p>
            </div>
          ) : (
            <div>
              <label
                htmlFor="exchangeRate"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                سعر صرف الدولار الجديد
              </label>
              <input
                type="number"
                id="exchangeRate"
                value={exchangeRateValue}
                onChange={(e) => setExchangeRateValue(Number(e.target.value))}
                step="0.01"
                className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
              />
              <p className="mt-2 text-xs text-text-secondary">
                سيتم إعادة حساب أسعار البيع باستخدام هذا السعر وهامش الربح العام
                في الإعدادات.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-md font-semibold bg-card-secondary text-text-primary hover:bg-border transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-4 py-2 rounded-md font-semibold text-white bg-primary hover:bg-primary-hover transition-colors disabled:bg-gray-400 flex items-center"
          >
            {isProcessing && <ButtonSpinner />}
            {isProcessing ? "جاري التحديث..." : "تأكيد التحديث"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductsListPage: React.FC = () => {
  const {
    products,
    categories,
    orders,
    t,
    formatCurrency,
    formatInteger,
    getCategoryNameById,
    deleteProduct,
    toggleProductAvailability,
    toggleProductNewlyArrived,
    isUpdating,
    removeDiscount,
    settings,
    formatNumber,
    bulkUpdateProductPrices,
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [modalState, setModalState] = useState<{
    type: "deleteProduct" | "removeDiscount" | null;
    product: Product | null;
  }>({ type: null, product: null });
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>(
    undefined
  );

  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const nameMatch = String(product.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const categoryMatch =
        !selectedCategoryId || product.categoryId === selectedCategoryId;
      const statusMatch =
        selectedStatus === "" ||
        (selectedStatus === "available" && (product.isAvailable ?? true)) ||
        (selectedStatus === "unavailable" && !(product.isAvailable ?? true)) ||
        (selectedStatus === "on_sale" &&
          product.discountPercentage &&
          product.discountPercentage > 0) ||
        (selectedStatus === "newly_arrived" && product.isNewlyArrived === true);
      return nameMatch && categoryMatch && statusMatch;
    });
  }, [products, searchTerm, selectedCategoryId, selectedStatus]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)));
    } else {
      setSelectedProductIds(new Set());
    }
  };

  const toggleBulkEditMode = () => {
    setIsBulkEditMode((prev) => !prev);
    setSelectedProductIds(new Set());
  };

  const handleBulkUpdateConfirm = async (
    updateType: "profitMargin" | "exchangeRate",
    value: number
  ) => {
    await bulkUpdateProductPrices({
      productIds: Array.from(selectedProductIds),
      updateType,
      value,
    });
    setIsUpdateModalOpen(false);
    setIsBulkEditMode(false);
    setSelectedProductIds(new Set());
  };

  const openModal = (
    type: "deleteProduct" | "removeDiscount",
    product: Product
  ) => {
    setDeleteError(undefined);
    setDeleteWarning(undefined);

    if (type === "deleteProduct") {
      const isInOrder = orders.some((order) =>
        order.items.some((item) => item.productId === product.id)
      );
      if (isInOrder) {
        setDeleteWarning(t("confirmDeleteProductWarning"));
      }
    }
    setModalState({ type, product });
  };

  const closeModal = () => {
    setModalState({ type: null, product: null });
  };

  const handleConfirm = async () => {
    if (!modalState.product || !modalState.type) return;

    if (modalState.type === "deleteProduct") {
      const result = await deleteProduct(modalState.product.id);
      if (!result.success) {
        setDeleteError(result.error || "An unknown error occurred.");
        setDeleteWarning(undefined);
      } else {
        closeModal();
      }
    } else if (modalState.type === "removeDiscount") {
      const discount = settings.discounts.find(
        (d) => d.productId === modalState.product!.id || d.productId === "ALL"
      );
      if (discount) {
        removeDiscount(discount.productId);
      }
      closeModal();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {t("productList")}
          </h1>
          <p className="mt-1 text-text-secondary">
            {t("productListDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleBulkEditMode}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isBulkEditMode
                ? "bg-accent/20 border-accent text-accent"
                : "bg-card-secondary border-transparent text-text-primary hover:bg-border"
            }`}
          >
            {isBulkEditMode ? "إلغاء التعديل الجماعي" : "تعديل جماعي للأسعار"}
          </button>
          <a
            href="https://wa.me/c/972594943038"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <WhatsAppIcon />
            {t("productCatalog")}
          </a>
          <Link
            to="/admin/add-product"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {t("addNewProduct")}
          </Link>
        </div>
      </div>

      {isBulkEditMode && (
        <div className="sticky top-[65px] z-40 bg-card/80 backdrop-blur-md rounded-lg shadow-lg p-3 mb-4 border border-border flex justify-between items-center">
          <span className="font-semibold text-text-primary">
            {selectedProductIds.size} منتجات محددة
          </span>
          <div>
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              disabled={selectedProductIds.size === 0}
              className="px-4 py-2 rounded-md font-semibold text-sm text-white bg-primary hover:bg-primary-hover transition-colors disabled:bg-gray-400"
            >
              تحديث الأسعار المحددة
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder={t("searchForProduct")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 bg-card rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
        />
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="p-3 bg-card rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-3 bg-card rounded-lg shadow-sm border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="available">{t("available")}</option>
          <option value="unavailable">{t("unavailable")}</option>
          <option value="on_sale">{t("onSaleFilter")}</option>
          <option value="newly_arrived">{t("newlyArrived")}</option>
        </select>
      </div>

      <div className="bg-card rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-text-secondary">
            <thead className="text-sm text-text-secondary bg-card-secondary">
              <tr>
                {isBulkEditMode && (
                  <th scope="col" className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      onChange={handleSelectAll}
                      checked={
                        filteredProducts.length > 0 &&
                        selectedProductIds.size === filteredProducts.length
                      }
                    />
                  </th>
                )}
                {/* FIX: Replaced invalid translation key 'product' with 'productName'. */}
                <th
                  scope="col"
                  className="px-6 py-4 text-right font-medium min-w-[300px]"
                >
                  {t("productName")}
                </th>
                <th scope="col" className="px-6 py-4 text-center font-medium">
                  {t("normalPriceUSD")}
                </th>
                <th scope="col" className="px-6 py-4 text-center font-medium">
                  {t("memberPriceUSD")}
                </th>
                <th scope="col" className="px-6 py-4 text-center font-medium">
                  {t("sellingPrice")}
                </th>
                <th scope="col" className="px-6 py-4 text-center font-medium">
                  {t("memberPrice")}
                </th>
                <th scope="col" className="px-6 py-4 text-center font-medium">
                  {t("points")}
                </th>
                <th scope="col" className="px-6 py-4 text-left font-medium">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isAvailable = product.isAvailable ?? true;
                  const hasDiscount = !!product.discountPercentage;
                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-border hover:bg-card-secondary align-middle transition-all ${
                        !isAvailable ? "opacity-60" : ""
                      } ${
                        selectedProductIds.has(product.id)
                          ? "bg-primary/10"
                          : ""
                      }`}
                    >
                      {isBulkEditMode && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={selectedProductIds.has(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-14 w-14 flex-shrink-0 rounded-lg object-contain bg-background/50"
                          />
                          <div className="flex-grow">
                            <div className="font-bold text-text-primary text-base flex items-center gap-x-3 flex-wrap">
                              <span>{product.name}</span>
                              {!isAvailable && (
                                <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                                  {t("unavailable")}
                                </span>
                              )}
                              {hasDiscount && (
                                <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                                  -{formatInteger(product.discountPercentage!)}%
                                </span>
                              )}
                            </div>
                            <p className="font-normal text-sm text-text-secondary mt-1">
                              {getCategoryNameById(product.categoryId)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="font-semibold text-lg text-text-secondary">
                          ${formatNumber(product.normalPriceUSD)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="font-semibold text-lg text-text-secondary">
                          ${formatNumber(product.memberPriceUSD)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-xl text-accent">
                            {formatCurrency(product.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-text-secondary line-through">
                              {formatCurrency(product.originalPrice!)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-xl text-primary">
                            {formatCurrency(product.memberPrice)}
                          </span>
                          {hasDiscount && product.originalMemberPrice && (
                            <span className="text-sm text-text-secondary line-through">
                              {formatCurrency(product.originalMemberPrice)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="font-bold text-xl text-accent">
                          {formatInteger(product.points)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-end items-center gap-1">
                          <button
                            onClick={() =>
                              toggleProductNewlyArrived(product.id)
                            }
                            disabled={isUpdating}
                            title={
                              product.isNewlyArrived
                                ? t("removeFromNewlyArrived")
                                : t("addToNewlyArrived")
                            }
                            className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-yellow-500 transition-colors disabled:opacity-50"
                          >
                            {product.isNewlyArrived ? (
                              <StarIcon />
                            ) : (
                              <StarOutlineIcon />
                            )}
                          </button>
                          {hasDiscount && (
                            <button
                              onClick={() =>
                                openModal("removeDiscount", product)
                              }
                              disabled={isUpdating}
                              title={t("removeDiscount")}
                              className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() =>
                              toggleProductAvailability(product.id)
                            }
                            disabled={isUpdating}
                            title={
                              isAvailable
                                ? t("markUnavailable")
                                : t("markAvailable")
                            }
                            className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                          >
                            {isAvailable ? <EyeIcon /> : <EyeOffIcon />}
                          </button>
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            title={t("edit")}
                            className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-accent transition-colors"
                          >
                            <PencilIcon />
                          </Link>
                          <button
                            onClick={() => openModal("deleteProduct", product)}
                            disabled={isUpdating}
                            title={t("delete")}
                            className="p-2 rounded-full text-text-secondary hover:bg-card-secondary hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={isBulkEditMode ? 8 : 7}
                    className="text-center py-16"
                  >
                    <p className="text-text-secondary">{t("noProducts")}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {modalState.type && modalState.product && (
        <ConfirmationModal
          isOpen={!!modalState.type}
          onClose={closeModal}
          onConfirm={handleConfirm}
          title={
            modalState.type === "deleteProduct"
              ? t("confirmDeletionTitle")
              : t("removeDiscount")
          }
          message={
            modalState.type === "deleteProduct"
              ? t("confirmDeleteProduct")
              : t("confirmRemoveDiscount")
          }
          confirmText={
            modalState.type === "deleteProduct"
              ? t("delete")
              : t("removeDiscount")
          }
          errorMessage={deleteError}
          warningMessage={deleteWarning}
        />
      )}
      <BulkPriceUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onConfirm={handleBulkUpdateConfirm}
        selectedCount={selectedProductIds.size}
      />
    </div>
  );
};

export default ProductsListPage;
