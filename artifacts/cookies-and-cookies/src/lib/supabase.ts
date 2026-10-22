import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://uiytreumbvaguqqvoiczz.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpeXRreWV1bWJ1YWd1cXZvaWN6eiIsImFub24iLCJpYXQiOjE3OTI2NzIxNjgsImV4cCI6MjEwODI0ODE2OH0.hJNky9g80xrNevkatPA22Hki1M5gY8u_YjsjEL2w74M';
export const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_cpUuM1nm2u5H2faqgrcNxQ_O6yMQ4az';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
  },
});

export const SUPABASE_SQL_SCHEMA = `-- Copie e cole no SQL Editor do seu Supabase para criar as tabelas:

-- 1. Tabela de Configurações da Loja
create table if not exists public.charneski_settings (
  id text primary key default 'default',
  store_name text not null default 'Charneski Doces',
  tagline text not null default 'Palha Italiana Artesanal',
  city text not null default 'Barra do Garças – MT',
  whatsapp_number text not null default '5566992288338',
  whatsapp_display text not null default '(66) 99228-8338',
  instagram_handle text not null default '@charneski_doces',
  instagram_url text not null default 'https://www.instagram.com/charneski_doces/',
  free_delivery_rule text not null default 'Entrega grátis a partir de 2 unidades',
  free_delivery_min_units integer not null default 2,
  hero_title text not null default 'Pequenos momentos, grandes sabores.',
  hero_subtitle text not null default 'Palha italiana artesanal, preparada com carinho para adoçar o seu dia.',
  hero_image text not null default '/images/palha-real-1.jpg',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Produtos
create table if not exists public.charneski_products (
  id text primary key,
  name text not null,
  tagline text not null,
  description text not null,
  category text not null default 'Palha Italiana',
  image text not null,
  images jsonb default '[]'::jsonb,
  available boolean not null default true,
  ingredients_badge text,
  options jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Cupons de Desconto
create table if not exists public.charneski_coupons (
  id text primary key,
  code text not null unique,
  description text,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric not null,
  min_order_value numeric default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar leitura pública para os clientes
alter table public.charneski_settings enable row level security;
alter table public.charneski_products enable row level security;
alter table public.charneski_coupons enable row level security;

create policy "Permitir leitura pública em configurações" on public.charneski_settings for select using (true);
create policy "Permitir leitura pública em produtos" on public.charneski_products for select using (true);
create policy "Permitir leitura pública em cupons" on public.charneski_coupons for select using (true);

create policy "Permitir tudo para anon" on public.charneski_settings for all using (true);
create policy "Permitir tudo para anon produtos" on public.charneski_products for all using (true);
create policy "Permitir tudo para anon cupons" on public.charneski_coupons for all using (true);
`;
