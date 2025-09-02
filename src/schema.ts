export const SCHEMA_SQL = `
create table if not exists users (
  id bigserial primary key,
  tg_id bigint unique not null,
  username text,
  created_at timestamptz default now()
);

create table if not exists usage_counters (
  tg_id bigint not null,
  day date not null,
  used int not null default 0,
  primary key (tg_id, day)
);

create table if not exists cooldowns (
  tg_id bigint primary key,
  last_action_at timestamptz not null default now()
);
`;
