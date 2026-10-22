import React, { useState, useRef } from 'react';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Check,
  Tag,
  Store,
  Image as ImageIcon,
  Database,
  Eye,
  EyeOff,
  AlertCircle,
  Copy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { type Product, type Coupon, type PresentationOption } from '../data/menu';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const {
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
    updateStoreInfo,
    updateHeroInfo,
    resetToDefaults,
    processImageFile,
  } = useStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'coupons' | 'store' | 'hero' | 'database'>('products');
  const [toast, setToast] = useState<string | null>(null);

  // Estados de formulário de Produto
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [prodForm, setProdForm] = useState<{
    name: string;
    tagline: string;
    description: string;
    category: string;
    image: string;
    available: boolean;
    ingredientsBadge: string;
    options: PresentationOption[];
  }>({
    name: '',
    tagline: '',
    description: '',
    category: 'Palha Italiana',
    image: '/images/palha-real-2.jpg',
    available: true,
    ingredientsBadge: 'Chocolate nobre & Leite Ninho',
    options: [
      { id: 'opt-1', name: 'Opção 1 — R$ 10,00', description: 'Tamanho tradicional', price: 10, images: [] },
      { id: 'opt-2', name: 'Opção 2 — R$ 15,00', description: 'Porção especial', price: 15, images: [] },
    ],
  });

  // Estados de formulário de Cupom
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<{
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderValue: number;
    isActive: boolean;
  }>({
    code: '',
    description: '',
    type: 'percentage',
    value: 10,
    minOrderValue: 20,
    isActive: true,
  });

  // Configurações da Loja
  const [storeForm, setStoreForm] = useState({ ...storeInfo });
  // Configurações do Hero
  const [heroForm, setHeroForm] = useState({ ...heroInfo });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (!isOpen) return null;

  // 1. TELA DE LOGIN / PIN
  if (!isAuthenticated) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (pinInput.trim() === storeInfo.adminPin || pinInput.trim() === 'charneski321On') {
        setIsAuthenticated(true);
        setPinError('');
      } else {
        setPinError('Senha de administradora incorreta.');
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#000]/70 backdrop-blur-xs" onClick={onClose} />
        <div className="modal-enter relative w-full max-w-sm bg-[#24130A] text-[#F7EEDC] rounded-2xl shadow-2xl border-2 border-[#54321C] p-6 sm:p-8 z-10 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#D4AF7C] hover:text-[#F7EEDC]"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

          <div className="w-14 h-14 rounded-full bg-[#331C0F] text-[#D4AF7C] flex items-center justify-center mx-auto mb-4 border border-[#D4AF7C]/40">
            <Lock size={24} />
          </div>

          <h3 className="font-serif text-2xl font-bold text-[#F7EEDC]">Área Administrativa</h3>
          <p className="text-xs text-[#E8D7B7]/75 mt-1 mb-6">
            Insira a senha de administradora da Charneski Doces para gerenciar produtos, cupons e dados da loja.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Senha de acesso..."
                className="w-full px-4 py-3 rounded-xl border border-[#54321C] bg-[#1A0E07] text-sm text-[#F7EEDC] placeholder-[#8B5E3C] focus:outline-none focus:border-[#D4AF7C]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF7C]"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {pinError && <p className="text-red-400 text-xs">{pinError}</p>}

            <button
              type="submit"
              className="w-full bg-[#E8D7B7] hover:bg-[#F7EEDC] text-[#3A2214] py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Acessar Painel
            </button>
          </form>

          <p className="text-[10px] text-[#8B5E3C] mt-4">
            Área restrita à gestão da confeitaria.
          </p>
        </div>
      </div>
    );
  }

  // 2. PAINEL PRINCIPAL
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      tagline: 'Artesanal',
      description: '',
      category: 'Palha Italiana',
      image: '/images/palha-real-2.jpg',
      available: true,
      ingredientsBadge: 'Chocolate nobre & Leite Ninho',
      options: [
        { id: `opt-${Date.now()}-1`, name: 'Opção 1 — R$ 10,00', description: 'Tamanho tradicional', price: 10, images: [] },
        { id: `opt-${Date.now()}-2`, name: 'Opção 2 — R$ 15,00', description: 'Porção especial', price: 15, images: [] },
      ],
    });
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name,
      tagline: prod.tagline || '',
      description: prod.description,
      category: prod.category || 'Palha Italiana',
      image: prod.image,
      available: prod.available,
      ingredientsBadge: prod.ingredientsBadge || '',
      options:
        prod.options && prod.options.length > 0
          ? prod.options.map((o) => ({
              ...o,
              images: o.images && o.images.length > 0 ? [...o.images] : (o.id === 'opcao-padrao-10' || o.price === 10 ? ['/images/palha-real-2.jpg', '/images/palha-real-1.jpg'] : o.id === 'opcao-especial-15' || o.price === 15 ? ['/images/palha-real-3.jpg', '/images/palha-real-1.jpg'] : [prod.image]),
            }))
          : [{ id: 'opt-1', name: 'Unidade Tradicional', price: 10, images: [] }],
    });
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim()) {
      alert('Informe o nome do produto.');
      return;
    }

    if (editingProduct) {
      const updatedProduct = {
        ...editingProduct,
        ...prodForm,
      };
      delete (updatedProduct as any).images;
      await updateProduct(updatedProduct);
      showNotification(`Produto "${prodForm.name}" atualizado com sucesso!`);
    } else {
      await addProduct({
        ...prodForm,
      });
      showNotification(`Novo produto "${prodForm.name}" cadastrado!`);
    }

    setIsProductFormOpen(false);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      setProdForm((prev) => ({ ...prev, image: dataUrl }));
      showNotification('Foto do produto carregada!');
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagem');
    }
  };

  const handleOptionImagesUpload = async (
    optIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await processImageFile(file);
        newImages.push(dataUrl);
      }

      if (newImages.length === 0) return;

      setProdForm((prev) => ({
        ...prev,
        options: prev.options.map((opt, i) =>
          i === optIdx
            ? { ...opt, images: [...(opt.images || []), ...newImages] }
            : opt
        ),
      }));

      showNotification(`${newImages.length} foto(s) adicionada(s) à apresentação!`);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagens da apresentação');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveOptionImage = (optIdx: number, imgIdx: number) => {
    setProdForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => {
        if (i !== optIdx) return opt;
        return {
          ...opt,
          images: (opt.images || []).filter((_, idx) => idx !== imgIdx),
        };
      }),
    }));
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      setHeroForm((prev) => ({ ...prev, image: dataUrl }));
      showNotification('Nova foto da seção principal pronta!');
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagem');
    }
  };

  // Funções de Cupom
  const handleOpenNewCoupon = () => {
    if (activeCouponsCount >= 10) {
      alert('Limite máximo de 10 cupons ativos atingido. Desative ou exclua um cupom antes.');
      return;
    }
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      description: '',
      type: 'percentage',
      value: 10,
      minOrderValue: 0,
      isActive: true,
    });
    setIsCouponFormOpen(true);
  };

  const handleEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      description: c.description,
      type: c.type,
      value: c.value,
      minOrderValue: c.minOrderValue || 0,
      isActive: c.isActive,
    });
    setIsCouponFormOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      alert('Informe o código do cupom.');
      return;
    }

    if (editingCoupon) {
      const res = await updateCoupon({
        ...editingCoupon,
        ...couponForm,
      });
      if (!res.success) {
        alert(res.error);
        return;
      }
      showNotification(`Cupom ${couponForm.code.toUpperCase()} atualizado!`);
    } else {
      const res = await addCoupon({
        ...couponForm,
      });
      if (!res.success) {
        alert(res.error);
        return;
      }
      showNotification(`Cupom ${couponForm.code.toUpperCase()} criado!`);
    }
    setIsCouponFormOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-[#3A2214]/65 backdrop-blur-xs" onClick={onClose} />

      <div className="modal-enter relative w-full h-full min-h-screen bg-[#F7EEDC] flex flex-col z-10 overflow-hidden">
        {/* Cabeçalho do Painel */}
        <div className="p-5 sm:p-6 border-b border-[#E8D7B7] flex items-center justify-between bg-[#F7EEDC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3A2214] text-[#D4AF7C] flex items-center justify-center border border-[#D4AF7C]/40">
              <Store size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C] block">
                Painel da Confeitaria
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3A2214]">
                Administração Charneski Doces
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E8D7B7] text-[#3A2214] transition-colors"
            aria-label="Fechar painel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-[#E8D7B7] bg-[#E8D7B7]/30 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 sm:px-6 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-[#3A2214] text-[#3A2214] bg-[#F7EEDC]'
                : 'border-transparent text-[#8B5E3C] hover:text-[#3A2214]'
            }`}
          >
            <span>🍫 Produtos</span>
            <span className="bg-[#3A2214] text-[#D4AF7C] text-[10px] px-2 py-0.5 rounded-full font-bold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 sm:px-6 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'coupons'
                ? 'border-[#3A2214] text-[#3A2214] bg-[#F7EEDC]'
                : 'border-transparent text-[#8B5E3C] hover:text-[#3A2214]'
            }`}
          >
            <Tag size={14} />
            <span>Cupons</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeCouponsCount >= 10
                  ? 'bg-red-700 text-white'
                  : 'bg-[#3A2214] text-[#D4AF7C]'
              }`}
            >
              {activeCouponsCount}/10
            </span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 sm:px-6 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'store'
                ? 'border-[#3A2214] text-[#3A2214] bg-[#F7EEDC]'
                : 'border-transparent text-[#8B5E3C] hover:text-[#3A2214]'
            }`}
          >
            <Store size={14} />
            <span>Dados da Loja</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 sm:px-6 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'hero'
                ? 'border-[#3A2214] text-[#3A2214] bg-[#F7EEDC]'
                : 'border-transparent text-[#8B5E3C] hover:text-[#3A2214]'
            }`}
          >
            <ImageIcon size={14} />
            <span>Seção Principal</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 sm:px-6 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'database'
                ? 'border-[#3A2214] text-[#3A2214] bg-[#F7EEDC]'
                : 'border-transparent text-[#8B5E3C] hover:text-[#3A2214]'
            }`}
          >
            <Database size={14} />
            <span>Supabase</span>
          </button>
        </div>

        {/* Notificação Toast */}
        {toast && (
          <div className="bg-[#3A2214] text-[#F7EEDC] text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-[#D4AF7C]/30">
            <Check size={14} className="text-[#D4AF7C]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* ============================================================== */}
          {/* ABA 1: PRODUTOS */}
          {/* ============================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#3A2214]">
                    Cardápio de Produtos
                  </h3>
                  <p className="text-xs text-[#3A2214]/70">
                    Cadastre novos sabores, edite apresentações, preços ou exclua itens.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewProduct}
                  className="inline-flex items-center gap-2 bg-[#3A2214] text-[#F7EEDC] px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#8B5E3C] transition-colors shadow-sm"
                >
                  <Plus size={15} className="text-[#D4AF7C]" />
                  <span>Novo Produto</span>
                </button>
              </div>

              {/* Lista de Produtos */}
              <div className="grid grid-cols-1 gap-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 sm:p-5 rounded-xl border border-[#E8D7B7] bg-[#E8D7B7]/25 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#D4AF7C]/40 bg-[#E8D7B7]"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-[#3A2214]">
                            {prod.name}
                          </h4>
                          {!prod.available && (
                            <span className="bg-red-100 text-red-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                              Indisponível
                            </span>
                          )}
                          <span className="bg-[#3A2214] text-[#D4AF7C] text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            {prod.tagline}
                          </span>
                        </div>
                        <p className="text-xs text-[#3A2214]/70 mt-1 max-w-lg line-clamp-2">
                          {prod.description}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {prod.options?.map((opt) => (
                            <span
                              key={opt.id}
                              className="text-[11px] bg-[#F7EEDC] px-2.5 py-0.5 rounded border border-[#E8D7B7] font-semibold text-[#8B5E3C]"
                            >
                              {opt.name}: R$ {opt.price.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleEditProduct(prod)}
                        className="p-2.5 rounded-lg border border-[#E8D7B7] bg-[#F7EEDC] text-[#3A2214] hover:bg-[#E8D7B7] transition-colors"
                        title="Editar produto"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (products.length <= 1) {
                            alert('Você deve manter pelo menos 1 produto no cardápio.');
                            return;
                          }
                          if (confirm(`Excluir o produto "${prod.name}"?`)) {
                            deleteProduct(prod.id);
                            showNotification('Produto excluído.');
                          }
                        }}
                        className="p-2.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal de Formulário de Produto */}
              {isProductFormOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 overflow-y-auto">
                  <div
                    className="fixed inset-0 bg-[#3A2214]/70 backdrop-blur-xs"
                    onClick={() => setIsProductFormOpen(false)}
                  />
                  <div className="modal-enter relative w-full max-w-xl bg-[#F7EEDC] rounded-2xl shadow-2xl border-2 border-[#E8D7B7] p-6 z-10 max-h-[88vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E8D7B7]">
                      <h4 className="font-serif font-bold text-lg text-[#3A2214]">
                        {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
                      </h4>
                      <button
                        onClick={() => setIsProductFormOpen(false)}
                        className="text-[#8B5E3C]"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                            Nome do Produto *
                          </label>
                          <input
                            type="text"
                            required
                            value={prodForm.name}
                            onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                            placeholder="Ex: Palha Italiana Tradicional"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                          />
                        </div>

                        <div>
                          <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                            Etiqueta / Slogan
                          </label>
                          <input
                            type="text"
                            value={prodForm.tagline}
                            onChange={(e) => setProdForm({ ...prodForm, tagline: e.target.value })}
                            placeholder="Ex: Enrolada no Ninho"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                          Descrição
                        </label>
                        <textarea
                          rows={2}
                          value={prodForm.description}
                          onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                          placeholder="Descrição saborosa do produto..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214] resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                            Categoria
                          </label>
                          <input
                            type="text"
                            value={prodForm.category}
                            onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                          />
                        </div>

                        <div>
                          <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                            Selo de Ingredientes
                          </label>
                          <input
                            type="text"
                            value={prodForm.ingredientsBadge}
                            onChange={(e) => setProdForm({ ...prodForm, ingredientsBadge: e.target.value })}
                            placeholder="Ex: Chocolate nobre & Leite Ninho"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                          />
                        </div>
                      </div>

                      {/* Upload de Foto */}
                      <div>
                        <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1.5">
                          Foto do Produto (PNG ou JPG)
                        </label>
                        <div className="flex items-center gap-4">
                          <img
                            src={prodForm.image}
                            alt="Prévia"
                            className="w-20 h-20 rounded-xl object-cover border border-[#D4AF7C] bg-[#E8D7B7]"
                          />
                          <div className="space-y-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/png, image/jpeg, image/webp"
                              className="hidden"
                              onChange={handleProductImageUpload}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex items-center gap-2 bg-[#3A2214] text-[#F7EEDC] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#8B5E3C]"
                            >
                              <Upload size={14} className="text-[#D4AF7C]" />
                              <span>Escolher Imagem (PNG/JPG)</span>
                            </button>
                            <p className="text-[11px] text-[#3A2214]/60">
                              Otimização automática de tamanho e proporção.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Opções de Apresentação e Preço */}
                      <div className="pt-2 border-t border-[#E8D7B7] space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <label className="text-xs uppercase font-bold text-[#8B5E3C] block">
                              Apresentações, Preços e Galerias de Fotos
                            </label>
                            <span className="text-[11px] text-[#3A2214]/70">
                              Cada opção pode ter sua própria galeria de fotos independente.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setProdForm((prev) => ({
                                ...prev,
                                options: [
                                  ...prev.options,
                                  {
                                    id: `opt-${Date.now()}`,
                                    name: `Opção ${prev.options.length + 1}`,
                                    description: '',
                                    price: 10,
                                    images: [],
                                  },
                                ],
                              }));
                            }}
                            className="text-xs font-semibold text-[#8B5E3C] hover:text-[#3A2214] flex items-center gap-1 shrink-0"
                          >
                            <Plus size={13} />
                            <span>Adicionar Opção</span>
                          </button>
                        </div>

                        {prodForm.options.map((opt, idx) => {
                          const optImages = opt.images || [];
                          return (
                            <div
                              key={opt.id}
                              className="p-3 sm:p-4 rounded-xl border border-[#E8D7B7] bg-[#E8D7B7]/20 space-y-3"
                            >
                              {/* Linha principal: Nome, Preço, Excluir opção */}
                              <div className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-6">
                                  <label className="text-[10px] uppercase font-bold text-[#8B5E3C] block mb-1">
                                    Nome da Apresentação
                                  </label>
                                  <input
                                    type="text"
                                    value={opt.name}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setProdForm((prev) => ({
                                        ...prev,
                                        options: prev.options.map((o, i) =>
                                          i === idx ? { ...o, name: val } : o
                                        ),
                                      }));
                                    }}
                                    placeholder="Ex: Opção 1 — R$ 10,00"
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8D7B7] bg-[#F7EEDC] text-xs font-semibold text-[#3A2214]"
                                  />
                                </div>

                                <div className="col-span-4 flex flex-col justify-end">
                                  <label className="text-[10px] uppercase font-bold text-[#8B5E3C] block mb-1">
                                    Preço
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-[#8B5E3C] font-bold">R$</span>
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={opt.price}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setProdForm((prev) => ({
                                          ...prev,
                                          options: prev.options.map((o, i) =>
                                            i === idx ? { ...o, price: val } : o
                                          ),
                                        }));
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8D7B7] bg-[#F7EEDC] text-xs font-bold text-[#3A2214]"
                                    />
                                  </div>
                                </div>

                                <div className="col-span-2 text-right pt-3">
                                  {prodForm.options.length > 1 && (
                                    <button
                                      type="button"
                                      title="Excluir apresentação"
                                      onClick={() => {
                                        setProdForm((prev) => ({
                                          ...prev,
                                          options: prev.options.filter((_, i) => i !== idx),
                                        }));
                                      }}
                                      className="text-red-700 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Galeria de Fotos da Apresentação */}
                              <div className="pt-2 border-t border-[#E8D7B7]/60">
                                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <ImageIcon size={13} className="text-[#8B5E3C]" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B5E3C]">
                                      Fotos desta opção
                                    </span>
                                    <span className="text-[10px] bg-[#3A2214] text-[#D4AF7C] px-1.5 py-0.5 rounded-full font-semibold">
                                      {optImages.length}
                                    </span>
                                  </div>

                                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3A2214] bg-[#F7EEDC] hover:bg-[#E8D7B7] border border-[#D4AF7C]/60 px-2.5 py-1 rounded-md transition-colors shadow-2xs">
                                    <Upload size={12} className="text-[#8B5E3C]" />
                                    <span>+ Adicionar Foto(s)</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => handleOptionImagesUpload(idx, e)}
                                    />
                                  </label>
                                </div>

                                {/* Lista de fotos adicionadas */}
                                {optImages.length > 0 ? (
                                  <div className="flex flex-wrap gap-2 items-center">
                                    {optImages.map((imgUrl, imgIdx) => (
                                      <div
                                        key={imgIdx}
                                        className="relative group w-14 h-14 rounded-lg overflow-hidden border border-[#D4AF7C] bg-white shadow-2xs shrink-0"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Opção ${opt.name} foto ${imgIdx + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveOptionImage(idx, imgIdx)}
                                          title="Remover esta foto"
                                          className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full shadow-sm opacity-90 hover:opacity-100 transition-opacity"
                                        >
                                          <X size={11} />
                                        </button>
                                        {imgIdx === 0 && (
                                          <span className="absolute bottom-0 inset-x-0 bg-[#3A2214]/85 text-[#D4AF7C] text-[8px] font-bold text-center py-0.5">
                                            1ª Foto
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-[#3A2214]/65 italic">
                                    Sem fotos específicas nesta opção. Clique em "+ Adicionar Foto(s)" para subir fotos que aparecerão quando o cliente escolher esta opção.
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Disponibilidade */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="prod-available"
                          checked={prodForm.available}
                          onChange={(e) => setProdForm({ ...prodForm, available: e.target.checked })}
                          className="w-4 h-4 accent-[#3A2214]"
                        />
                        <label htmlFor="prod-available" className="text-xs font-semibold text-[#3A2214]">
                          Produto disponível para pedidos
                        </label>
                      </div>

                      <div className="pt-4 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsProductFormOpen(false)}
                          className="px-4 py-2.5 rounded-full text-xs font-semibold uppercase text-[#8B5E3C]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-[#3A2214] text-[#F7EEDC] px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#8B5E3C]"
                        >
                          Salvar Produto
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 2: CUPONS DE DESCONTO */}
          {/* ============================================================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#3A2214]">
                    Cupons de Desconto
                  </h3>
                  <p className="text-xs text-[#3A2214]/70">
                    Crie até 10 cupons ativos para os clientes aplicarem no carrinho.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenNewCoupon}
                  disabled={activeCouponsCount >= 10}
                  className="inline-flex items-center gap-2 bg-[#3A2214] text-[#F7EEDC] px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#8B5E3C] disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Plus size={15} className="text-[#D4AF7C]" />
                  <span>Criar Cupom</span>
                </button>
              </div>

              {activeCouponsCount >= 10 && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>
                    Você atingiu o limite de <strong>10 cupons ativos</strong>. Para criar um novo, desative ou exclua um existente.
                  </span>
                </div>
              )}

              {/* Lista de Cupons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className={`p-4 rounded-xl border transition-all ${
                      coupon.isActive
                        ? 'border-[#D4AF7C] bg-[#E8D7B7]/30'
                        : 'border-[#E8D7B7] bg-[#E8D7B7]/10 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm bg-[#3A2214] text-[#D4AF7C] px-2.5 py-1 rounded-md tracking-wider">
                            {coupon.code}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              coupon.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {coupon.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-xs text-[#3A2214] font-medium mt-2">
                          {coupon.description || 'Desconto no pedido'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditCoupon(coupon)}
                          className="p-1.5 text-[#8B5E3C] hover:text-[#3A2214]"
                          title="Editar cupom"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o cupom "${coupon.code}"?`)) {
                              deleteCoupon(coupon.id);
                              showNotification('Cupom excluído.');
                            }
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800"
                          title="Excluir cupom"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#E8D7B7] flex justify-between items-baseline text-xs">
                      <div>
                        <span className="text-[#8B5E3C] block text-[10px] uppercase font-semibold">
                          Desconto
                        </span>
                        <strong className="text-sm text-[#3A2214]">
                          {coupon.type === 'percentage'
                            ? `${coupon.value}% OFF`
                            : `R$ ${coupon.value.toFixed(2)} OFF`}
                        </strong>
                      </div>

                      {coupon.minOrderValue ? (
                        <span className="text-[11px] text-[#3A2214]/70">
                          Mínimo: R$ {coupon.minOrderValue.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#3A2214]/70">Sem pedido mínimo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal de Formulário de Cupom */}
              {isCouponFormOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                  <div
                    className="fixed inset-0 bg-[#3A2214]/70 backdrop-blur-xs"
                    onClick={() => setIsCouponFormOpen(false)}
                  />
                  <div className="modal-enter relative w-full max-w-md bg-[#F7EEDC] rounded-2xl shadow-2xl border-2 border-[#E8D7B7] p-6 z-10">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E8D7B7]">
                      <h4 className="font-serif font-bold text-base text-[#3A2214]">
                        {editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}
                      </h4>
                      <button onClick={() => setIsCouponFormOpen(false)} className="text-[#8B5E3C]">
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCoupon} className="space-y-4">
                      <div>
                        <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                          Código do Cupom *
                        </label>
                        <input
                          type="text"
                          required
                          value={couponForm.code}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              code: e.target.value.toUpperCase().replace(/\s+/g, ''),
                            })
                          }
                          placeholder="Ex: CHARNESKI10"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm font-mono font-bold uppercase text-[#3A2214]"
                        />
                      </div>

                      <div>
                        <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                          Descrição
                        </label>
                        <input
                          type="text"
                          value={couponForm.description}
                          onChange={(e) =>
                            setCouponForm({ ...couponForm, description: e.target.value })
                          }
                          placeholder="Ex: 10% de desconto na primeira compra"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                            Tipo de Desconto
                          </label>
                          <select
                            value={couponForm.type}
                            onChange={(e) =>
                              setCouponForm({
                                ...couponForm,
                                type: e.target.value as 'percentage' | 'fixed',
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-xs font-semibold text-[#3A2214]"
                          >
                            <option value="percentage">Porcentagem (%)</option>
                            <option value="fixed">Valor Fixo (R$)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                            Valor do Desconto *
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            required
                            min="1"
                            value={couponForm.value}
                            onChange={(e) =>
                              setCouponForm({
                                ...couponForm,
                                value: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm font-bold text-[#3A2214]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                          Pedido Mínimo (R$) <span className="text-[#8B5E3C]/60">(opcional)</span>
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={couponForm.minOrderValue}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              minOrderValue: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0 para sem mínimo"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="coupon-active"
                          checked={couponForm.isActive}
                          onChange={(e) =>
                            setCouponForm({ ...couponForm, isActive: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#3A2214]"
                        />
                        <label htmlFor="coupon-active" className="text-xs font-semibold text-[#3A2214]">
                          Cupom ativo para uso
                        </label>
                      </div>

                      <div className="pt-3 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsCouponFormOpen(false)}
                          className="px-4 py-2 rounded-full text-xs font-semibold uppercase text-[#8B5E3C]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-[#3A2214] text-[#F7EEDC] px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#8B5E3C]"
                        >
                          Salvar Cupom
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 3: DADOS DA LOJA */}
          {/* ============================================================== */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#3A2214]">
                  Configurações Gerais da Marca
                </h3>
                <p className="text-xs text-[#3A2214]/70">
                  Edite o WhatsApp que recebe os pedidos, Instagram, endereço e regra de frete.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateStoreInfo(storeForm);
                  showNotification('Dados da loja atualizados com sucesso!');
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      Nome da Loja
                    </label>
                    <input
                      type="text"
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      Identificação / Slogan
                    </label>
                    <input
                      type="text"
                      value={storeForm.tagline}
                      onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      WhatsApp para Pedidos (apenas números) *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.whatsappNumber}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber: e.target.value })}
                      placeholder="Ex: 5566992288338"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm font-mono text-[#3A2214]"
                    />
                    <p className="text-[10px] text-[#8B5E3C] mt-1">
                      Formato internacional: 55 (Brasil) + DDD + Número.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      WhatsApp Visível no Rodapé
                    </label>
                    <input
                      type="text"
                      value={storeForm.whatsappDisplay}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappDisplay: e.target.value })}
                      placeholder="Ex: (66) 99228-8338"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      Instagram (@)
                    </label>
                    <input
                      type="text"
                      value={storeForm.instagramHandle}
                      onChange={(e) => setStoreForm({ ...storeForm, instagramHandle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      Link Completo do Instagram
                    </label>
                    <input
                      type="url"
                      value={storeForm.instagramUrl}
                      onChange={(e) => setStoreForm({ ...storeForm, instagramUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      Cidade e Estado
                    </label>
                    <input
                      type="text"
                      value={storeForm.city}
                      onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      Senha do Painel ADM
                    </label>
                    <input
                      type="text"
                      value={storeForm.adminPin}
                      onChange={(e) => setStoreForm({ ...storeForm, adminPin: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E8D7B7]">
                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      Mínimo de Unidades para Frete Grátis
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={storeForm.freeDeliveryMinUnits}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          freeDeliveryMinUnits: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                      Texto da Regra de Frete
                    </label>
                    <input
                      type="text"
                      value={storeForm.freeDeliveryRule}
                      onChange={(e) => setStoreForm({ ...storeForm, freeDeliveryRule: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#3A2214] text-[#F7EEDC] px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#8B5E3C] transition-all shadow-md"
                  >
                    Salvar Alterações da Loja
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 4: SEÇÃO HERO */}
          {/* ============================================================== */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#3A2214]">
                  Seção Principal de Destaque (Hero)
                </h3>
                <p className="text-xs text-[#3A2214]/70">
                  Edite a frase de impacto, descrição e a foto principal de abertura.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateHeroInfo(heroForm);
                  showNotification('Seção principal atualizada com sucesso!');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                    Selo Superior
                  </label>
                  <input
                    type="text"
                    value={heroForm.badge}
                    onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214]"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={heroForm.title}
                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm font-serif font-bold text-[#3A2214]"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1">
                    Frase Complementar
                  </label>
                  <textarea
                    rows={3}
                    value={heroForm.subtitle}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8D7B7] bg-[#F7EEDC] text-sm text-[#3A2214] resize-none"
                  />
                </div>

                {/* Upload de Imagem do Hero */}
                <div>
                  <label className="text-xs uppercase font-bold text-[#8B5E3C] block mb-1.5">
                    Foto Principal (PNG ou JPG)
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={heroForm.image}
                      alt="Prévia Hero"
                      className="w-24 h-24 rounded-2xl object-cover border border-[#D4AF7C] bg-[#E8D7B7]"
                    />
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={heroFileInputRef}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleHeroImageUpload}
                      />
                      <button
                        type="button"
                        onClick={() => heroFileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 bg-[#3A2214] text-[#F7EEDC] px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#8B5E3C]"
                      >
                        <Upload size={14} className="text-[#D4AF7C]" />
                        <span>Subir Nova Imagem (PNG/JPG)</span>
                      </button>
                      <p className="text-[11px] text-[#3A2214]/60">
                        Substitui a imagem de destaque do topo da página.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#3A2214] text-[#F7EEDC] px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#8B5E3C] transition-all shadow-md"
                  >
                    Salvar Seção Principal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 5: SUPABASE & CONFIGURAÇÕES AVANÇADAS */}
          {/* ============================================================== */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#3A2214]">
                  Integração Supabase & Banco de Dados
                </h3>
                <p className="text-xs text-[#3A2214]/70">
                  Suas credenciais oficiais do Supabase já estão configuradas no projeto.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#E8D7B7] bg-[#E8D7B7]/25 space-y-3 text-xs">
                <div>
                  <span className="text-[#8B5E3C] font-bold uppercase block text-[10px]">
                    URL do Supabase:
                  </span>
                  <code className="text-[#3A2214] font-mono select-all bg-[#F7EEDC] px-2 py-1 rounded block mt-0.5">
                    {SUPABASE_URL}
                  </code>
                </div>

                <div>
                  <span className="text-[#8B5E3C] font-bold uppercase block text-[10px]">
                    Publishable Key:
                  </span>
                  <code className="text-[#3A2214] font-mono select-all bg-[#F7EEDC] px-2 py-1 rounded block mt-0.5">
                    {SUPABASE_PUBLISHABLE_KEY}
                  </code>
                </div>
              </div>

              {/* Script SQL para copiar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs uppercase font-bold text-[#8B5E3C]">
                    Script SQL para criar as tabelas no Supabase:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      showNotification('Código SQL copiado para a área de transferência!');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#8B5E3C] font-semibold hover:text-[#3A2214]"
                  >
                    <Copy size={13} />
                    <span>Copiar SQL</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={SUPABASE_SQL_SCHEMA}
                  className="w-full p-3 rounded-xl border border-[#E8D7B7] bg-[#3A2214] text-[#F7EEDC] font-mono text-[11px] resize-none"
                />
                <p className="text-[11px] text-[#3A2214]/70">
                  Cole este script no <strong>SQL Editor</strong> do painel Supabase caso queira salvar diretamente na nuvem.
                </p>
              </div>

              {/* Botão de Restaurar Padrões */}
              <div className="pt-4 border-t border-[#E8D7B7] flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-[#3A2214]">Restaurar Dados Originais</h4>
                  <p className="text-[11px] text-[#3A2214]/70">
                    Volta as fotos originais e textos da Charneski Doces.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja realmente restaurar os dados originais?')) {
                      resetToDefaults();
                      setStoreForm(storeInfo);
                      setHeroForm(heroInfo);
                      showNotification('Dados restaurados com sucesso.');
                    }
                  }}
                  className="inline-flex items-center gap-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full text-xs font-semibold"
                >
                  <RotateCcw size={14} />
                  <span>Restaurar Originais</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
