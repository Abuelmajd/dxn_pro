import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { AppSettings, Discount } from "../types";
import ButtonSpinner from "../components/ButtonSpinner";
import SearchableSelect from "../components/SearchableSelect";

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, t, isUpdating, products, removeDiscount } =
    useAppContext();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [newDiscount, setNewDiscount] = useState<{
    productId: string;
    percentage: number;
  }>({ productId: "", percentage: 0 });
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setStatusMessage(null);
    const success = await updateSettings(localSettings);
    if (success) {
      setStatusMessage({ type: "success", text: t("updateSettingsSuccess") });
    } else {
      setStatusMessage({ type: "error", text: t("updateSettingsError") });
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleAddDiscount = () => {
    if (
      !newDiscount.productId ||
      newDiscount.percentage <= 0 ||
      newDiscount.percentage > 100
    ) {
      return; // Basic validation
    }
    const updatedDiscounts = [...(localSettings.discounts || []), newDiscount];
    handleSettingChange("discounts", updatedDiscounts);
    setNewDiscount({ productId: "", percentage: 0 });
  };

  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name })),
    [products]
  );

  const getProductName = (productId: string) => {
    if (productId === "ALL") return t("globalDiscount");
    return products.find((p) => p.id === productId)?.name || productId;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          {t("settings")}
        </h1>
        <p className="mt-1 text-text-secondary">{t("overview")}</p>
      </div>

      {/* General Settings */}
      <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          {t("generalSettings")}
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              {t("language")}
            </label>
            <select
              id="language"
              value={localSettings.language}
              onChange={(e) => handleSettingChange("language", e.target.value)}
              className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
            >
              <option value="ar">{t("arabic")}</option>
              <option value="en">{t("english")}</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="theme"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              {t("theme")}
            </label>
            <select
              id="theme"
              value={localSettings.theme}
              onChange={(e) => handleSettingChange("theme", e.target.value)}
              className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
            >
              <option value="light">{t("light")}</option>
              <option value="dark">{t("dark")}</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="numberFormat"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              {t("numberFormat")}
            </label>
            <select
              id="numberFormat"
              value={localSettings.numberFormat}
              onChange={(e) =>
                handleSettingChange("numberFormat", e.target.value)
              }
              className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
            >
              <option value="ar">{t("arabicNumbers")}</option>
              <option value="en">{t("latinNumbers")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          {t("financialSettings")}
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="profitMarginILS"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              {t("profitMarginILS")}
            </label>
            <input
              type="number"
              id="profitMarginILS"
              value={localSettings.profitMarginILS}
              onChange={(e) =>
                handleSettingChange(
                  "profitMarginILS",
                  parseFloat(e.target.value) || 0
                )
              }
              className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
            />
            <p className="mt-2 text-xs text-text-secondary">
              {t("profitMarginNote")}
            </p>
          </div>
        </div>
      </div>

      {/* Discounts Settings */}
      <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          {t("discounts")}
        </h2>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {t("currentDiscounts")}
          </h3>
          {(localSettings.discounts || []).length > 0 ? (
            <ul className="space-y-2">
              {(localSettings.discounts || []).map((discount, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-3 bg-card-secondary rounded-lg"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {getProductName(discount.productId)}
                    </p>
                    <p className="text-sm text-accent">
                      -{discount.percentage}%
                    </p>
                  </div>
                  <button
                    onClick={() => removeDiscount(discount.productId)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-500/10 transition-colors"
                  >
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
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-center py-4">
              {t("noDiscounts")}
            </p>
          )}
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {t("addNewDiscount")}
          </h3>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow w-full">
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t("selectProduct")}
              </label>
              <SearchableSelect
                options={productOptions}
                value={newDiscount.productId}
                onChange={(value) =>
                  setNewDiscount((prev) => ({ ...prev, productId: value }))
                }
                placeholder={t("searchForProduct")}
                staticOption={{ value: "ALL", label: t("allProducts") }}
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t("discountPercentage")}
              </label>
              <input
                type="number"
                value={newDiscount.percentage || ""}
                onChange={(e) =>
                  setNewDiscount((prev) => ({
                    ...prev,
                    percentage: parseInt(e.target.value, 10) || 0,
                  }))
                }
                placeholder="e.g. 15"
                min="1"
                max="100"
                className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
              />
            </div>
            <button
              onClick={handleAddDiscount}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover transition-colors"
            >
              {t("addDiscount")}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-4">
        {statusMessage && (
          <p
            className={`text-sm ${
              statusMessage.type === "success"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {statusMessage.text}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="px-8 py-3 rounded-lg font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isUpdating ? (
            <>
              <ButtonSpinner /> {t("saving")}
            </>
          ) : (
            t("saveChanges")
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
