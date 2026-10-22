export interface PresentationOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  badge?: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  image: string;
  images?: string[];
  available: boolean;
  ingredientsBadge?: string;
  options: PresentationOption[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number; // Porcentagem (ex: 10 para 10%) ou Valor Fixo em R$ (ex: 5 para R$ 5,00)
  minOrderValue?: number;
  isActive: boolean;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  city: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  instagramHandle: string;
  instagramUrl: string;
  freeDeliveryRule: string;
  freeDeliveryMinUnits: number;
  adminPin: string;
}

export interface HeroInfo {
  title: string;
  subtitle: string;
  badge: string;
  image: string;
}

export const INITIAL_HERO: HeroInfo = {
  title: 'Pequenos momentos, grandes sabores.',
  subtitle:
    'Palha italiana artesanal, preparada com carinho para adoçar o seu dia. Feita com chocolate de verdade, biscoito crocante e generosamente envolvida no leite em pó.',
  badge: 'Tradição • Sabor • Qualidade',
  image: '/images/palha-real-1.jpg',
};

export const INITIAL_STORE_INFO: StoreInfo = {
  name: 'Charneski Doces',
  tagline: 'Palha Italiana Artesanal',
  city: 'Barra do Garças – MT',
  whatsappNumber: '5566992288338',
  whatsappDisplay: '(66) 99228-8338',
  instagramHandle: '@charneski_doces',
  instagramUrl: 'https://www.instagram.com/charneski_doces/',
  freeDeliveryRule: 'Entrega grátis a partir de 2 unidades',
  freeDeliveryMinUnits: 2,
  adminPin: 'charneski321On',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'palha-italiana-tradicional',
    name: 'Palha Italiana Tradicional',
    tagline: 'Enrolada no Ninho',
    description:
      'Uma combinação irresistível de chocolate, biscoito e leite em pó, preparada artesanalmente para proporcionar uma experiência deliciosa a cada pedaço.',
    category: 'Palha Italiana',
    image: '/images/palha-real-2.jpg',
    images: [
      '/images/palha-real-2.jpg',
      '/images/palha-real-1.jpg',
      '/images/palha-real-3.jpg',
    ],
    available: true,
    ingredientsBadge: 'Chocolate nobre & Leite Ninho',
    options: [
      {
        id: 'opcao-padrao-10',
        name: 'Opção 1 — R$ 10,00',
        description: 'Apresentação tradicional individual para adoçar o dia.',
        price: 10.0,
        badge: 'Mais pedida',
      },
      {
        id: 'opcao-especial-15',
        name: 'Opção 2 — R$ 15,00',
        description: 'Apresentação reforçada para quem deseja uma dose extra de sabor.',
        price: 15.0,
        badge: 'Especial',
      },
    ],
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cupom-primeira-compra',
    code: 'BEMVINDO',
    description: '10% de desconto no seu pedido',
    type: 'percentage',
    value: 10,
    minOrderValue: 20,
    isActive: true,
  },
  {
    id: 'cupom-charneski-5',
    code: 'CHARNESKI5',
    description: 'R$ 5,00 de desconto em pedidos acima de R$ 30',
    type: 'fixed',
    value: 5,
    minOrderValue: 30,
    isActive: true,
  },
];
