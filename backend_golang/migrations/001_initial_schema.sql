create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists users (
  id bigserial primary key,
  name varchar(120) not null,
  email varchar(255) not null unique,
  password_hash text not null,
  role varchar(30) not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pages (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  title varchar(160) not null,
  slug varchar(180) not null unique,
  summary text,
  is_published boolean not null default false,
  published_at timestamptz,
  meta_title varchar(200),
  meta_description text,
  og_image varchar(500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists templates (
  id bigserial primary key,
  name varchar(120) not null,
  slug varchar(120) not null unique,
  description varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists template_fields (
  id bigserial primary key,
  template_id bigint not null references templates(id) on delete cascade,
  name varchar(120) not null,
  slug varchar(120) not null,
  type varchar(40) not null default 'text' check (type in ('text', 'image')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_template_field_slug unique (template_id, slug)
);

create table if not exists page_sections (
  id bigserial primary key,
  page_id bigint not null references pages(id) on delete cascade,
  template_id bigint not null references templates(id),
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists section_field_values (
  id bigserial primary key,
  page_section_id bigint not null references page_sections(id) on delete cascade,
  template_field_id bigint not null references template_fields(id) on delete cascade,
  value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_section_field_value unique (page_section_id, template_field_id)
);

create table if not exists token_blocklist (
  id bigserial primary key,
  jti varchar(64) not null unique,
  user_id bigint,
  created_at timestamptz not null default now()
);

create table if not exists page_views (
  id bigserial primary key,
  page_id bigint not null references pages(id) on delete cascade,
  ip_hash varchar(64),
  user_agent varchar(500),
  referrer varchar(500),
  country varchar(10),
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id bigserial primary key,
  user_id bigint not null unique references users(id) on delete cascade,
  plan varchar(20) not null default 'free' check (plan in ('free', 'plus', 'pro_plus')),
  billing_cycle varchar(20) check (billing_cycle in ('monthly', 'yearly')),
  status varchar(20) not null default 'active',
  midtrans_order_id varchar(100) unique,
  midtrans_transaction_id varchar(100),
  amount integer not null default 0,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists page_collaborators (
  id bigserial primary key,
  page_id bigint not null references pages(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  permission varchar(20) not null default 'editor',
  invited_at timestamptz not null default now(),
  constraint uq_page_collaborator unique (page_id, user_id)
);

create table if not exists invitations (
  id bigserial primary key,
  page_id bigint not null references pages(id) on delete cascade,
  sender_id bigint not null references users(id) on delete cascade,
  recipient_id bigint not null references users(id) on delete cascade,
  status varchar(20) not null default 'pending',
  message varchar(500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_invitation unique (page_id, recipient_id)
);

create index if not exists idx_users_email on users(lower(email));
create index if not exists idx_pages_user_id on pages(user_id);
create index if not exists idx_pages_slug on pages(slug);
create index if not exists idx_page_sections_page_position on page_sections(page_id, position);
create index if not exists idx_page_views_page_created on page_views(page_id, created_at desc);
create index if not exists idx_token_blocklist_jti on token_blocklist(jti);
create index if not exists idx_invitations_recipient_status on invitations(recipient_id, status);

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at before update on users for each row execute function set_updated_at();
drop trigger if exists trg_pages_updated_at on pages;
create trigger trg_pages_updated_at before update on pages for each row execute function set_updated_at();
drop trigger if exists trg_templates_updated_at on templates;
create trigger trg_templates_updated_at before update on templates for each row execute function set_updated_at();
drop trigger if exists trg_template_fields_updated_at on template_fields;
create trigger trg_template_fields_updated_at before update on template_fields for each row execute function set_updated_at();
drop trigger if exists trg_page_sections_updated_at on page_sections;
create trigger trg_page_sections_updated_at before update on page_sections for each row execute function set_updated_at();
drop trigger if exists trg_section_field_values_updated_at on section_field_values;
create trigger trg_section_field_values_updated_at before update on section_field_values for each row execute function set_updated_at();
drop trigger if exists trg_subscriptions_updated_at on subscriptions;
create trigger trg_subscriptions_updated_at before update on subscriptions for each row execute function set_updated_at();
drop trigger if exists trg_invitations_updated_at on invitations;
create trigger trg_invitations_updated_at before update on invitations for each row execute function set_updated_at();

alter table users enable row level security;
alter table pages enable row level security;
alter table templates enable row level security;
alter table template_fields enable row level security;
alter table page_sections enable row level security;
alter table section_field_values enable row level security;
alter table token_blocklist enable row level security;
alter table page_views enable row level security;
alter table subscriptions enable row level security;
alter table page_collaborators enable row level security;
alter table invitations enable row level security;

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('instaweb-uploads', 'instaweb-uploads', true)
    on conflict (id) do nothing;
  end if;
end $$;
