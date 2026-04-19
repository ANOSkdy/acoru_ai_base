insert into organizations (id, code, name, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'acoru',
  'Acoru Sample Organization',
  'active'
)
on conflict (id) do nothing;

insert into org_units (id, organization_id, code, name)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'hq',
  'Headquarters'
)
on conflict (id) do nothing;

insert into users (id, organization_id, org_unit_id, email, display_name, employee_code, status)
values (
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  'admin@acoru.local',
  'Acoru Admin',
  'EMP-0001',
  'active'
)
on conflict (id) do nothing;

insert into roles (id, code, name, description)
values
  ('00000000-0000-0000-0000-000000000201', 'platform_admin', 'Platform Admin', 'Full baseline administration access'),
  ('00000000-0000-0000-0000-000000000202', 'manager', 'Manager', 'Approves work sessions and closing periods'),
  ('00000000-0000-0000-0000-000000000203', 'worker', 'Worker', 'Creates attendance logs and daily work records')
on conflict (id) do nothing;

insert into user_roles (user_id, role_id, assigned_by)
values
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000100'),
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000100')
on conflict do nothing;

insert into clients (id, organization_id, code, name, status)
values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  'sample-client',
  'Sample Client',
  'active'
)
on conflict (id) do nothing;

insert into projects (id, organization_id, client_id, code, name, status, starts_on)
values (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000301',
  'sample-project',
  'Sample Project',
  'active',
  current_date
)
on conflict (id) do nothing;

insert into sites (id, organization_id, project_id, code, name, timezone, status)
values (
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000401',
  'tokyo-main',
  'Tokyo Main Site',
  'Asia/Tokyo',
  'active'
)
on conflict (id) do nothing;

insert into work_categories (id, organization_id, code, name, category_type, is_billable)
values (
  '00000000-0000-0000-0000-000000000601',
  '00000000-0000-0000-0000-000000000001',
  'regular',
  'Regular Work',
  'standard',
  true
)
on conflict (id) do nothing;

insert into attendance_policies (id, organization_id, code, name, rules)
values (
  '00000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000001',
  'default',
  'Default Attendance Policy',
  '{"roundingMinutes":15,"breakRequiredAfterHours":6}'::jsonb
)
on conflict (id) do nothing;

insert into work_sessions (
  id,
  organization_id,
  user_id,
  project_id,
  site_id,
  work_category_id,
  attendance_policy_id,
  session_date,
  started_at,
  ended_at,
  status,
  notes
)
values (
  '00000000-0000-0000-0000-000000000801',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000601',
  '00000000-0000-0000-0000-000000000701',
  current_date,
  now() - interval '8 hours',
  now() - interval '1 hour',
  'submitted',
  'Seed work session for local API verification'
)
on conflict (id) do nothing;
