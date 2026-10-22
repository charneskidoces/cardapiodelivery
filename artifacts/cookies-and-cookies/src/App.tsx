import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  ArrowRight,
  Check,
  MapPin,
  Sparkles,
  Heart,
  MessageCircle,
  Instagram,
  Bike,
  Store,
  Tag,
  ChevronRight,
  ChevronLeft,
  Navigation,
  Lock,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { type Product, type PresentationOption, type Coupon } from './data/menu';
import { AdminModal } from './components/AdminModal';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  optionId: string;
  optionName: string;
  price: number;
  quantity: number;
  image: string;
}

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

function AppContent() {
  const { products, storeInfo, heroInfo, validateCoupon } = useStore();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [optionImageIndices, setOptionImageIndices] = useState<Record<string, number>>({});
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2800);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalCartValue = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const finalCartValue = Math.max(0, subtotalCartValue - couponDiscount);

  const handleApplyCoupon = (code: string) => {
    const res = validateCoupon(code, subtotalCartValue);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
      showToast(`Cupom ${res.coupon.code} aplicado: - ${formatBRL(res.discount)}!`);
      return { success: true, message: res.message };
    } else {
      return { success: false, message: res.message };
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showToast('Cupom removido.');
  };

  const handleAddToCart = (
    product: Product,
    option: PresentationOption,
    quantity: number,
    customImage?: string
  ) => {
    const itemId = `${product.id}-${option.id}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          productName: product.name,
          optionId: option.id,
          optionName: option.name,
          price: option.price,
          quantity: quantity,
          image: customImage || product.image,
        },
      ];
    });

    if (appliedCoupon) {
      const newSubtotal = subtotalCartValue + option.price * quantity;
      const res = validateCoupon(appliedCoupon.code, newSubtotal);
      if (res.valid) {
        setCouponDiscount(res.discount);
      }
    }

    showToast(`${quantity}x ${product.name} adicionado à sacola!`);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      const newSubtotal = updated.reduce((acc, it) => acc + it.price * it.quantity, 0);
      if (appliedCoupon) {
        const res = validateCoupon(appliedCoupon.code, newSubtotal);
        if (res.valid) {
          setCouponDiscount(res.discount);
        } else {
          setAppliedCoupon(null);
          setCouponDiscount(0);
        }
      }
      return updated;
    });
  };

  const removeCartItem = (itemId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      const newSubtotal = updated.reduce((acc, it) => acc + it.price * it.quantity, 0);
      if (appliedCoupon) {
        const res = validateCoupon(appliedCoupon.code, newSubtotal);
        if (res.valid) {
          setCouponDiscount(res.discount);
        } else {
          setAppliedCoupon(null);
          setCouponDiscount(0);
        }
      }
      return updated;
    });
  };

  const scrollToProducts = () => {
    const el = document.getElementById('cardapio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#24130A] text-[#F7EEDC] flex flex-col font-sans selection:bg-[#8B5E3C] selection:text-[#F7EEDC]">

      {/* Barra superior de destaque (Invertida: clara com texto escuro) */}
      <div className="bg-[#E8D7B7] text-[#3A2214] text-[10px] sm:text-[11px] py-1.5 px-3 text-center tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-xs">
        <Sparkles size={11} className="text-[#8B5E3C] shrink-0" />
        <span className="line-clamp-1">{storeInfo.freeDeliveryRule}</span>
      </div>

      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 bg-[#24130A]/95 backdrop-blur-md border-b border-[#3D2213]">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">

          {/* Logo + Nome — clicável para voltar ao topo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer bg-transparent border-none p-0 text-left active:scale-95 transition-transform duration-150"
            aria-label="Voltar ao início"
          >
            <img
              src="/images/charneski-c-transparent.png"
              alt={storeInfo.name}
              className="w-11 h-11 sm:w-14 sm:h-14 object-contain shrink-0"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(212,175,124,0.40))' }}
            />
            <div className="min-w-0">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#F7EEDC] block leading-tight truncate">
                {storeInfo.name}
              </span>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#D4AF7C] font-semibold block truncate">
                {storeInfo.tagline}
              </span>
            </div>
          </button>

          {/* Botão Sacola (Invertido: claro com texto escuro) */}
          <button
            onClick={() => setIsBagOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 bg-[#E8D7B7] hover:bg-[#F7EEDC] text-[#3A2214] px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-sm shrink-0"
            aria-label="Ver sacola de pedidos"
          >
            <ShoppingBag size={15} className="text-[#3A2214]" />
            <span className="hidden sm:inline">Sacola</span>
            {totalCartCount > 0 && (
              <span className="bg-[#3A2214] text-[#F7EEDC] font-bold text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-pulse shrink-0">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1">

        {/* ===== SEÇÃO HERO ===== */}
        <section className="relative pt-6 pb-0 sm:pt-12 sm:pb-0 px-3 sm:px-6" style={{ backgroundColor: '#F2E8D5' }}>
          <div className="max-w-4xl mx-auto pb-10 sm:pb-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">

              {/* Textos — em mobile fica abaixo da imagem (order-2) */}
              <div className="md:col-span-7 space-y-3 sm:space-y-5 text-center md:text-left fade-up order-2 md:order-1">
                <h1 className="font-serif text-[1.85rem] leading-[1.2] sm:text-5xl lg:text-[3.25rem] font-bold text-[#3A2214] tracking-tight">
                  {heroInfo.title.includes(',') ? (
                    <>
                      {heroInfo.title.split(',')[0]},{' '}
                      <br className="hidden sm:inline" />
                      <span className="italic text-[#7A4A28]">
                        {heroInfo.title.split(',').slice(1).join(',')}
                      </span>
                    </>
                  ) : (
                    heroInfo.title
                  )}
                </h1>

                <p className="text-sm sm:text-base text-[#3A2214]/75 leading-relaxed max-w-md mx-auto md:mx-0">
                  {heroInfo.subtitle}
                </p>

                {/* CTA somente em telas md+ — em mobile já está visível na tela */}
                <button
                  onClick={scrollToProducts}
                  className="hidden md:inline-flex items-center gap-2 bg-[#3A2214] hover:bg-[#24130A] text-[#F2E8D5] px-6 py-3 rounded-full text-xs uppercase tracking-wider font-bold transition-all shadow-md"
                >
                  Ver Cardápio
                  <ChevronRight size={15} className="text-[#F2E8D5]" />
                </button>
              </div>

              {/* Fotografia Principal */}
              <div className="md:col-span-5 fade-up order-1 md:order-2">
                <div className="relative mx-auto max-w-[280px] sm:max-w-sm md:max-w-none">
                  <div className="absolute -inset-1.5 sm:-inset-2 rounded-2xl border border-[#7A4A28]/50 -rotate-1 pointer-events-none" />
                  <div className="relative overflow-hidden rounded-2xl shadow-xl bg-[#331C0F] aspect-[4/5] border border-[#54321C]">
                    <img
                      src={heroInfo.image}
                      alt={`${storeInfo.name} ${storeInfo.tagline}`}
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#24130A]/85 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 text-[#F7EEDC] flex items-center justify-between text-[11px] sm:text-xs">
                      <span className="font-serif italic font-semibold drop-shadow-sm">
                        Enrolada no Ninho
                      </span>
                      <span className="bg-[#24130A]/90 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider border border-[#D4AF7C]/40 text-[#D4AF7C]">
                        100% Artesanal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curva SVG separando hero (claro) do cardápio (escuro) — fora da section para não ter padding */}
        <div style={{ backgroundColor: '#F2E8D5', lineHeight: 0, display: 'block', overflow: 'hidden' }}>
          <svg
            viewBox="0 0 1440 70"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', width: '100%', height: '70px' }}
          >
            <path
              d="M0,0 C360,70 1080,70 1440,0 L1440,70 L0,70 Z"
              fill="#24130A"
            />
          </svg>
        </div>

        {/* ===== SEÇÃO CARDÁPIO ===== */}
        <section id="cardapio" className="pt-8 pb-14 sm:pt-10 sm:pb-16 px-3 sm:px-6 scroll-mt-20">
          <div className="max-w-2xl mx-auto space-y-8 sm:space-y-10">

            {/* Cabeçalho da seção */}
            <div className="text-center">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#D4AF7C] font-semibold block mb-1">
                Nosso Cardápio
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F7EEDC]">
                Escolha o seu doce
              </h2>
              <p className="text-xs sm:text-sm text-[#F7EEDC]/75 mt-1.5 max-w-xs sm:max-w-md mx-auto leading-relaxed">
                Produzido em pequenos lotes para garantir máxima maciez, frescor e sabor inigualável.
              </p>
            </div>

            {/* Cards de Produto */}
            {products.map((product) => {
              const currentSelectedOptionId =
                selectedOptions[product.id] || product.options[0]?.id || '';
              const currentOption =
                product.options.find((o) => o.id === currentSelectedOptionId) ||
                product.options[0];
              const currentQty = productQuantities[product.id] || 1;
              const currentSubtotal = (currentOption?.price || 0) * currentQty;

              const currentImages: string[] =
                currentOption?.images && currentOption.images.length > 0
                  ? currentOption.images
                  : product.images && product.images.length > 0
                    ? product.images
                    : [product.image];

              const optImgKey = `${product.id}-${currentOption?.id || 'default'}`;
              const rawIdx = optionImageIndices[optImgKey] || 0;
              const activeIdx = Math.min(Math.max(0, rawIdx), Math.max(0, currentImages.length - 1));
              const currentImage = currentImages[activeIdx] || product.image;

              return (
                <div
                  key={product.id}
                  className="bg-[#331C0F] rounded-2xl border-2 border-[#54321C] shadow-xl hover:shadow-2xl hover:border-[#D4AF7C]/60 transition-all duration-300 overflow-hidden"
                >
                  {/* Imagem com Galeria por Apresentação */}
                  <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden bg-[#24130A] group">
                    <img
                      key={currentImage}
                      src={currentImage}
                      alt={`${product.name} - ${currentOption?.name || ''}`}
                      className="w-full h-full object-cover object-center transition-all duration-500"
                    />

                    {/* Tagline / Badges */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#24130A]/90 text-[#D4AF7C] text-[9px] sm:text-[10px] uppercase font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-wider border border-[#D4AF7C]/50 shadow-sm">
                        {product.tagline}
                      </span>
                    </div>
                    {product.ingredientsBadge && (
                      <div className="absolute top-3 right-3 z-10 bg-[#24130A]/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium text-[#F7EEDC] border border-[#54321C] shadow-xs">
                        {product.ingredientsBadge}
                      </div>
                    )}

                    {/* Controles de Navegação entre fotos da apresentação selecionada */}
                    {currentImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOptionImageIndices((prev) => ({
                              ...prev,
                              [optImgKey]: (activeIdx - 1 + currentImages.length) % currentImages.length,
                            }));
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#24130A]/85 hover:bg-[#3A2214] text-[#F7EEDC] flex items-center justify-center transition-all shadow-md backdrop-blur-xs z-10 active:scale-95 border border-[#D4AF7C]/30"
                          aria-label="Foto anterior"
                        >
                          <ChevronLeft size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOptionImageIndices((prev) => ({
                              ...prev,
                              [optImgKey]: (activeIdx + 1) % currentImages.length,
                            }));
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#24130A]/85 hover:bg-[#3A2214] text-[#F7EEDC] flex items-center justify-center transition-all shadow-md backdrop-blur-xs z-10 active:scale-95 border border-[#D4AF7C]/30"
                          aria-label="Próxima foto"
                        >
                          <ChevronRight size={18} />
                        </button>

                        {/* Indicadores de fotos da opção */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#24130A]/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#D4AF7C]/40 shadow-sm z-10">
                          {currentImages.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOptionImageIndices((prev) => ({
                                  ...prev,
                                  [optImgKey]: dotIdx,
                                }));
                              }}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                activeIdx === dotIdx
                                  ? 'w-5 bg-[#D4AF7C]'
                                  : 'w-2 bg-[#F7EEDC]/40 hover:bg-[#F7EEDC]'
                              }`}
                              aria-label={`Ver foto ${dotIdx + 1}`}
                            />
                          ))}
                          <span className="text-[10px] text-[#F7EEDC]/80 font-bold ml-1 tracking-wider">
                            {activeIdx + 1}/{currentImages.length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="p-4 sm:p-6 md:p-8 space-y-5 bg-[#E8D7B7] rounded-b-2xl">
                    <div>
                      <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-1 xs:gap-2">
                        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#3A2214] leading-tight">
                          {product.name}
                        </h3>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#3A2214] shrink-0">
                          {formatBRL(currentOption?.price || 0)}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-[#3A2214]/80 leading-relaxed mt-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Seletor de Apresentação */}
                    <div className="space-y-2 pt-2 border-t border-[#3A2214]/20">
                      <label className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[#8B5E3C] block">
                        Selecione a Apresentação:
                      </label>
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                        {product.options.map((opt) => {
                          const isSelected = currentSelectedOptionId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [product.id]: opt.id,
                                }))
                              }
                              className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all relative ${
                                isSelected
                                  ? 'border-[#D4AF7C] bg-[#482815] ring-2 ring-[#D4AF7C]'
                                  : 'border-[#54321C] bg-[#24130A] hover:border-[#D4AF7C]/60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-xs sm:text-sm text-[#F7EEDC] leading-snug">
                                  {opt.name}
                                </span>
                                <span className="text-sm font-bold text-[#D4AF7C] shrink-0">
                                  {formatBRL(opt.price)}
                                </span>
                              </div>
                              {opt.description && (
                                <p className="text-[10px] sm:text-[11px] text-[#E8D7B7]/75 mt-1 line-clamp-2">
                                  {opt.description}
                                </p>
                              )}
                              {opt.badge && (
                                <span className="inline-block mt-1.5 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#D4AF7C] text-[#3A2214]">
                                  {opt.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantidade + Subtotal */}
                    <div className="pt-2 border-t border-[#3A2214]/20 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8B5E3C] font-semibold block mb-1.5">
                          Quantidade
                        </span>
                        <div className="inline-flex items-center rounded-full border border-[#D4AF7C] bg-[#F7EEDC] p-1">
                          <button
                            onClick={() =>
                              setProductQuantities((prev) => ({
                                ...prev,
                                [product.id]: Math.max(1, currentQty - 1),
                              }))
                            }
                            disabled={currentQty <= 1}
                            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-[#E8D7B7] disabled:opacity-30 transition-colors text-[#3A2214]"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 sm:w-9 text-center text-sm font-bold text-[#3A2214]">
                            {currentQty}
                          </span>
                          <button
                            onClick={() =>
                              setProductQuantities((prev) => ({
                                ...prev,
                                [product.id]: currentQty + 1,
                              }))
                            }
                            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-[#E8D7B7] transition-colors text-[#3A2214]"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8B5E3C] font-semibold block">
                          Subtotal
                        </span>
                        <span className="text-xl sm:text-2xl font-serif font-bold text-[#3A2214] block mt-0.5">
                          {formatBRL(currentSubtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Aviso frete grátis */}
                    {currentQty >= storeInfo.freeDeliveryMinUnits && (
                      <div className="bg-[#3A2214]/10 border border-[#D4AF7C]/50 rounded-xl p-3 flex items-center gap-2 text-xs text-[#3A2214]">
                        <Sparkles size={14} className="text-[#8B5E3C] shrink-0" />
                        <span>
                          <strong>Oba!</strong> Você tem direito à <strong>entrega grátis</strong>!
                        </span>
                      </div>
                    )}

                    {/* Botão Adicionar (Invertido: claro com texto escuro) */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product, currentOption, currentQty, currentImage)}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#3A2214] hover:bg-[#24130A] text-[#E8D7B7] py-4 rounded-full text-[11px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.18em] font-bold transition-all shadow-md active:scale-[0.98] touch-manipulation"
                    >
                      <ShoppingBag size={16} className="text-[#E8D7B7] shrink-0" />
                      <span>Adicionar ao pedido • {formatBRL(currentSubtotal)}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== PILARES DA MARCA ===== */}
        <section className="bg-[#1A0E07] border-y border-[#3D2213] py-10 sm:py-12 px-3 sm:px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            {[
              {
                icon: <Heart size={20} />,
                title: 'Feito com Afeto',
                text: 'Receita de família preparada em pequenos lotes artesanais.',
              },
              {
                icon: <Sparkles size={20} />,
                title: 'Ingredientes Selecionados',
                text: 'Chocolate nobre, biscoito fresco e o legítimo leite Ninho.',
              },
              {
                icon: <Bike size={20} />,
                title: 'Entrega Grátis',
                text: `A partir de ${storeInfo.freeDeliveryMinUnits} unidades para adoçar o seu dia.`,
              },
            ].map(({ icon, title, text }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#331C0F] text-[#D4AF7C] flex items-center justify-center shrink-0 border border-[#D4AF7C]/30 shadow-sm">
                  {icon}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#F7EEDC]">{title}</h4>
                  <p className="text-xs sm:text-[13px] text-[#E8D7B7]/80 mt-1 leading-relaxed max-w-[200px] mx-auto">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ===== RODAPÉ (Invertido: fundo claro com texto escuro) ===== */}
      <footer className="bg-[#F7EEDC] text-[#3A2214] pt-10 pb-8 px-3 sm:px-6 border-t-2 border-[#E8D7B7]">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

          {/* Logo + Botões */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-6 border-b border-[#E8D7B7] text-center sm:text-left">
            <div className="flex items-center gap-3">
              <img
                src="/images/charneski-c-transparent.png"
                alt={storeInfo.name}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(212,175,124,0.40))' }}
              />
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#3A2214]">
                  {storeInfo.name}
                </h3>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#8B5E3C] font-semibold">
                  {storeInfo.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={storeInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#E8D7B7]/60 hover:bg-[#E8D7B7] text-[#3A2214] px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase border border-[#8B5E3C]/30 transition-colors touch-manipulation"
              >
                <Instagram size={13} className="text-[#8B5E3C]" />
                <span>Instagram</span>
              </a>
              <a
                href={`https://wa.me/${storeInfo.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#3A2214] hover:bg-[#8B5E3C] text-[#F7EEDC] px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm touch-manipulation"
              >
                <MessageCircle size={13} className="text-[#D4AF7C]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Infos */}
          <div className="flex items-center justify-center gap-2 text-xs text-[#3A2214]/80">
            <MapPin size={13} className="text-[#8B5E3C] shrink-0" />
            <span className="font-medium">{storeInfo.city}</span>
          </div>

          {/* Copyright */}
          <div className="text-center pt-3 border-t border-[#E8D7B7] space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-[#3A2214]/65 font-medium">
              <span>© {new Date().getFullYear()} {storeInfo.name}. Todos os direitos reservados.</span>
              <span className="hidden xs:inline">•</span>
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center gap-1 text-[#8B5E3C] hover:text-[#3A2214] transition-colors underline underline-offset-2 font-semibold"
              >
                <Lock size={11} />
                <span>Painel Administrativo</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== BARRA FLUTUANTE SACOLA (Invertida: clara com texto escuro) ===== */}
      {totalCartCount > 0 && !isBagOpen && !isCheckoutOpen && (
        <div className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 max-w-md mx-auto z-40 fade-up">
          <button
            onClick={() => setIsBagOpen(true)}
            className="w-full bg-[#E8D7B7] text-[#3A2214] px-4 py-3.5 sm:py-4 rounded-full shadow-2xl flex items-center justify-between border-2 border-[#D4AF7C] hover:bg-[#F7EEDC] transition-all touch-manipulation"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative">
                <ShoppingBag size={19} className="text-[#3A2214]" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#3A2214] text-[#F7EEDC] font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-bold">
                Ver Sacola ({totalCartCount} {totalCartCount === 1 ? 'item' : 'itens'})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold font-serif">{formatBRL(finalCartValue)}</span>
              <ChevronRight size={16} className="text-[#8B5E3C]" />
            </div>
          </button>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toastMessage && (
        <div className="fixed top-4 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-50 bg-[#331C0F] text-[#F7EEDC] px-4 sm:px-5 py-3 rounded-full shadow-xl flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wide border border-[#D4AF7C]/40 fade-up max-w-sm mx-auto sm:mx-0">
          <Check size={14} className="text-[#D4AF7C] shrink-0" />
          <span className="line-clamp-1">{toastMessage}</span>
        </div>
      )}

      {/* ===== SACOLA LATERAL ===== */}
      <CartDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeCartItem}
        appliedCoupon={appliedCoupon}
        couponDiscount={couponDiscount}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onCheckout={() => {
          setIsBagOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* ===== CHECKOUT ===== */}
      {isCheckoutOpen && (
        <CheckoutModal
          items={cart}
          appliedCoupon={appliedCoupon}
          couponDiscount={couponDiscount}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSent={() => {
            setCart([]);
            setAppliedCoupon(null);
            setCouponDiscount(0);
            setIsCheckoutOpen(false);
          }}
        />
      )}

      {/* ===== ADMIN ===== */}
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}

// ==========================================
// COMPONENTE: SACOLA LATERAL (CART DRAWER)
// ==========================================
function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  appliedCoupon,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
  onCheckout: () => void;
}) {
  const { storeInfo } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  const hasFreeDelivery = totalUnits >= storeInfo.freeDeliveryMinUnits;
  const finalTotal = Math.max(0, subtotal - couponDiscount);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = onApplyCoupon(couponInput);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#3A2214]/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer — largura total em mobile, max-md em telas maiores */}
      <div className="cart-enter relative w-full sm:max-w-md bg-[#24130A] text-[#F7EEDC] h-full shadow-2xl flex flex-col z-10 border-l border-[#4A2E1B]">

        {/* Cabeçalho */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#4A2E1B] flex items-center justify-between bg-[#24130A]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF7C] block">
              Seu Pedido
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F7EEDC] mt-0.5">Sua Sacola</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#331C0F] text-[#F7EEDC] transition-colors touch-manipulation"
            aria-label="Fechar sacola"
          >
            <X size={20} />
          </button>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#331C0F] flex items-center justify-center text-[#D4AF7C] border border-[#D4AF7C]/30">
                <ShoppingBag size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F7EEDC]">Sacola vazia</h3>
              <p className="text-xs text-[#E8D7B7]/80 max-w-xs leading-relaxed">
                Adicione uma deliciosa palha italiana artesanal para adoçar o seu dia.
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-xs uppercase tracking-wider font-bold bg-[#E8D7B7] hover:bg-[#F7EEDC] text-[#3A2214] px-6 py-3 rounded-full transition-colors touch-manipulation"
              >
                Escolher produto
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 rounded-xl bg-[#331C0F] border border-[#54321C] flex gap-3 items-start"
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-[#24130A] shrink-0 border border-[#D4AF7C]/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-sm text-[#F7EEDC] leading-snug">
                        {item.productName}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[10px] uppercase tracking-wider text-[#D4AF7C]/80 hover:text-red-400 shrink-0 touch-manipulation py-0.5"
                      >
                        Remover
                      </button>
                    </div>
                    <span className="text-[11px] text-[#D4AF7C] font-medium block mt-0.5">
                      {item.optionName}
                    </span>
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-[#D4AF7C]/50 bg-[#24130A] p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#482815] text-[#F7EEDC] transition-colors touch-manipulation"
                          aria-label="Diminuir"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#F7EEDC]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#482815] text-[#F7EEDC] transition-colors touch-manipulation"
                          aria-label="Aumentar"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-bold text-sm text-[#D4AF7C]">
                        {formatBRL(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Cupom */}
              <div className="pt-3 border-t border-[#4A2E1B] space-y-2">
                <label className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[#D4AF7C] flex items-center gap-1.5">
                  <Tag size={12} />
                  <span>Cupom de Desconto</span>
                </label>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-emerald-400 font-semibold">- {formatBRL(couponDiscount)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={onRemoveCoupon}
                      className="text-xs text-emerald-400 hover:text-red-400 underline font-medium touch-manipulation"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCouponSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponMsg(null);
                      }}
                      placeholder="Código do cupom..."
                      className="flex-1 px-3 py-2.5 rounded-xl border border-[#54321C] bg-[#1A0E07] text-xs font-mono uppercase font-semibold text-[#F7EEDC] placeholder-[#8B5E3C] focus:outline-none focus:border-[#D4AF7C] min-w-0"
                    />
                    <button
                      type="submit"
                      className="bg-[#D4AF7C] text-[#3A2214] px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-[#E8D7B7] transition-colors shrink-0 touch-manipulation"
                    >
                      Aplicar
                    </button>
                  </form>
                )}

                {couponMsg && (
                  <p className={`text-[11px] ${couponMsg.isError ? 'text-red-400' : 'text-emerald-400 font-semibold'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Rodapé Sacola */}
        {items.length > 0 && (
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-[#4A2E1B] bg-[#24130A] space-y-3">
            <div className="text-xs flex items-center gap-2 p-2.5 rounded-lg bg-[#331C0F] border border-[#D4AF7C]/30 text-[#F7EEDC]">
              <Bike size={15} className="text-[#D4AF7C] shrink-0" />
              <span>
                {hasFreeDelivery ? (
                  <strong>Parabéns! Você ganhou entrega grátis!</strong>
                ) : (
                  <span>
                    Adicione mais {storeInfo.freeDeliveryMinUnits - totalUnits} unidade{storeInfo.freeDeliveryMinUnits - totalUnits !== 1 ? 's' : ''} para entrega grátis.
                  </span>
                )}
              </span>
            </div>

            <div className="space-y-1 text-xs text-[#F7EEDC]">
              <div className="flex justify-between">
                <span className="text-[#E8D7B7]/80">Subtotal dos itens</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span>- {formatBRL(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-[#4A2E1B]">
                <span className="text-[#D4AF7C] uppercase tracking-wider font-semibold text-xs">Total</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#F7EEDC]">
                  {formatBRL(finalTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onCheckout}
                className="w-full flex items-center justify-center gap-2 bg-[#E8D7B7] hover:bg-[#F7EEDC] text-[#3A2214] py-4 rounded-full text-xs uppercase tracking-[0.15em] sm:tracking-[0.18em] font-bold transition-all shadow-md active:scale-[0.98] touch-manipulation"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight size={15} className="text-[#3A2214]" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs uppercase tracking-wider font-semibold text-[#D4AF7C] hover:text-[#F7EEDC] touch-manipulation"
              >
                Continuar escolhendo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: MODAL DE FINALIZAÇÃO (CHECKOUT)
// ==========================================
function CheckoutModal({
  items,
  appliedCoupon,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
  onClose,
  onOrderSent,
}: {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  onApplyCoupon?: (code: string) => { success: boolean; message: string };
  onRemoveCoupon?: () => void;
  onClose: () => void;
  onOrderSent: () => void;
}) {
  const { storeInfo } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada'>('entrega');
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cupom no Checkout
  const [checkoutCouponInput, setCheckoutCouponInput] = useState('');
  const [checkoutCouponMsg, setCheckoutCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Geolocalização GPS
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    mapsUrl: string;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  const hasFreeDelivery = totalUnits >= storeInfo.freeDeliveryMinUnits;
  const finalTotal = Math.max(0, subtotal - couponDiscount);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Seu navegador não suporta geolocalização.');
      return;
    }
    setIsLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setGpsCoords({ latitude, longitude, accuracy: Math.round(accuracy), mapsUrl });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Permissão negada. Ative a localização no navegador ou informe pelo WhatsApp.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('Sinal de GPS indisponível no momento.');
            break;
          case error.TIMEOUT:
            setGpsError('Tempo esgotado ao buscar localização.');
            break;
          default:
            setGpsError('Não foi possível obter a localização.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) {
      errs.customerName = 'Por favor, informe seu nome para identificarmos seu pedido.';
    }
    // Endereço e GPS são 100% opcionais caso o cliente informe no WhatsApp
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendWhatsApp = () => {
    if (!validate()) return;

    const itemsText = items
      .map(
        (it) =>
          `• *${it.quantity}x* ${it.productName} _(${it.optionName})_ — ${formatBRL(it.price * it.quantity)}`
      )
      .join('\n');

    let deliveryDetails = '';
    if (deliveryType === 'entrega') {
      deliveryDetails = `🛵 *Forma de Entrega:* Delivery`;
      if (address.trim()) {
        deliveryDetails += `\n📍 *Endereço:* ${address.trim()}`;
      }
      if (reference.trim()) {
        deliveryDetails += `\n🏷️ *Ponto de Referência:* ${reference.trim()}`;
      }
      if (gpsCoords) {
        deliveryDetails += `\n🌐 *Localização GPS em Tempo Real:*\n${gpsCoords.mapsUrl}`;
      }
      if (!address.trim() && !gpsCoords) {
        deliveryDetails += `\n📍 *Endereço / Localização:* Enviarei a localização aqui na conversa do WhatsApp 📍`;
      }
      deliveryDetails += hasFreeDelivery
        ? `\n✨ *Taxa de Entrega:* Grátis (a partir de ${storeInfo.freeDeliveryMinUnits} unidades)`
        : `\n✨ *Taxa de Entrega:* A combinar`;
    } else {
      deliveryDetails = `🏬 *Forma de Entrega:* Retirada no Local`;
    }

    let couponText = '';
    if (appliedCoupon && couponDiscount > 0) {
      const discountDetail =
        appliedCoupon.type === 'percentage'
          ? `${appliedCoupon.value}% OFF`
          : `${formatBRL(appliedCoupon.value)} OFF`;
      couponText = `\n🎟️ *Cupom Aplicado:* ${appliedCoupon.code} (${discountDetail}) ➔ - ${formatBRL(couponDiscount)}`;
    }

    const notesText = notes.trim() ? `\n📝 *Observações:* ${notes.trim()}` : '';

    const message = `*NOVO PEDIDO — ${storeInfo.name.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━

👤 *Cliente:* ${customerName.trim()}
📅 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

🧁 *ITENS DO PEDIDO:*
${itemsText}

───────────────────────
💵 *Subtotal:* ${formatBRL(subtotal)}${couponText}
💰 *TOTAL FINAL:* ${formatBRL(finalTotal)}
───────────────────────

${deliveryDetails}${notesText}

📍 *Cidade:* ${storeInfo.city}
━━━━━━━━━━━━━━━━━━━━━━━
_Olá! Acabei de montar meu pedido pelo cardápio online e aguardo a confirmação._ ✨`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${storeInfo.whatsappNumber}?text=${encoded}`, '_blank');
    onOrderSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#3A2214]/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal — bottom sheet em mobile, centralizado em desktop */}
      <div className="modal-enter relative w-full sm:max-w-lg bg-[#24130A] text-[#F7EEDC] sm:rounded-2xl rounded-t-2xl shadow-2xl border border-[#54321C] sm:border-2 overflow-hidden z-10 sm:my-6 max-h-[92vh] sm:max-h-[88vh] flex flex-col">

        {/* Cabeçalho */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#4A2E1B] flex items-center justify-between bg-[#24130A] shrink-0">
          {/* Handle pill (mobile) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#54321C] sm:hidden" />
          <div className="pt-2 sm:pt-0">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF7C] block">
              Quase pronto
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F7EEDC] mt-0.5">Finalizar Pedido</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#331C0F] text-[#F7EEDC] transition-colors shrink-0 touch-manipulation"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário (scrollável) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5">

          {/* Nome */}
          <div>
            <label className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[#D4AF7C] block mb-1.5">
              Seu Nome <span className="text-[#D4AF7C]">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
              }}
              placeholder="Como podemos te chamar?"
              className={`w-full px-4 py-3 rounded-xl border bg-[#1A0E07] text-[#F7EEDC] placeholder-[#8B5E3C] text-sm focus:outline-none transition-colors ${
                errors.customerName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#54321C] focus:border-[#D4AF7C]'
              }`}
            />
            {errors.customerName && (
              <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>
            )}
          </div>

          {/* Tipo de Entrega */}
          <div>
            <label className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[#D4AF7C] block mb-2">
              Forma de Recebimento
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { type: 'entrega' as const, icon: <Bike size={18} className="text-[#D4AF7C]" />, label: 'Entrega (Delivery)' },
                { type: 'retirada' as const, icon: <Store size={18} className="text-[#D4AF7C]" />, label: 'Retirada no Local' },
              ].map(({ type, icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDeliveryType(type)}
                  className={`p-3 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition-all touch-manipulation ${
                    deliveryType === type
                      ? 'border-[#D4AF7C] bg-[#482815] text-[#F7EEDC] ring-1 ring-[#D4AF7C]'
                      : 'border-[#54321C] bg-[#1A0E07] text-[#E8D7B7] hover:border-[#D4AF7C]/60'
                  }`}
                >
                  {icon}
                  <span className="text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Endereço + GPS */}
          {deliveryType === 'entrega' && (
            <div className="space-y-4 pt-2 border-t border-[#4A2E1B]">
              {/* Aviso amigável sobre enviar localização no WhatsApp */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#331C0F] border border-[#D4AF7C]/30 text-xs text-[#F7EEDC] flex items-start gap-2.5">
                <Sparkles size={16} className="text-[#D4AF7C] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold block text-[#F7EEDC]">Prefere informar o endereço pelo WhatsApp?</span>
                  <span className="text-[#E8D7B7]/80 text-[11px]">
                    Sem problemas! Você pode preencher apenas o seu <strong>Nome</strong> agora e nos enviar sua localização ou endereço diretamente na conversa.
                  </span>
                </div>
              </div>

              {/* GPS */}
              <div className="p-3 sm:p-4 rounded-xl border-2 border-dashed border-[#D4AF7C]/60 bg-[#1A0E07] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-[#F7EEDC] flex items-center gap-1.5">
                    <Navigation size={14} className="text-[#D4AF7C] shrink-0" />
                    <span>Localização GPS em Tempo Real</span>
                  </span>
                  {gpsCoords && (
                    <span className="text-[9px] sm:text-[10px] bg-emerald-900/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 border border-emerald-500/30">
                      <Check size={10} />
                      Ativada
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#E8D7B7]/80 leading-relaxed">
                  Compartilhe sua localização exata para o entregador chegar sem erros via Google Maps.
                </p>

                {gpsCoords ? (
                  <div className="p-3 bg-[#24130A] rounded-lg border border-[#D4AF7C]/40 space-y-2">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <Check size={13} />
                        <span>Capturada! (Precisão ~{gpsCoords.accuracy}m)</span>
                      </span>
                      <a
                        href={gpsCoords.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#D4AF7C] hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        <span>Ver mapa</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={handleCaptureLocation}
                      className="text-[11px] text-[#D4AF7C] underline hover:text-[#F7EEDC] touch-manipulation"
                    >
                      Atualizar localização GPS
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCaptureLocation}
                    disabled={isLocating}
                    className="w-full flex items-center justify-center gap-2 bg-[#E8D7B7] hover:bg-[#F7EEDC] text-[#3A2214] py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 touch-manipulation"
                  >
                    <Navigation size={14} className="text-[#3A2214]" />
                    <span>
                      {isLocating ? 'Obtendo localização...' : 'Ligar Localizador GPS'}
                    </span>
                  </button>
                )}

                {gpsError && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{gpsError}</span>
                  </p>
                )}
              </div>

              {/* Endereço */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[#D4AF7C]">
                    Endereço por Escrito
                  </label>
                  <span className="text-[10px] text-[#E8D7B7]/70 italic">
                    (opcional se enviar GPS ou no WhatsApp)
                  </span>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  placeholder="Rua, número e bairro (ou envie direto no WhatsApp)"
                  className="w-full px-4 py-3 rounded-xl border border-[#54321C] bg-[#1A0E07] text-[#F7EEDC] placeholder-[#8B5E3C] text-sm focus:border-[#D4AF7C] focus:outline-none transition-colors"
                />
              </div>

              {/* Referência */}
              <div>
                <label className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[#D4AF7C] block mb-1.5">
                  Ponto de Referência <span className="text-[#E8D7B7]/60">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: Próximo à praça, portão preto..."
                  className="w-full px-4 py-3 rounded-xl border border-[#54321C] bg-[#1A0E07] text-[#F7EEDC] placeholder-[#8B5E3C] text-sm focus:border-[#D4AF7C] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[#D4AF7C] block mb-1.5">
              Observações <span className="text-[#E8D7B7]/60">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Algum recado especial ou detalhe?"
              className="w-full px-4 py-3 rounded-xl border border-[#54321C] bg-[#1A0E07] text-[#F7EEDC] placeholder-[#8B5E3C] text-sm focus:border-[#D4AF7C] focus:outline-none resize-none"
            />
          </div>

          {/* Cupom de Desconto no Checkout */}
          <div className="pt-2 border-t border-[#4A2E1B] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[#D4AF7C] flex items-center gap-1.5">
                <Tag size={12} />
                <span>Cupom de Desconto</span>
              </label>
            </div>

            {appliedCoupon ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-emerald-400 font-semibold">- {formatBRL(couponDiscount)}</span>
                  <span className="text-[11px] text-emerald-400">
                    ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% OFF` : `R$ ${appliedCoupon.value} OFF`})
                  </span>
                </div>
                {onRemoveCoupon && (
                  <button
                    type="button"
                    onClick={onRemoveCoupon}
                    className="text-xs text-emerald-400 hover:text-red-400 underline font-medium touch-manipulation"
                  >
                    Remover
                  </button>
                )}
              </div>
            ) : onApplyCoupon ? (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={checkoutCouponInput}
                    onChange={(e) => {
                      setCheckoutCouponInput(e.target.value.toUpperCase());
                      setCheckoutCouponMsg(null);
                    }}
                    placeholder="Tem cupom? Digite o código..."
                    className="flex-1 px-3 py-2.5 rounded-xl border border-[#54321C] bg-[#1A0E07] text-xs font-mono uppercase text-[#F7EEDC] placeholder-[#8B5E3C] focus:border-[#D4AF7C] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!checkoutCouponInput.trim()) return;
                      const res = onApplyCoupon(checkoutCouponInput.trim());
                      setCheckoutCouponMsg({
                        type: res.success ? 'success' : 'error',
                        text: res.message,
                      });
                      if (res.success) setCheckoutCouponInput('');
                    }}
                    className="bg-[#D4AF7C] text-[#3A2214] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#E8D7B7] transition-colors touch-manipulation"
                  >
                    Aplicar
                  </button>
                </div>
                {checkoutCouponMsg && (
                  <p
                    className={`text-[11px] font-medium ${
                      checkoutCouponMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {checkoutCouponMsg.text}
                  </p>
                )}
              </div>
            ) : null}
          </div>

          {/* Resumo */}
          <div className="p-4 rounded-xl bg-[#331C0F] border border-[#54321C] space-y-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF7C] block">
              Resumo do Pedido
            </span>
            <div className="space-y-1.5 text-xs text-[#F7EEDC]">
              {items.map((it) => (
                <div key={it.id} className="flex justify-between gap-2">
                  <span className="leading-snug">
                    {it.quantity}x {it.productName} ({it.optionName})
                  </span>
                  <span className="font-semibold text-[#D4AF7C] shrink-0">{formatBRL(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#54321C] pt-2 flex justify-between text-xs text-[#E8D7B7]">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                <span>Cupom ({appliedCoupon.code})</span>
                <span>- {formatBRL(couponDiscount)}</span>
              </div>
            )}

            <div className="border-t border-[#54321C] pt-2 flex justify-between items-baseline">
              <span className="text-xs uppercase font-bold tracking-wider text-[#D4AF7C]">Total Final</span>
              <span className="font-serif text-xl font-bold text-[#F7EEDC]">{formatBRL(finalTotal)}</span>
            </div>
            <p className="text-[11px] text-[#E8D7B7]/80 leading-snug">
              {deliveryType === 'entrega' && hasFreeDelivery
                ? `✨ Entrega gratuita (a partir de ${storeInfo.freeDeliveryMinUnits} unidades).`
                : deliveryType === 'entrega'
                ? '🛵 Taxa de entrega a combinar pelo WhatsApp.'
                : '🏬 Retirada combinada pelo WhatsApp.'}
            </p>
          </div>

          {/* Aviso */}
          <p className="text-[11px] text-[#E8D7B7]/70 leading-relaxed text-center">
            O <strong>WhatsApp</strong> será aberto com a mensagem estruturada pronta para envio. O pedido só é confirmado após enviar a mensagem.
          </p>

          {/* Botão WhatsApp (Invertido: claro com texto escuro e muito destaque) */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#E8D7B7] hover:bg-[#F7EEDC] text-[#3A2214] py-4 rounded-full text-[11px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.18em] font-bold transition-all shadow-lg active:scale-[0.98] touch-manipulation"
          >
            <MessageCircle size={17} className="text-[#3A2214] shrink-0" />
            <span>Enviar Pedido pelo WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
