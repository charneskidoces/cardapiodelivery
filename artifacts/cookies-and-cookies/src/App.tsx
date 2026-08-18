import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Gift,
  Heart,
  Instagram,
  MapPin,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  X,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import redVelvetPhoto from '@assets/generated_images/red-velvet-cookie.jpg';
import alpinoBlackPhoto from '@assets/generated_images/alpino-black-cookie.jpg';
import kinderBuenoPhoto from '@assets/generated_images/kinder-bueno-cookie.jpg';
import ccLogo from '@assets/generated_images/cc-logo-no-bg.png';

const queryClient = new QueryClient();
const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Product = {
  id: string;
  name: string;
  descriptor: string;
  price: number;
  tag?: string;
  image: string;
};
type CartItem = Product & { quantity: number; custom?: boolean };

const products: Product[] = [
  { id: 'red-velvet', name: 'Red Velvet', descriptor: 'Massa red velvet, chocolate branco e centro macio.', price: 15, tag: 'Favorito', image: redVelvetPhoto },
  { id: 'alpino-black', name: 'Alpino Black', descriptor: 'Chocolate intenso, pedaços de chocolate e recheio cremoso.', price: 15, tag: 'Mais pedido', image: alpinoBlackPhoto },
  { id: 'kinder-bueno', name: 'Kinder Bueno', descriptor: 'Avelã, chocolate ao leite e um recheio irresistível.', price: 15, tag: 'Novo', image: kinderBuenoPhoto },
];

const flavors = [
  { id: 'red-velvet', label: 'Red Velvet', short: 'Red Velvet' },
  { id: 'alpino-black', label: 'Alpino Black', short: 'Alpino Black' },
  { id: 'kinder-bueno', label: 'Kinder Bueno', short: 'Kinder Bueno' },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand-mark flex items-center ${light ? 'drop-shadow-[0_2px_0_hsl(35_43%_94%/.15)]' : ''}`} aria-label="Cookies & Cookies">
      <img src={ccLogo} alt="Cookies & Cookies" className="h-12 w-12 object-contain" />
    </div>
  );
}

function Header({ bagCount, onBag, onMenu }: { bagCount: number; onBag: () => void; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[hsl(34_24%_82%/.65)] bg-[hsl(35_43%_94%/.92)] backdrop-blur-md">
      <div className="wine-bg flex h-8 items-center justify-center px-4 text-[10px] font-semibold uppercase tracking-[.2em] text-[hsl(35_43%_94%)]">
        Feito para compartilhar (ou não).
      </div>
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <button className="md:hidden" onClick={onMenu} aria-label="Abrir menu" data-testid="button-open-menu"><Menu size={22} /></button>
        <a href="#top" className="md:mr-16" data-testid="link-logo"><Logo /></a>
        <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[.15em] md:flex" aria-label="Navegação principal">
          <a href="#colecao" className="transition-colors hover:wine-text" data-testid="link-collection">Coleção</a>
          <a href="#monte-sua-caixa" className="transition-colors hover:wine-text" data-testid="link-custom-box">Monte sua caixa</a>
          <a href="#nossa-historia" className="transition-colors hover:wine-text" data-testid="link-story">Nossa história</a>
        </nav>
        <div className="flex items-center gap-5">
          <a href="#encontre" className="hidden text-[11px] font-semibold uppercase tracking-[.15em] md:block" data-testid="link-find-us">Onde encontrar</a>
          <button onClick={onBag} className="group relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.15em]" data-testid="button-open-bag">
            <ShoppingBag size={19} strokeWidth={1.7} className="transition-transform group-hover:-rotate-6" />
            <span className="hidden sm:inline">Sacola</span>
            <span className="wine-bg flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] text-[hsl(35_43%_94%)]" data-testid="text-bag-count">{bagCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Quantity({ quantity, onDecrease, onIncrease, testId }: { quantity: number; onDecrease: () => void; onIncrease: () => void; testId: string }) {
  return (
    <div className="flex h-9 items-center rounded-full border border-[hsl(34_24%_76%)] bg-[hsl(35_43%_94%)]" data-testid={`quantity-${testId}`}>
      <button className="flex h-full w-9 items-center justify-center rounded-l-full transition-colors hover:bg-[hsl(34_24%_87%)] disabled:opacity-35" onClick={onDecrease} disabled={quantity <= 1} aria-label="Diminuir quantidade" data-testid={`button-decrease-${testId}`}><Minus size={13} /></button>
      <span className="w-5 text-center text-xs font-semibold" data-testid={`text-quantity-${testId}`}>{quantity}</span>
      <button className="flex h-full w-9 items-center justify-center rounded-r-full transition-colors hover:bg-[hsl(34_24%_87%)]" onClick={onIncrease} aria-label="Aumentar quantidade" data-testid={`button-increase-${testId}`}><Plus size={13} /></button>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  return (
    <article className="group relative" data-testid={`card-product-${product.id}`}>
      <div className="relative mb-5 aspect-[.88] overflow-hidden rounded-[2px] bg-[hsl(34_24%_87%)]">
        <img src={product.image} alt={`Cookie ${product.name} da Cookies & Cookies`} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        {product.tag && <span className="absolute left-4 top-4 rounded-full bg-[hsl(39_51%_71%)] px-3 py-1 text-[10px] font-bold uppercase tracking-[.13em] chocolate-text">{product.tag}</span>}
        <button onClick={() => onAdd(product)} className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full wine-bg text-[hsl(35_43%_94%)] opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105" aria-label={`Adicionar ${product.name}`} data-testid={`button-add-${product.id}`}><Plus size={19} /></button>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[21px] font-semibold leading-tight">{product.name}</h3>
          <p className="mt-2 max-w-[240px] text-[13px] leading-relaxed text-[hsl(345_18%_42%)]">{product.descriptor}</p>
        </div>
        <span className="whitespace-nowrap text-sm font-bold wine-text">{money(product.price)}</span>
      </div>
      <button onClick={() => onAdd(product)} className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] wine-text transition-all hover:gap-3" data-testid={`button-order-${product.id}`}>Adicionar à sacola <ArrowRight size={14} /></button>
    </article>
  );
}

function CartDrawer({ items, open, onClose, onUpdate, onCheckout }: { items: CartItem[]; open: boolean; onClose: () => void; onUpdate: (id: string, amount: number) => void; onCheckout: () => void }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return open ? (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 cursor-default bg-[hsl(345_38%_17%/.46)]" onClick={onClose} aria-label="Fechar sacola" data-testid="button-close-bag-overlay" />
      <aside className="cart-enter absolute right-0 top-0 flex h-full w-full max-w-[450px] flex-col bg-[hsl(35_43%_94%)] shadow-2xl" aria-label="Sua sacola">
        <div className="flex items-center justify-between border-b border-[hsl(34_24%_82%)] px-6 py-6">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] wine-text">Seu pedido</p><h2 className="mt-1 font-display text-3xl">A sua sacola</h2></div>
          <button onClick={onClose} aria-label="Fechar sacola" data-testid="button-close-bag"><X size={22} /></button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full caramel-bg"><ShoppingBag size={29} className="wine-text" strokeWidth={1.3} /></div>
            <h3 className="font-display text-2xl">Ainda está vazia.</h3>
            <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-[hsl(345_18%_42%)]">Uma sacola vazia é só uma desculpa para escolher o primeiro cookie.</p>
            <button onClick={onClose} className="mt-7 rounded-full wine-bg px-6 py-3 text-[11px] font-bold uppercase tracking-[.14em] text-[hsl(35_43%_94%)]" data-testid="button-browse-cookies">Escolher cookies</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="mb-5 flex items-center gap-2 text-xs text-[hsl(345_18%_42%)]"><Sparkles size={14} className="wine-text" /> Preparados fresquinhos para você.</div>
              <div className="space-y-5">
                {items.map((item) => (
                  <div className="flex gap-4" key={item.id} data-testid={`row-cart-${item.id}`}>
                    <img src={item.image} alt="" className="h-[86px] w-[74px] rounded-sm object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3"><h3 className="font-display text-lg leading-tight">{item.name}</h3><button onClick={() => onUpdate(item.id, -item.quantity)} className="text-[10px] uppercase tracking-wider text-[hsl(345_18%_42%)] hover:wine-text" data-testid={`button-remove-${item.id}`}>Remover</button></div>
                      <p className="mt-1 text-xs text-[hsl(345_18%_42%)]">{money(item.price)} cada</p>
                      <div className="mt-3 flex items-center justify-between"><Quantity quantity={item.quantity} onDecrease={() => onUpdate(item.id, -1)} onIncrease={() => onUpdate(item.id, 1)} testId={`cart-${item.id}`} /><span className="text-sm font-bold">{money(item.price * item.quantity)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[hsl(34_24%_82%)] px-6 py-6">
              <div className="mb-4 flex justify-between text-sm"><span>Subtotal</span><strong data-testid="text-cart-total">{money(total)}</strong></div>
              <p className="mb-5 flex items-center gap-2 text-xs text-[hsl(345_18%_42%)]"><Truck size={14} /> Frete calculado no próximo passo.</p>
              <button onClick={onCheckout} className="flex w-full items-center justify-center gap-3 rounded-full wine-bg py-4 text-[11px] font-bold uppercase tracking-[.16em] text-[hsl(35_43%_94%)] transition-transform hover:-translate-y-0.5" data-testid="button-go-checkout">Continuar pedido <ArrowRight size={15} /></button>
            </div>
          </>
        )}
      </aside>
    </div>
  ) : null;
}

function Checkout({ items, onClose, onDone }: { items: CartItem[]; onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState<'details' | 'done'>('details');
  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
  const [cep, setCep] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', number: '', email: '' });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const valid = form.name && form.phone && form.email && (mode === 'pickup' || (form.address && form.number && cep.length >= 8));
  if (step === 'done') return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[hsl(345_38%_17%/.55)] p-4">
      <div className="modal-enter w-full max-w-[490px] rounded-sm bg-[hsl(35_43%_94%)] p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full caramel-bg wine-text"><Check size={28} /></div>
        <p className="mt-7 text-[10px] font-bold uppercase tracking-[.2em] wine-text">Pedido recebido</p>
        <h2 className="mt-2 font-display text-4xl">Já estamos assando.</h2>
        <p className="mx-auto mt-4 max-w-[330px] text-sm leading-relaxed text-[hsl(345_18%_42%)]">Obrigada, {form.name.split(' ')[0] || 'querida'}. Enviamos os próximos detalhes para o seu e-mail.</p>
        <div className="my-7 border-y border-[hsl(34_24%_82%)] py-4 text-left text-sm"><div className="flex justify-between"><span>Forma de receber</span><strong>{mode === 'delivery' ? 'Delivery' : 'Retirada no local'}</strong></div><div className="mt-2 flex justify-between"><span>Total</span><strong>{money(total)}</strong></div></div>
        <button onClick={onDone} className="rounded-full wine-bg px-7 py-3 text-[11px] font-bold uppercase tracking-[.15em] text-[hsl(35_43%_94%)]" data-testid="button-finish-order">Voltar para a loja</button>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[hsl(35_43%_94%)]">
      <div className="mx-auto min-h-full max-w-[1100px] px-5 py-6 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between border-b border-[hsl(34_24%_82%)] pb-6"><Logo /><button onClick={onClose} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em]" data-testid="button-close-checkout">Voltar à sacola <X size={18} /></button></div>
        <div className="grid gap-10 py-9 lg:grid-cols-[1fr_360px]">
          <main>
            <div className="mb-9 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.17em]"><span className="wine-text">01. Seus dados</span><span className="h-px w-10 bg-[hsl(34_24%_76%)]" /><span className="text-[hsl(345_18%_42%)]">02. Confirmação</span></div>
            <h1 className="font-display text-4xl sm:text-5xl">Quase na hora do primeiro mordisco.</h1>
            <p className="mt-3 text-sm text-[hsl(345_18%_42%)]">Preencha seus dados. Sem cadastro, sem complicação.</p>
            <div className="mt-9">
              <label className="text-[11px] font-bold uppercase tracking-wider">Como você quer receber?</label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button onClick={() => setMode('delivery')} className={`flex items-start gap-3 rounded-sm border p-4 text-left transition-colors ${mode === 'delivery' ? 'border-[hsl(346_48%_26%)] bg-[hsl(346_48%_26%/.06)]' : 'border-[hsl(34_24%_82%)]'}`} data-testid="button-select-delivery"><Truck size={19} className="mt-0.5 wine-text" /><span><strong className="block text-sm">Delivery</strong><small className="mt-1 block text-xs text-[hsl(345_18%_42%)]">Receba em casa, quentinho.</small></span></button>
                <button onClick={() => setMode('pickup')} className={`flex items-start gap-3 rounded-sm border p-4 text-left transition-colors ${mode === 'pickup' ? 'border-[hsl(346_48%_26%)] bg-[hsl(346_48%_26%/.06)]' : 'border-[hsl(34_24%_82%)]'}`} data-testid="button-select-pickup"><Store size={19} className="mt-0.5 wine-text" /><span><strong className="block text-sm">Retirada no local</strong><small className="mt-1 block text-xs text-[hsl(345_18%_42%)]">Rua Harmonia, 427 · Vila Madalena.</small></span></button>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field label="Seu nome" value={form.name} onChange={(value) => change('name', value)} placeholder="Como podemos te chamar?" testId="input-name" />
              <Field label="WhatsApp" value={form.phone} onChange={(value) => change('phone', value)} placeholder="(11) 99999-0000" testId="input-phone" />
              <Field label="E-mail" value={form.email} onChange={(value) => change('email', value)} placeholder="voce@email.com" testId="input-email" type="email" />
              {mode === 'delivery' && <><div className="sm:col-span-2"><Field label="CEP" value={cep} onChange={setCep} placeholder="00000-000" testId="input-checkout-cep" /></div><Field label="Endereço" value={form.address} onChange={(value) => change('address', value)} placeholder="Rua, avenida..." testId="input-address" /><Field label="Número" value={form.number} onChange={(value) => change('number', value)} placeholder="000" testId="input-number" /></>}
            </div>
            <button disabled={!valid} onClick={() => setStep('done')} className="mt-8 flex w-full items-center justify-center gap-3 rounded-full wine-bg py-4 text-[11px] font-bold uppercase tracking-[.16em] text-[hsl(35_43%_94%)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-10" data-testid="button-submit-order">Confirmar pedido <ArrowRight size={15} /></button>
          </main>
          <aside className="h-fit rounded-sm bg-[hsl(346_48%_26%)] p-6 text-[hsl(35_43%_94%)] lg:sticky lg:top-6">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(39_51%_71%)]">Resumo da sacola</p>
            <div className="mt-5 space-y-4">{items.map((item) => <div className="flex justify-between gap-4 text-sm" key={item.id}><span>{item.quantity} × {item.name}</span><span className="whitespace-nowrap">{money(item.price * item.quantity)}</span></div>)}</div>
            <div className="my-6 border-t border-[hsl(35_43%_94%/.2)]" /><div className="flex justify-between text-base"><span>Total</span><strong className="text-[hsl(39_51%_71%)]">{money(total)}</strong></div>
            <p className="mt-6 flex gap-2 text-xs leading-relaxed text-[hsl(35_20%_78%)]"><CircleHelp size={15} className="mt-0.5 shrink-0" /> Pagamento combinado na entrega ou retirada.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, testId, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; testId: string; type?: string }) {
  return <label className="block"><span className="text-[11px] font-bold uppercase tracking-wider">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-12 w-full rounded-sm border border-[hsl(34_24%_76%)] bg-[hsl(36_45%_97%)] px-4 text-sm placeholder:text-[hsl(345_18%_58%)] focus:border-[hsl(346_48%_26%)] focus:outline-none" data-testid={testId} /></label>;
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-40 bg-[hsl(35_43%_94%)] md:hidden"><div className="flex h-8 items-center justify-center wine-bg text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(35_43%_94%)]">A loja dos cookies de verdade</div><div className="flex items-center justify-between px-5 py-7"><Logo /><button onClick={onClose} aria-label="Fechar menu" data-testid="button-close-menu"><X size={23} /></button></div><nav className="flex flex-col px-5" aria-label="Menu mobile">{[['#colecao', 'Coleção'], ['#monte-sua-caixa', 'Monte sua caixa'], ['#nossa-historia', 'Nossa história'], ['#encontre', 'Onde encontrar']].map(([href, label]) => <a key={href} href={href} onClick={onClose} className="border-b border-[hsl(34_24%_82%)] py-5 font-display text-3xl" data-testid={`mobile-link-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}<ArrowRight className="ml-2 inline-block" size={22} /></a>)}</nav><div className="absolute bottom-8 left-5 right-5 border-t border-[hsl(34_24%_82%)] pt-5 text-xs text-[hsl(345_18%_42%)]">Vila Madalena, São Paulo · segunda a sábado</div></div>;
}

function Home() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cep, setCep] = useState('');
  const [estimate, setEstimate] = useState('');
  const [boxSize, setBoxSize] = useState(8);
   const [boxFlavors, setBoxFlavors] = useState<Record<string, number>>({ 'red-velvet': 3, 'alpino-black': 3, 'kinder-bueno': 2 });
  const [toast, setToast] = useState('');
  const bagCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const boxCount = Object.values(boxFlavors).reduce((sum, value) => sum + value, 0);
  const boxPrice = boxSize * 15;
  const addToBag = (product: Product, quantity = 1, custom = false) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { ...product, quantity, custom }];
    });
    setToast(`${product.name} foi para a sacola`);
    window.setTimeout(() => setToast(''), 2400);
  };
  const updateItem = (id: string, amount: number) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  const toggleFlavor = (id: string, amount: number) => setBoxFlavors((current) => {
    const next = Math.max(0, (current[id] || 0) + amount);
    if (amount > 0 && boxCount >= boxSize) return current;
    return { ...current, [id]: next };
  });
  const addBox = () => {
    const detail = flavors.filter((flavor) => boxFlavors[flavor.id]).map((flavor) => `${boxFlavors[flavor.id]} ${flavor.short}`).join(', ');
    addToBag({ id: `caixa-${boxSize}`, name: `Caixa com ${boxSize} cookies`, descriptor: detail, price: boxPrice, image: alpinoBlackPhoto, tag: 'Montada por você' }, 1, true);
  };
  const estimateCep = () => {
    if (cep.replace(/\D/g, '').length >= 8) setEstimate('Chega hoje, entre 14h e 19h. A gente avisa quando sair do forno.');
    else setEstimate('Digite um CEP válido com 8 números.');
  };
  return (
    <div id="top" className="min-h-[100dvh] overflow-x-hidden">
      <Header bagCount={bagCount} onBag={() => setBagOpen(true)} onMenu={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <section className="mx-auto grid max-w-[1240px] gap-6 px-5 pb-16 pt-7 sm:pt-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-8 lg:px-8 lg:pb-24">
          <div className="wine-bg relative flex min-h-[560px] flex-col justify-between overflow-hidden px-7 py-8 text-[hsl(35_43%_94%)] sm:px-12 sm:py-12 lg:min-h-[650px]">
            <div className="absolute -right-28 -top-28 h-[330px] w-[330px] rounded-full border border-[hsl(39_51%_71%/.3)]" /><div className="absolute -bottom-36 -left-32 h-[430px] w-[430px] rounded-full border border-[hsl(39_51%_71%/.2)]" />
            <div className="relative fade-up"><div className="mb-10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(39_51%_71%)]"><span className="h-px w-8 bg-[hsl(39_51%_71%)]" /> Desde 2021 · São Paulo</div><h1 className="max-w-[580px] font-display text-[clamp(3.5rem,8vw,7.1rem)] font-semibold leading-[.89] tracking-[-.06em]">O cookie que começou tudo<span className="text-[hsl(39_51%_71%)]">.</span></h1></div>
            <div className="relative mt-12 flex items-end justify-between gap-8 fade-up fade-up-delay-2"><p className="max-w-[250px] text-sm leading-relaxed text-[hsl(35_20%_80%)]">Grandes, macios no centro, crocantes nas bordas. Feitos à mão e assados em pequenos lotes.</p><a href="#colecao" className="group flex h-20 w-20 shrink-0 items-center justify-center rounded-full caramel-bg text-center text-[10px] font-bold uppercase leading-tight tracking-wider chocolate-text transition-transform hover:rotate-6" data-testid="link-hero-order">Pedir<br />agora <ArrowRight size={15} className="ml-1 transition-transform group-hover:translate-x-1" /></a></div>
          </div>
           <div className="relative min-h-[560px] overflow-hidden bg-[hsl(34_24%_87%)] lg:min-h-[650px]"><img src={redVelvetPhoto} alt="Cookie Red Velvet artesanal com chocolate branco" className="h-full w-full object-cover" /><div className="absolute bottom-6 left-6 right-6 flex items-center justify-between border-t border-[hsl(35_43%_94%/.6)] pt-4 text-[hsl(35_43%_94%)]"><span className="text-[10px] font-bold uppercase tracking-[.19em]">Red Velvet · R$ 15</span><span className="font-display text-lg italic">feito com carinho</span></div></div>
        </section>

        <section id="colecao" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-16 lg:px-8 lg:py-24">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] wine-text">A vitrine</p><h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">Escolha seus cookies</h2></div><p className="max-w-[270px] text-sm leading-relaxed text-[hsl(345_18%_42%)]">Cada receita tem seu momento. A única regra é não deixar para depois.</p></div>
           <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={addToBag} />)}</div>
          <div className="mt-16 flex justify-center"><a href="#monte-sua-caixa" className="flex items-center gap-3 border-b border-[hsl(346_48%_26%)] pb-2 text-[11px] font-bold uppercase tracking-[.16em] wine-text hover:gap-4" data-testid="link-build-box">Prefere uma seleção? Monte sua caixa <ArrowRight size={15} /></a></div>
        </section>

        <section id="nossa-historia" className="wine-bg scroll-mt-24 text-[hsl(35_43%_94%)]">
          <div className="mx-auto grid max-w-[1240px] items-stretch lg:grid-cols-[.95fr_1.05fr]">
            <div className="flex flex-col justify-center px-5 py-16 sm:px-12 lg:py-24 lg:pr-20"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(39_51%_71%)]">Nossa história</p><h2 className="mt-5 font-display text-5xl leading-[.95] sm:text-6xl">Cookies que merecem um close.</h2><p className="mt-7 max-w-[420px] text-sm leading-[1.8] text-[hsl(35_20%_80%)]">Começou com uma fornada na cozinha de casa e uma pergunta simples: e se o cookie fosse o evento principal? Hoje, continuamos fazendo do mesmo jeito — massa descansada, chocolate de verdade e atenção a cada fornada.</p><div className="mt-9 flex items-center gap-4 text-xs"><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(39_51%_71%/.6)]"><Heart size={16} className="text-[hsl(39_51%_71%)]" /></span> <span>feito para compartilhar <em className="font-display text-base"> (ou não)</em></span></div></div>
             <div className="relative min-h-[420px] overflow-hidden lg:min-h-[600px]"><img src={kinderBuenoPhoto} alt="Cookie Kinder Bueno artesanal com chocolate e avelã" className="h-full w-full object-cover" /><div className="absolute right-5 top-5 flex h-20 w-20 rotate-12 flex-col items-center justify-center rounded-full caramel-bg text-center text-[9px] font-bold uppercase leading-tight tracking-wider chocolate-text"><img src={ccLogo} alt="" className="h-9 w-9 object-contain" /><span>desde<br />2021</span></div></div>
          </div>
        </section>

        <section id="monte-sua-caixa" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-[1240px]"><div className="mb-12 max-w-[570px]"><p className="text-[10px] font-bold uppercase tracking-[.2em] wine-text">Para dividir, presentear ou esconder</p><h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">Monte sua caixa</h2><p className="mt-4 text-sm leading-relaxed text-[hsl(345_18%_42%)]">Você escolhe o tamanho, a gente cuida do laço. Misture os sabores até ficar com a sua cara.</p></div>
            <div className="grid border-y border-[hsl(34_24%_82%)] lg:grid-cols-[.8fr_1.2fr]">
              <div className="stripe-panel relative min-h-[380px] overflow-hidden p-7 sm:p-12"><div className="absolute inset-5 border border-[hsl(35_43%_94%/.55)]" /><div className="relative flex h-full flex-col justify-between"><div className="flex justify-between"><span className="flex items-center gap-2 rounded-full bg-[hsl(35_43%_94%)] px-3 py-1 text-[9px] font-bold uppercase tracking-widest wine-text"><img src={ccLogo} alt="" className="h-5 w-5 object-contain" /> box</span><Gift className="text-[hsl(35_43%_94%)]" size={21} /></div><div className="relative mx-auto mt-16 w-[220px] rotate-[-4deg] bg-[hsl(35_43%_94%)] p-5 text-center shadow-xl"><div className="border border-[hsl(346_48%_26%)] p-4"><Logo /><p className="mt-4 text-[9px] font-semibold uppercase tracking-wider wine-text">Feito para compartilhar</p><div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full caramel-bg"><img src={ccLogo} alt="Logo Cookies & Cookies" className="h-12 w-12 object-contain" /></div></div></div><p className="relative mt-8 text-center font-display text-lg text-[hsl(35_43%_94%)]">uma caixa, muitos motivos</p></div></div>
               <div className="bg-[hsl(36_45%_97%)] p-7 sm:p-12"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] wine-text">1. Tamanho</p><p className="mt-1 text-xs text-[hsl(345_18%_42%)]">R$ 15 por cookie, do seu jeito.</p></div><span className="font-display text-2xl wine-text">{money(boxPrice)}</span></div><div className="mt-5 grid grid-cols-3 gap-2">{[4, 8, 12].map((size) => <button key={size} onClick={() => { const first = Math.ceil(size / 3); const second = Math.floor(size / 3); setBoxSize(size); setBoxFlavors({ 'red-velvet': first, 'alpino-black': second, 'kinder-bueno': size - first - second }); }} className={`border py-3 text-sm transition-colors ${boxSize === size ? 'border-[hsl(346_48%_26%)] wine-bg text-[hsl(35_43%_94%)]' : 'border-[hsl(34_24%_82%)] hover:border-[hsl(346_48%_26%)]'}`} data-testid={`button-box-size-${size}`}>{size} cookies</button>)}</div><div className="mt-10"><p className="text-[10px] font-bold uppercase tracking-[.16em] wine-text">2. Seus sabores <span className="ml-2 font-normal tracking-normal text-[hsl(345_18%_42%)]">({boxCount}/{boxSize})</span></p><div className="mt-4 grid gap-3">{flavors.map((flavor) => <div className="flex items-center justify-between border-b border-[hsl(34_24%_82%)] py-3" key={flavor.id}><span className="text-sm">{flavor.label}</span><Quantity quantity={boxFlavors[flavor.id] || 0} onDecrease={() => toggleFlavor(flavor.id, -1)} onIncrease={() => toggleFlavor(flavor.id, 1)} testId={`box-${flavor.id}`} /></div>)}</div></div><button disabled={boxCount !== boxSize} onClick={addBox} className="mt-8 flex w-full items-center justify-center gap-3 rounded-full wine-bg py-4 text-[11px] font-bold uppercase tracking-[.16em] text-[hsl(35_43%_94%)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-add-box">Adicionar caixa à sacola <ArrowRight size={15} /></button></div>
            </div>
          </div>
        </section>

        <section className="paper-texture border-y border-[hsl(34_24%_82%)] bg-[hsl(39_51%_71%/.35)] px-5 py-14 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-[1080px] gap-10 md:grid-cols-3 md:gap-5">
            <div className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full wine-bg text-[hsl(39_51%_71%)]"><Clock3 size={19} /></span><div><h3 className="font-display text-xl">Assado no dia</h3><p className="mt-2 text-sm leading-relaxed text-[hsl(345_18%_42%)]">A massa descansa. O forno espera. Você recebe no ponto certo.</p></div></div>
            <div className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full wine-bg text-[hsl(39_51%_71%)]"><Truck size={19} /></span><div><h3 className="font-display text-xl">Delivery com cuidado</h3><p className="mt-2 text-sm leading-relaxed text-[hsl(345_18%_42%)]">Levamos nossos cookies pela cidade em embalagens que chegam inteiras.</p></div></div>
            <div className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full wine-bg text-[hsl(39_51%_71%)]"><Sparkles size={19} /></span><div><h3 className="font-display text-xl">Um presente pronto</h3><p className="mt-2 text-sm leading-relaxed text-[hsl(345_18%_42%)]">A embalagem já faz parte da experiência. Só falta escolher para quem.</p></div></div>
          </div>
        </section>

        <section id="encontre" className="mx-auto grid max-w-[1240px] scroll-mt-24 gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24">
          <div><p className="text-[10px] font-bold uppercase tracking-[.2em] wine-text">Chegue mais perto</p><h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">Delivery ou retirada?</h2><p className="mt-5 max-w-[390px] text-sm leading-relaxed text-[hsl(345_18%_42%)]">Estamos na Vila Madalena, mas nossos cookies podem encontrar você em boa parte de São Paulo.</p><div className="mt-8 flex flex-wrap gap-3"><span className="flex items-center gap-2 rounded-full border border-[hsl(34_24%_76%)] px-4 py-2 text-xs"><MapPin size={14} className="wine-text" /> Rua Harmonia, 427</span><span className="flex items-center gap-2 rounded-full border border-[hsl(34_24%_76%)] px-4 py-2 text-xs"><Store size={14} className="wine-text" /> Seg–Sáb, 10h–19h</span></div></div>
          <div className="wine-bg p-7 text-[hsl(35_43%_94%)] sm:p-10"><div className="flex items-start justify-between gap-6"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(39_51%_71%)]">Consulte seu CEP</p><h3 className="mt-3 font-display text-3xl">Quando chega o carinho?</h3></div><Truck size={24} className="text-[hsl(39_51%_71%)]" /></div><div className="mt-7 flex gap-2"><input value={cep} onChange={(event) => setCep(event.target.value)} inputMode="numeric" placeholder="00000-000" className="h-12 min-w-0 flex-1 rounded-sm border border-[hsl(35_43%_94%/.3)] bg-transparent px-4 text-sm text-[hsl(35_43%_94%)] placeholder:text-[hsl(35_20%_72%)] focus:border-[hsl(39_51%_71%)] focus:outline-none" aria-label="Digite seu CEP" data-testid="input-cep" /><button onClick={estimateCep} className="h-12 rounded-sm caramel-bg px-5 text-[11px] font-bold uppercase tracking-wider chocolate-text transition-transform hover:-translate-y-0.5" data-testid="button-estimate-cep">Calcular</button></div>{estimate && <p className={`mt-4 flex items-start gap-2 text-xs leading-relaxed ${estimate.startsWith('Digite') ? 'text-[hsl(39_51%_71%)]' : 'text-[hsl(35_20%_80%)]'}`} data-testid="status-cep-estimate"><Check size={15} className="mt-0.5 shrink-0" /> {estimate}</p>}</div>
        </section>

        <section className="wine-bg px-5 py-20 text-center text-[hsl(35_43%_94%)] sm:px-8 lg:py-28"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(39_51%_71%)]">Atenção: pode causar vontade</p><h2 className="mx-auto mt-5 max-w-[760px] font-display text-5xl leading-[.92] sm:text-7xl">Um cookie bom não precisa de legenda.</h2><p className="mx-auto mt-7 max-w-[410px] text-sm leading-relaxed text-[hsl(35_20%_80%)]">Mas uma foto bonita ajuda. Marque <span className="text-[hsl(39_51%_71%)]">@cookiesandcookies</span> no seu próximo close.</p><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-[hsl(39_51%_71%/.7)] px-6 py-3 text-[11px] font-bold uppercase tracking-[.16em] text-[hsl(39_51%_71%)] transition-colors hover:bg-[hsl(39_51%_71%)] hover:text-[hsl(345_38%_17%)]" data-testid="link-instagram"><Instagram size={16} /> Ver no Instagram</a></section>
      </main>
      <footer className="bg-[hsl(345_38%_17%)] px-5 py-10 text-[hsl(35_43%_94%)] sm:px-8"><div className="mx-auto flex max-w-[1240px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div><Logo light /><p className="mt-4 max-w-[220px] text-xs leading-relaxed text-[hsl(35_20%_72%)]">Cookies grandes, feitos à mão e um pouco difíceis de dividir.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(35_20%_72%)]"><a href="#colecao" className="hover:text-[hsl(39_51%_71%)]" data-testid="footer-link-collection">Coleção</a><a href="#monte-sua-caixa" className="hover:text-[hsl(39_51%_71%)]" data-testid="footer-link-box">Monte sua caixa</a><a href="#encontre" className="hover:text-[hsl(39_51%_71%)]" data-testid="footer-link-location">Contato</a></div><p className="text-[10px] text-[hsl(35_20%_72%)]">© 2024 Cookies & Cookies</p></div></footer>
      {toast && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full wine-bg px-5 py-3 text-xs font-semibold text-[hsl(35_43%_94%)] shadow-xl" role="status" data-testid="status-add-to-cart"><span className="flex h-5 w-5 items-center justify-center rounded-full caramel-bg chocolate-text"><Check size={12} /></span>{toast}<button onClick={() => setBagOpen(true)} className="ml-1 underline underline-offset-2" data-testid="button-view-bag-toast">Ver sacola</button></div>}
      <CartDrawer items={items} open={bagOpen} onClose={() => setBagOpen(false)} onUpdate={updateItem} onCheckout={() => { setBagOpen(false); setCheckoutOpen(true); }} />
      {checkoutOpen && <Checkout items={items} onClose={() => setCheckoutOpen(false)} onDone={() => { setItems([]); setCheckoutOpen(false); }} />}
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;