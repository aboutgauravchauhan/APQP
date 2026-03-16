-- =============================================================
-- V2: Program Extensions
-- Adds CFT team members, custom milestones, customer reps,
-- contacts, and module permissions
-- =============================================================

-- Program CFT Team Members
CREATE TABLE program_team_members (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    cft_role        VARCHAR(100) NOT NULL,
    is_program_manager BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_ptm_project ON program_team_members(project_id);

-- Program Milestones (custom timeline milestones: PP1, PP2, SOP, SOS, Sample Submission, etc.)
CREATE TABLE program_milestones (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_name  VARCHAR(150) NOT NULL,
    milestone_type  VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',  -- PP1, PP2, SOP, SOS, SAMPLE, CUSTOM
    planned_date    DATE,
    actual_date     DATE,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',  -- PENDING, IN_PROGRESS, COMPLETED, DELAYED
    owner_user_id   BIGINT REFERENCES users(id),
    notes           TEXT,
    sequence_no     INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pm_project ON program_milestones(project_id);

-- Contacts (linked to customer or vendor)
CREATE TABLE contacts (
    id              BIGSERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    email           VARCHAR(150),
    phone           VARCHAR(30),
    job_title       VARCHAR(150),
    department      VARCHAR(100),
    customer_id     BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    vendor_id       BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_contact_linked CHECK (
        (customer_id IS NOT NULL AND vendor_id IS NULL) OR
        (customer_id IS NULL AND vendor_id IS NOT NULL)
    )
);

CREATE INDEX idx_contacts_customer ON contacts(customer_id);
CREATE INDEX idx_contacts_vendor ON contacts(vendor_id);

-- Program Customer Representatives (contacts linked to a program as customer rep)
CREATE TABLE program_customer_reps (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contact_id      BIGINT NOT NULL REFERENCES contacts(id),
    rep_role        VARCHAR(100),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, contact_id)
);

CREATE INDEX idx_pcr_project ON program_customer_reps(project_id);

-- Module Permissions (role-based access per module)
CREATE TABLE module_permissions (
    id          BIGSERIAL PRIMARY KEY,
    role_code   VARCHAR(50) NOT NULL,
    module      VARCHAR(50) NOT NULL,
    can_view    BOOLEAN NOT NULL DEFAULT TRUE,
    can_create  BOOLEAN NOT NULL DEFAULT FALSE,
    can_edit    BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete  BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(role_code, module)
);

-- Seed default module permissions
INSERT INTO module_permissions (role_code, module, can_view, can_create, can_edit, can_delete) VALUES
-- SUPER_ADMIN: full access
('SUPER_ADMIN', 'PROJECTS',    true, true, true, true),
('SUPER_ADMIN', 'BOM',         true, true, true, true),
('SUPER_ADMIN', 'APQP',        true, true, true, true),
('SUPER_ADMIN', 'ECN',         true, true, true, true),
('SUPER_ADMIN', 'PPAP',        true, true, true, true),
('SUPER_ADMIN', 'VENDORS',     true, true, true, true),
('SUPER_ADMIN', 'CUSTOMERS',   true, true, true, true),
('SUPER_ADMIN', 'EMPLOYEES',   true, true, true, true),
('SUPER_ADMIN', 'CONTACTS',    true, true, true, true),
('SUPER_ADMIN', 'SETTINGS',    true, true, true, true),
-- PLANT_HEAD
('PLANT_HEAD', 'PROJECTS',     true, true, true, false),
('PLANT_HEAD', 'BOM',          true, false, false, false),
('PLANT_HEAD', 'APQP',         true, false, true,  false),
('PLANT_HEAD', 'ECN',          true, false, true,  false),
('PLANT_HEAD', 'PPAP',         true, false, false, false),
('PLANT_HEAD', 'VENDORS',      true, false, false, false),
('PLANT_HEAD', 'CUSTOMERS',    true, false, false, false),
('PLANT_HEAD', 'EMPLOYEES',    true, false, false, false),
('PLANT_HEAD', 'CONTACTS',     true, false, false, false),
('PLANT_HEAD', 'SETTINGS',     false, false, false, false),
-- PROGRAM_MANAGER
('PROGRAM_MANAGER', 'PROJECTS',  true, true, true, false),
('PROGRAM_MANAGER', 'BOM',       true, true, true, false),
('PROGRAM_MANAGER', 'APQP',      true, true, true, false),
('PROGRAM_MANAGER', 'ECN',       true, true, true, false),
('PROGRAM_MANAGER', 'PPAP',      true, false, false, false),
('PROGRAM_MANAGER', 'VENDORS',   true, false, false, false),
('PROGRAM_MANAGER', 'CUSTOMERS', true, false, false, false),
('PROGRAM_MANAGER', 'EMPLOYEES', true, false, false, false),
('PROGRAM_MANAGER', 'CONTACTS',  true, false, false, false),
('PROGRAM_MANAGER', 'SETTINGS',  false, false, false, false),
-- QUALITY_ENGINEER
('QUALITY_ENGINEER', 'PROJECTS',  true, false, false, false),
('QUALITY_ENGINEER', 'BOM',       true, false, false, false),
('QUALITY_ENGINEER', 'APQP',      true, true, true, false),
('QUALITY_ENGINEER', 'ECN',       true, false, false, false),
('QUALITY_ENGINEER', 'PPAP',      true, true, true, false),
('QUALITY_ENGINEER', 'VENDORS',   true, false, false, false),
('QUALITY_ENGINEER', 'CUSTOMERS', true, false, false, false),
('QUALITY_ENGINEER', 'EMPLOYEES', true, false, false, false),
('QUALITY_ENGINEER', 'CONTACTS',  true, false, false, false),
('QUALITY_ENGINEER', 'SETTINGS',  false, false, false, false),
-- VIEWER
('VIEWER', 'PROJECTS',  true,  false, false, false),
('VIEWER', 'BOM',       true,  false, false, false),
('VIEWER', 'APQP',      true,  false, false, false),
('VIEWER', 'ECN',       true,  false, false, false),
('VIEWER', 'PPAP',      true,  false, false, false),
('VIEWER', 'VENDORS',   true,  false, false, false),
('VIEWER', 'CUSTOMERS', true,  false, false, false),
('VIEWER', 'EMPLOYEES', false, false, false, false),
('VIEWER', 'CONTACTS',  true,  false, false, false),
('VIEWER', 'SETTINGS',  false, false, false, false);
