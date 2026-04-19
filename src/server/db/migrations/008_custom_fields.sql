create table if not exists custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  entity_type text not null,
  field_key text not null,
  label text not null,
  field_type text not null,
  is_required boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, entity_type, field_key)
);

create table if not exists custom_field_values (
  id uuid primary key default gen_random_uuid(),
  definition_id uuid not null references custom_field_definitions(id) on delete cascade,
  entity_id uuid not null,
  value_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (definition_id, entity_id)
);
