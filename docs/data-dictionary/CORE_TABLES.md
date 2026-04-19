# Core Tables

## Identity And Org Structure

- `organizations`: top-level tenant boundary for each deployed system.
- `org_units`: optional internal hierarchy such as departments or branches.
- `users`: server-side application users within an organization.
- `roles`: reusable permission roles.
- `user_roles`: many-to-many assignments between users and roles.

## Customer And Delivery Context

- `clients`: customer companies or billing counterparts.
- `projects`: work scopes or contracts linked to clients.
- `sites`: physical or logical work sites tied to projects.

## Attendance And Work

- `work_categories`: reusable labels for billable or non-billable work.
- `attendance_policies`: policy blobs for attendance validation or rounding.
- `attendance_logs`: raw timekeeping events such as clock-in and break start.
- `work_sessions`: normalized work sessions used for approval and payroll-style flows.
- `work_session_logs`: links between session events and raw attendance logs.
- `work_entries`: granular effort rows associated with a work session.
- `daily_reports`: narrative work summaries for a day or session.

## Approval And Closing

- `approval_requests`: approval envelope for reviewable records.
- `approval_steps`: per-step reviewer records and comments.
- `closing_periods`: accounting or payroll close windows.

## Files, Integrations, And Operations

- `files`: metadata for stored files.
- `external_mappings`: IDs that link internal records to outside systems.
- `export_batches`: export job records for downstream handoff.
- `outbox_events`: pending domain events for integration delivery.
- `audit_logs`: immutable operational audit trail.

## Custom Data

- `custom_field_definitions`: schema metadata for tenant-defined fields.
- `custom_field_values`: values for custom fields on arbitrary entities.
