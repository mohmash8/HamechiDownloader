export const SCHEMA_SQL = `
create table if not exists users (
  id bigserial primary key,
  tg_id bigint unique not null,
  username text,
  is_premium boolean default false,
  created_at timestamptz default now()
);

create table if not exists jobs (
  id bigserial primary key,
  user_id bigint references users(id),
  url text not null,
  status text not null default 'queued',
  provider text,
  filename text,
  mime text,
  size_bytes bigint,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists jobs_touch on jobs;
create trigger jobs_touch before update on jobs
for each row execute procedure touch_updated_at();

create table if not exists cooldowns (
  tg_id bigint primary key,
  last_action_at timestamptz not null default now()
);

create table if not exists usage_counters (
  tg_id bigint not null,
  day date not null,
  used int not null default 0,
  primary key (tg_id, day)
);

create table if not exists ads (
  id bigserial primary key,
  text text not null,
  url text,
  is_active boolean default true
);

create table if not exists bans (
  tg_id bigint primary key,
  reason text,
  created_at timestamptz default now()
);
`;
