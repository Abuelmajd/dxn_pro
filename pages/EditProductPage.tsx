import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
import ButtonSpinner from '../components/ButtonSpinner';

const resizeImage = (file: File, maxSize: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("FileReader failed to read file."));
            }
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById, updateProduct, t, categories, exchangeRate, isUpdating, settings } = useAppContext();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [memberPriceUSD, setMemberPriceUSD] = useState(0);
  const [normalPriceUSD, setNormalPriceUSD] = useState(0);
  const [points, setPoints] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productId) {
        navigate('/admin/products');
        return;
    }
    const existingProduct = getProductById(productId);
    if (existingProduct) {
        setProduct(existingProduct);
        setName(existingProduct.name);
        setCategoryId(existingProduct.categoryId);
        setDescription(existingProduct.description);
        setImageUrl(existingProduct.imageUrl);
        setPoints(existingProduct.points || 0);
        
        // Prioritize using saved USD prices if they exist
        if (existingProduct.normalPriceUSD && existingProduct.memberPriceUSD) {
            setNormalPriceUSD(existingProduct.normalPriceUSD);
            setMemberPriceUSD(existingProduct.memberPriceUSD);
        } else if (exchangeRate > 0) {
            // Fallback for older products: reverse calculate from ILS price
            const profitMargin = settings.profitMarginILS ?? 0;
            // The price from getProductById includes the profit margin.
            // We must subtract it to get the base ILS price before converting back to USD.
            // Formula: ((Final ILS Price - Profit Margin ILS) / Exchange Rate) - 0.50 USD
            const baseMemberPriceILS = existingProduct.memberPrice - profitMargin;
            const baseNormalPriceILS = existingProduct.price - profitMargin;

            const originalMemberPriceUSD = (baseMemberPriceILS / exchangeRate) - 0.50;
            const originalNormalPriceUSD = (baseNormalPriceILS / exchangeRate) - 0.50;

            // Set to a minimum of 0 to avoid negative numbers in the input if ILS price is low
            setMemberPriceUSD(parseFloat(Math.max(0, originalMemberPriceUSD).toFixed(2)));
            setNormalPriceUSD(parseFloat(Math.max(0, originalNormalPriceUSD).toFixed(2)));
        }

    } else {
      navigate('/admin/products');
    }
  }, [productId, getProductById, navigate, exchangeRate, settings.profitMarginILS]);


  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(t('imageTooLarge'));
        return;
      }
      try {
        setError('');
        const resizedDataUrl = await resizeImage(file, 600);
        setImageUrl(resizedDataUrl);
      } catch (err) {
        console.error('Error resizing image:', err);
        setError(t('imageProcessingError'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !categoryId || !description || memberPriceUSD <= 0 || normalPriceUSD <= 0) {
      setError(t('errorFillAllFields'));
      return;
    }
    
    setError('');

    // 1. Add $0.50 margin to the input USD price for ILS conversion.
    const finalNormalPriceUSD = normalPriceUSD + 0.50;
    const finalMemberPriceUSD = memberPriceUSD + 0.50;

    // 2. Convert to ILS to get the base price. This is what gets saved to the sheet.
    const baseNormalPriceILS = finalNormalPriceUSD * exchangeRate;
    const baseMemberPriceILS = finalMemberPriceUSD * exchangeRate;
    
    if (!product) return;

    const success = await updateProduct({
      ...product,
      name,
      categoryId,
      description,
      price: baseNormalPriceILS, // Save base price (without profit margin)
      memberPrice: baseMemberPriceILS, // Save base price (without profit margin)
      normalPriceUSD: normalPriceUSD, // Save base USD price
      memberPriceUSD: memberPriceUSD, // Save base USD price
      points: points || 0,
      imageUrl: imageUrl || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/400/300`,
    });


    if (success) {
      navigate('/admin/products');
    } else {
      setError("فشل تحديث المنتج. يرجى المحاولة مرة أخرى.");
    }
  };

  if (!product) {
      return (
        <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-card-secondary rounded-full animate-spin"></div>
        </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">{t('editProduct')}</h1>
        <p className="mt-1 text-text-secondary">{t('enterProductDetails')}</p>
      </div>

      <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">{t('productName')}</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"/>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-1">{t('category')}</label>
              <select
                id="category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
              >
                <option value="" disabled>{t('selectOrTypeCategory')}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">{t('descriptionOptional')}</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent" required></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="memberPriceUSD" className="block text-sm font-medium text-text-primary mb-1">{t('memberPriceUSD')}</label>
              <input type="number" id="memberPriceUSD" value={memberPriceUSD || ''} placeholder="0.00" onChange={e => setMemberPriceUSD(parseFloat(e.target.value) || 0)} required min="0.01" step="0.01" className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"/>
            </div>
            <div>
              <label htmlFor="normalPriceUSD" className="block text-sm font-medium text-text-primary mb-1">{t('normalPriceUSD')}</label>
              <input type="number" id="normalPriceUSD" value={normalPriceUSD || ''} placeholder="0.00" onChange={e => setNormalPriceUSD(parseFloat(e.target.value) || 0)} required min="0.01" step="0.01" className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"/>
            </div>
          </div>

          <div>
              <label htmlFor="points" className="block text-sm font-medium text-text-primary mb-1">{t('points')}</label>
              <input type="number" id="points" value={points || ''} placeholder="0" step="0.01" onChange={e => setPoints(parseFloat(e.target.value) || 0)} className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary">{t('productImage')}</label>
            <div className="mt-2 flex items-center gap-x-4">
              <div className="h-24 w-24 overflow-hidden rounded-lg bg-background/50 flex items-center justify-center">
                {imageUrl ? (
                    <img src={imageUrl} alt={t('preview')} className="h-full w-full object-contain" />
                ) : (
                    <svg className="h-12 w-12 text-text-secondary/50" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md bg-input-bg px-3 py-2 text-sm font-semibold text-text-primary shadow-sm ring-1 ring-inset ring-border hover:bg-card-secondary"
              >
                {t('changeImage')}
              </button>
            </div>
             <p className="text-xs text-text-secondary mt-2">{t('autoImageNote')}</p>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-900/30 p-3 rounded-md">{error}</p>}

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
             <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2 rounded-md text-sm font-medium bg-card-secondary text-text-primary hover:bg-border transition-colors">
                {t('cancel')}
              </button>
              <button type="submit" disabled={isUpdating} className="px-6 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                {isUpdating ? <><ButtonSpinner />{t('saving')}</> : t('saveChanges')}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;