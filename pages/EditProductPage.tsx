

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';

const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById, updateProduct, t, categories, exchangeRate, isUpdating } = useAppContext();
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
        
        if (exchangeRate > 0) {
            setMemberPriceUSD(parseFloat((existingProduct.memberPrice / exchangeRate).toFixed(2)));
            setNormalPriceUSD(parseFloat((existingProduct.price / exchangeRate).toFixed(2)));
        }

    } else {
      navigate('/admin/products');
    }
  }, [productId, getProductById, navigate, exchangeRate]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !categoryId || memberPriceUSD <= 0 || normalPriceUSD <= 0) {
      setError(t('errorFillAllFields'));
      return;
    }
    
    setError('');

    const normalPriceILS = Math.round((normalPriceUSD * exchangeRate) * 100) / 100;
    const memberPriceILS = Math.round((memberPriceUSD * exchangeRate) * 100) / 100;
    
    if (!product) return;

    const success = await updateProduct({
      ...product,
      name,
      categoryId,
      description,
      price: normalPriceILS,
      memberPrice: memberPriceILS,
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
            <div className="w-16 h-16 border-4 border-t-4 border-t-green-600 border-slate-200 dark:border-slate-700 rounded-full animate-spin"></div>
        </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('editProduct')}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{t('enterProductDetails')}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('productName')}</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500"/>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('category')}</label>
              <select
                id="category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500"
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
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('descriptionOptional')}</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="memberPriceUSD" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('memberPriceUSD')}</label>
              <input type="number" id="memberPriceUSD" value={memberPriceUSD || ''} placeholder="0.00" onChange={e => setMemberPriceUSD(parseFloat(e.target.value) || 0)} required min="0.01" step="0.01" className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500"/>
            </div>
            <div>
              <label htmlFor="normalPriceUSD" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('normalPriceUSD')}</label>
              <input type="number" id="normalPriceUSD" value={normalPriceUSD || ''} placeholder="0.00" onChange={e => setNormalPriceUSD(parseFloat(e.target.value) || 0)} required min="0.01" step="0.01" className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500"/>
            </div>
          </div>

          <div>
              <label htmlFor="points" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('points')}</label>
              <input type="number" id="points" value={points || ''} placeholder="0" onChange={e => setPoints(parseInt(e.target.value, 10) || 0)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('productImage')}</label>
            <div className="mt-2 flex items-center gap-x-4">
              <div className="h-24 w-24 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {imageUrl ? (
                    <img src={imageUrl} alt={t('preview')} className="h-full w-full object-contain" />
                ) : (
                    <svg className="h-12 w-12 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('changeImage')}
              </button>
            </div>
             <p className="text-xs text-slate-500 mt-2">{t('autoImageNote')}</p>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
             <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2 rounded-md text-sm font-medium bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                {t('cancel')}
              </button>
              <button type="submit" disabled={isUpdating} className="px-6 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                {isUpdating ? t('saving') : t('saveChanges')}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;