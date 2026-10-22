import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  type Product,
  type Coupon,
  type StoreInfo,
  type HeroInfo,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_STORE_INFO,
  INITIAL_HERO,
} from '../data/menu';
import { supabase } from '../lib/supabase';

interface StoreContextType {
  products: Product[];
  coupons: Coupon[];
  storeInfo: StoreInfo;
  heroInfo: HeroInfo;
  activeCouponsCount: number;

  // Produtos
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  // Cupons
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateCoupon: (coupon: Coupon) => Promise<{ success: boolean; error?: string }>;
  deleteCoupon: (couponId: string) => Promise<void>;
  validateCoupon: (code: string, currentTotal: number) => { valid: boolean; coupon?: Coupon; discount: number; message: string };

  // Configurações
  updateStoreInfo: (info: Partial<StoreInfo>) => Promise<void>;
  updateHeroInfo: (info: Partial<HeroInfo>) => Promise<void>;
  resetToDefaults: () => void;

  // Upload de Imagens
  processImageFile: (file: File) => Promise<string>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'charneski_products_v2',
  COUPONS: 'charneski_coupons_v2',
  STORE_INFO: 'charneski_store_info_v2',
  HERO_INFO: 'charneski_hero_info_v2',
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
      return saved ? { ...INITIAL_STORE_INFO, ...JSON.parse(saved) } : INITIAL_STORE_INFO;
    } catch {
      return INITIAL_STORE_INFO;
    }
  });

  const [heroInfo, setHeroInfo] = useState<HeroInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HERO_INFO);
      return saved ? { ...INITIAL_HERO, ...JSON.parse(saved) } : INITIAL_HERO;
    } catch {
      return INITIAL_HERO;
    }
  });

  // Salvar no localStorage sempre que houver alterações
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Falha ao salvar produtos no localStorage:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    } catch (e) {
      console.warn('Falha ao salvar cupons no localStorage:', e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(storeInfo));
    } catch (e) {
      console.warn('Falha ao salvar storeInfo no localStorage:', e);
    }
  }, [storeInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HERO_INFO, JSON.stringify(heroInfo));
    } catch (e) {
      console.warn('Falha ao salvar heroInfo no localStorage:', e);
    }
  }, [heroInfo]);

  // Tentativa opcional de sincronização inicial com o Supabase (se as tabelas existirem)
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: dbProducts } = await supabase.from('charneski_products').select('*');
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts as Product[]);
        }

        const { data: dbCoupons } = await supabase.from('charneski_coupons').select('*');
        if (dbCoupons && dbCoupons.length > 0) {
          setCoupons(dbCoupons as Coupon[]);
        }
      } catch (err) {
        // Silencioso se o supabase ainda não estiver com tabelas migradas
        console.info('Supabase sync standby:', err);
      }
    }
    loadFromSupabase();
  }, []);

  const activeCouponsCount = coupons.filter((c) => c.isActive).length;

  // Processar arquivo de imagem (PNG, JPG, WebP) para Data URL otimizada
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('O arquivo selecionado não é uma imagem válida.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) {
          reject(new Error('Erro ao ler a imagem.'));
          return;
        }

        // Criar imagem temporária para redimensionamento otimizado se for muito grande
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            resolve(canvas.toDataURL(format, 0.9));
          } else {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Funções de Produtos
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Funções de Cupons
  const addCoupon = async (
    couponData: Omit<Coupon, 'id'>
  ): Promise<{ success: boolean; error?: string }> => {
    const codeClean = couponData.code.trim().toUpperCase();

    if (!codeClean) {
      return { success: false, error: 'O código do cupom não pode ficar vazio.' };
    }

    if (coupons.some((c) => c.code.toUpperCase() === codeClean)) {
      return { success: false, error: 'Já existe um cupom com esse código.' };
    }

    if (couponData.isActive && activeCouponsCount >= 10) {
      return {
        success: false,
        error: 'Limite máximo de 10 cupons ativos atingido. Desative algum cupom antes.',
      };
    }

    const newCoupon: Coupon = {
      ...couponData,
      id: `cupom-${Date.now()}`,
      code: codeClean,
    };

    setCoupons((prev) => [...prev, newCoupon]);
    return { success: true };
  };

  const updateCoupon = async (
    updated: Coupon
  ): Promise<{ success: boolean; error?: string }> => {
    const codeClean = updated.code.trim().toUpperCase();

    if (!codeClean) {
      return { success: false, error: 'O código do cupom não pode ficar vazio.' };
    }

    const duplicate = coupons.find(
      (c) => c.id !== updated.id && c.code.toUpperCase() === codeClean
    );
    if (duplicate) {
      return { success: false, error: 'Já existe outro cupom com esse mesmo código.' };
    }

    const oldCoupon = coupons.find((c) => c.id === updated.id);
    if (!oldCoupon?.isActive && updated.isActive && activeCouponsCount >= 10) {
      return {
        success: false,
        error: 'Limite máximo de 10 cupons ativos atingido.',
      };
    }

    setCoupons((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...updated, code: codeClean } : c))
    );
    return { success: true };
  };

  const deleteCoupon = async (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
  };

  const validateCoupon = (
    rawCode: string,
    currentTotal: number
  ): { valid: boolean; coupon?: Coupon; discount: number; message: string } => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { valid: false, discount: 0, message: 'Digite um código de cupom.' };
    }

    const found = coupons.find((c) => c.code.toUpperCase() === code);
    if (!found) {
      return { valid: false, discount: 0, message: 'Cupom não encontrado ou inválido.' };
    }

    if (!found.isActive) {
      return { valid: false, discount: 0, message: 'Este cupom não está mais ativo.' };
    }

    if (found.minOrderValue && currentTotal < found.minOrderValue) {
      const diff = found.minOrderValue - currentTotal;
      return {
        valid: false,
        coupon: found,
        discount: 0,
        message: `Válido para pedidos a partir de R$ ${found.minOrderValue.toFixed(2)}. Faltam R$ ${diff.toFixed(2)}.`,
      };
    }

    let calculatedDiscount = 0;
    if (found.type === 'percentage') {
      calculatedDiscount = (currentTotal * found.value) / 100;
    } else {
      calculatedDiscount = Math.min(found.value, currentTotal);
    }

    return {
      valid: true,
      coupon: found,
      discount: calculatedDiscount,
      message: `Cupom ${found.code} aplicado com sucesso!`,
    };
  };

  // Configurações
  const updateStoreInfo = async (info: Partial<StoreInfo>) => {
    setStoreInfo((prev) => ({ ...prev, ...info }));
  };

  const updateHeroInfo = async (info: Partial<HeroInfo>) => {
    setHeroInfo((prev) => ({ ...prev, ...info }));
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCoupons(INITIAL_COUPONS);
    setStoreInfo(INITIAL_STORE_INFO);
    setHeroInfo(INITIAL_HERO);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.COUPONS);
    localStorage.removeItem(STORAGE_KEYS.STORE_INFO);
    localStorage.removeItem(STORAGE_KEYS.HERO_INFO);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        coupons,
        storeInfo,
        heroInfo,
        activeCouponsCount,
        addProduct,
        updateProduct,
        deleteProduct,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
        updateStoreInfo,
        updateHeroInfo,
        resetToDefaults,
        processImageFile,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
}
