# Database Architecture Design

This document details the multi-tenant database design for Chitraspanda Studios. The storage system uses a polyglot persistence architecture combining PostgreSQL (for structured relational business data and core entities) and MongoDB (for dynamic, document-oriented data such as asset metadata and LMS content structures).

---

## 1. Multi-Tenant Strategy

Chitraspanda Studios uses a **Shared Database, Shared Schema** multi-tenant model.
*   **Isolation Mechanic**: Every table (except global platform settings) contains a `tenant_id` UUID column.
*   **Query Enforcement**: All database queries must include a tenant filter. PostgreSQL **Row-Level Security (RLS)** is enabled on all tables to enforce this tenant-level boundary at the database connection pool level.
*   **Scalability**: Read-heavy modules (like global metrics or public websites) route queries to dedicated read replicas.

---

## 2. PostgreSQL Relational Schema (DDL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. TENANTS & USERS
-- =========================================================================

CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(63) NOT NULL UNIQUE,
    subscription_plan VARCHAR(31) NOT NULL DEFAULT 'standard', -- standard, professional, enterprise
    status VARCHAR(31) NOT NULL DEFAULT 'active', -- active, suspended, cancelled
    bank_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    role_id INT PRIMARY KEY,
    name VARCHAR(63) NOT NULL UNIQUE
);

-- Seed static roles
INSERT INTO roles (role_id, name) VALUES
(1, 'super_admin'), (2, 'studio_owner'), (3, 'director'), (4, 'producer'),
(5, 'project_manager'), (6, 'team_lead'), (7, 'animator'), (8, 'designer'),
(9, 'storyboard_artist'), (10, 'editor'), (11, 'voice_artist'), (12, 'freelancer'),
(13, 'client'), (14, 'hr'), (15, 'recruiter'), (16, 'finance'),
(17, 'academy_director'), (18, 'trainer'), (19, 'student'), (20, 'intern'),
(21, 'mentor'), (22, 'id_card_admin'), (23, 'visitor_public');

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(role_id),
    phone VARCHAR(31),
    status VARCHAR(31) NOT NULL DEFAULT 'onboarding', -- onboarding, active, suspended, inactive
    mfa_secret VARCHAR(127),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, email)
);

-- =========================================================================
-- 2. PROJECTS & TEAMS
-- =========================================================================

CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(31) NOT NULL DEFAULT 'pre-production', -- planning, pre-production, production, post-production, delivered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_members (
    member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    allocation_percentage INT NOT NULL DEFAULT 100, -- for multi-project booking
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- =========================================================================
-- 3. TASKS & WORKFLOWS
-- =========================================================================

CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL,
    status VARCHAR(31) NOT NULL DEFAULT 'backlog', -- backlog, todo, in_progress, QA_review, director_review, client_review, approved
    priority VARCHAR(15) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    due_date DATE,
    estimated_hours NUMERIC(6, 2),
    actual_hours NUMERIC(6, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 4. DIGITAL ASSETS (DAM SYSTEM)
-- =========================================================================

CREATE TABLE assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(63) NOT NULL, -- fbx, blend, obj, wav, mp4, png
    version INT NOT NULL DEFAULT 1,
    uploader_id UUID NOT NULL REFERENCES users(user_id),
    status VARCHAR(31) NOT NULL DEFAULT 'uploaded', -- uploaded, processing, technical_approved, creative_approved, rejected
    s3_uri VARCHAR(511) NOT NULL,
    parent_asset_id UUID REFERENCES assets(asset_id) ON DELETE SET NULL,
    mongo_metadata_id VARCHAR(24), -- Reference to MongoDB record for custom parameters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 5. HRMS MODULE (EMPLOYEES, ATTENDANCE, LEAVE)
-- =========================================================================

CREATE TABLE hr_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    job_title VARCHAR(127) NOT NULL,
    department VARCHAR(127) NOT NULL,
    salary_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    joined_date DATE NOT NULL,
    tax_identifier VARCHAR(63),
    contract_url TEXT
);

CREATE TABLE leaves (
    leave_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type VARCHAR(31) NOT NULL, -- sick, casual, annual, maternity
    status VARCHAR(31) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    reason TEXT,
    approved_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
    attendance_id PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    gps_latitude NUMERIC(10, 8),
    gps_longitude NUMERIC(11, 8),
    device_id VARCHAR(127),
    verification_method VARCHAR(31) NOT NULL DEFAULT 'QR' -- QR, Bio, Remote
);

-- =========================================================================
-- 6. FINANCE SYSTEM (BUDGETS, INVOICES, EXPENSES)
-- =========================================================================

CREATE TABLE invoices (
    invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(user_id),
    project_id UUID REFERENCES projects(project_id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(7) DEFAULT 'USD',
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    status VARCHAR(31) NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, voided
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    expense_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(user_id),
    project_id UUID REFERENCES projects(project_id) ON DELETE SET NULL,
    category VARCHAR(63) NOT NULL, -- travel, software, hardware, office
    amount NUMERIC(12, 2) NOT NULL,
    receipt_url TEXT,
    status VARCHAR(31) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 7. ACADEMY & LMS
-- =========================================================================

CREATE TABLE courses (
    course_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trainer_id UUID NOT NULL REFERENCES users(user_id),
    duration_weeks INT NOT NULL DEFAULT 8,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 0, -- percentage
    grade VARCHAR(7),
    status VARCHAR(31) NOT NULL DEFAULT 'active' -- active, completed, dropped
);

-- =========================================================================
-- 8. DIGITAL ID CARDS
-- =========================================================================

CREATE TABLE digital_ids (
    card_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    qr_code_hash VARCHAR(255) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(31) NOT NULL DEFAULT 'active', -- active, suspended, expired
    access_zones VARCHAR(127)[] DEFAULT ARRAY['main_lobby'], -- security levels
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 9. AUDIT LOGS
-- =========================================================================

CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(511),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Database Indexing Strategy

To guarantee rapid query performance at scale (100,000+ users), the following composite and partial indexes are deployed:

```sql
-- Index for tenant-specific user lookup (Critical for authentication/RLS)
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);

-- Composite index for asset queries filtered by project and status
CREATE INDEX idx_assets_project_status ON assets(project_id, status);

-- Index on tasks for rapid task boards loading per assignee
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status);

-- Partial index for active digital IDs check
CREATE INDEX idx_active_digital_ids ON digital_ids(qr_code_hash) WHERE status = 'active';

-- Index on audit logs for timeline querying
CREATE INDEX idx_audit_logs_tenant_time ON audit_logs(tenant_id, timestamp DESC);
```

---

## 4. NoSQL Document Store Schema Design (MongoDB)

MongoDB is integrated into the architecture to handle variable schemas, such as dynamic assets details and course curricula contents.

### Collection: `asset_metadata`
Stores detailed, tool-specific parameters for files created in Maya, Blender, or Audio tools, referenced via `mongo_metadata_id` in PostgreSQL:

```json
{
  "_id": "60a8b9487c6742001f54f2a7",
  "asset_id": "c1f7b038-7f91-4c6e-8263-2b63cb0ef3e8",
  "project_id": "b3e8b038-7f91-4c6e-8263-2b63cb0ef4a9",
  "mesh_data": {
    "poly_count": 48293,
    "rigged": true,
    "bones_count": 128,
    "target_platforms": ["UnrealEngine5", "Unity"]
  },
  "textures": [
    { "name": "base_color", "resolution": "4K", "format": "png" },
    { "name": "normal_map", "resolution": "4K", "format": "png" }
  ],
  "dependencies": [
    "50f7b038-7f91-4c6e-8263-2b63cb0ef300",
    "80a8b948-7c67-4200-1f54-f2a7db0ef3c8"
  ],
  "history": [
    { "version": 1, "comment": "Initial layout sketch", "timestamp": "2026-06-22T10:00:00Z" }
  ]
}
```

### Collection: `course_contents`
Stores courses modules, lessons, video URLs, and question banks, facilitating rich LMS content delivery:

```json
{
  "_id": "60b8b9487c6742001f54f3c2",
  "course_id": "d2f7b038-7f91-4c6e-8263-2b63cb0ef445",
  "modules": [
    {
      "module_id": "mod_01",
      "title": "Introduction to 3D Rigging",
      "lessons": [
        {
          "lesson_id": "les_1a",
          "title": "Understanding Skeleton Hierarchies",
          "video_s3_url": "https://cdn.chitraspanda.com/courses/lessons/rigging_intro.mp4",
          "duration_minutes": 25,
          "quiz": {
            "questions": [
              {
                "question_id": "q1",
                "question_text": "What is the root joint of a character?",
                "options": ["Hip", "Spine", "Head", "Foot"],
                "correct_option_index": 0
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## 5. Row-Level Security (RLS) Policies

To enforce multi-tenant separation, RLS is enabled in PostgreSQL. Application servers must set the session context parameter `app.current_tenant_id` upon establishing a client session.

```sql
-- 1. Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 2. Define Tenant Isolation helper function
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

-- 3. Establish RLS Policies
CREATE POLICY user_tenant_isolation ON users
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

CREATE POLICY project_tenant_isolation ON projects
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

CREATE POLICY task_tenant_isolation ON tasks
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

CREATE POLICY asset_tenant_isolation ON assets
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

CREATE POLICY invoice_tenant_isolation ON invoices
    FOR ALL
    USING (tenant_id = get_current_tenant_id());
```
