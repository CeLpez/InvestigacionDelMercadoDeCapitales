create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mi portafolio',
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_positions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  symbol text not null,
  company text not null,
  sector text,
  quantity numeric not null check (quantity > 0),
  purchase_price numeric not null check (purchase_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  target_price numeric not null check (target_price >= 0),
  alert_type text not null check (alert_type in ('above', 'below')),
  triggered boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  transaction_type text not null check (transaction_type in ('BUY', 'SELL')),
  shares numeric not null check (shares > 0),
  price numeric not null check (price >= 0),
  executed_at timestamptz not null default now()
);

alter table public.portfolios enable row level security;
alter table public.portfolio_positions enable row level security;
alter table public.price_alerts enable row level security;
alter table public.transactions enable row level security;

create policy "Users manage their portfolios"
  on public.portfolios for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their positions"
  on public.portfolio_positions for all
  using (exists (
    select 1 from public.portfolios
    where portfolios.id = portfolio_positions.portfolio_id
      and portfolios.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.portfolios
    where portfolios.id = portfolio_positions.portfolio_id
      and portfolios.user_id = auth.uid()
  ));

create policy "Users manage their alerts"
  on public.price_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their transactions"
  on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
