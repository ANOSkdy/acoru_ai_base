create table if not exists daily_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete restrict,
  work_session_id uuid references work_sessions(id) on delete set null,
  report_date date not null,
  content text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists approval_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  status text not null default 'pending',
  requested_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, target_type, target_id)
);

create table if not exists approval_steps (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid not null references approval_requests(id) on delete cascade,
  step_order integer not null check (step_order > 0),
  reviewer_user_id uuid references users(id) on delete set null,
  status text not null default 'pending',
  reviewed_at timestamptz,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (approval_request_id, step_order)
);

create table if not exists closing_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  label text not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'open',
  created_by uuid references users(id) on delete set null,
  closed_by uuid references users(id) on delete set null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
