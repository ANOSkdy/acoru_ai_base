create table if not exists attendance_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete restrict,
  site_id uuid references sites(id) on delete set null,
  log_type text not null,
  occurred_at timestamptz not null,
  source text not null,
  work_session_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists work_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete restrict,
  project_id uuid references projects(id) on delete set null,
  site_id uuid references sites(id) on delete set null,
  work_category_id uuid references work_categories(id) on delete set null,
  attendance_policy_id uuid references attendance_policies(id) on delete set null,
  session_date date not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  status text not null default 'draft',
  notes text,
  approved_at timestamptz,
  approved_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table attendance_logs
  add constraint attendance_logs_work_session_fk
  foreign key (work_session_id) references work_sessions(id) on delete set null;

create table if not exists work_session_logs (
  id uuid primary key default gen_random_uuid(),
  work_session_id uuid not null references work_sessions(id) on delete cascade,
  attendance_log_id uuid references attendance_logs(id) on delete set null,
  event_type text not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists work_entries (
  id uuid primary key default gen_random_uuid(),
  work_session_id uuid not null references work_sessions(id) on delete cascade,
  entry_date date not null,
  minutes_worked integer not null check (minutes_worked >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
