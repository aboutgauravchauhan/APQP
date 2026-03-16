-- =============================================================
-- APQP Management System - Initial Database Schema
-- V1: Core master tables and project structure
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- =============================================================
-- ENUMERATIONS
-- =============================================================

CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE project_status AS ENUM ('DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE project_type AS ENUM ('NEW_DEVELOPMENT', 'RESOURCING', 'ENGINEERING_CHANGE', 'CAPACITY_EXPANSION');
CREATE TYPE part_type AS ENUM ('ASSEMBLY', 'SUB_ASSEMBLY', 'COMPONENT', 'RAW_MATERIAL', 'BOUGHT_OUT', 'SERVICE');
CREATE TYPE sourcing_type AS ENUM ('INHOUSE', 'BOUGHT_OUT', 'SUBCONTRACT', 'CONSIGNMENT');
CREATE TYPE task_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED', 'OVERDUE');
CREATE TYPE priority_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE risk_level AS ENUM ('GREEN', 'AMBER', 'RED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CONDITIONALLY_APPROVED');
CREATE TYPE vendor_status AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED', 'UNDER_DEVELOPMENT');
CREATE TYPE vendor_approval_status AS ENUM ('NOT_EVALUATED', 'APPROVED', 'CONDITIONAL', 'REJECTED');
CREATE TYPE document_status AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'OBSOLETE', 'REJECTED');
CREATE TYPE ppap_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMIT_REQUIRED');
CREATE TYPE ecn_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'CLOSED');
CREATE TYPE ecn_type AS ENUM ('DESIGN_CHANGE', 'PROCESS_CHANGE', 'MATERIAL_CHANGE', 'VENDOR_CHANGE', 'TOOLING_CHANGE', 'COST_REDUCTION', 'QUALITY_IMPROVEMENT');
CREATE TYPE ecn_severity AS ENUM ('MINOR', 'MODERATE', 'MAJOR');
CREATE TYPE change_object_type AS ENUM ('PART', 'BOM', 'PROCESS', 'TOOLING', 'PPAP', 'VENDOR', 'DOCUMENT', 'MANPOWER');
CREATE TYPE responsibility_type AS ENUM ('RESPONSIBLE', 'ACCOUNTABLE', 'CONSULTED', 'INFORMED');
CREATE TYPE tool_status AS ENUM ('DESIGN', 'MANUFACTURING', 'TRIAL', 'APPROVED', 'SCRAPPED', 'UNDER_REPAIR');
CREATE TYPE validation_result AS ENUM ('PASS', 'FAIL', 'CONDITIONAL_PASS', 'PENDING');
CREATE TYPE ppap_level AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5');
CREATE TYPE notification_type AS ENUM ('TASK_ASSIGNED', 'TASK_OVERDUE', 'APPROVAL_REQUIRED', 'PHASE_BLOCKED', 'ECN_RAISED', 'PPAP_REQUIRED', 'ESCALATION');

-- =============================================================
-- MASTER TABLES
-- =============================================================

CREATE TABLE plants (
    id              BIGSERIAL PRIMARY KEY,
    plant_code      VARCHAR(20) NOT NULL UNIQUE,
    plant_name      VARCHAR(100) NOT NULL,
    location        VARCHAR(200),
    address         TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE departments (
    id              BIGSERIAL PRIMARY KEY,
    department_code VARCHAR(20) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL,
    plant_id        BIGINT REFERENCES plants(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    role_code       VARCHAR(50) NOT NULL UNIQUE,
    role_name       VARCHAR(100) NOT NULL,
    description     TEXT,
    permissions     JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    employee_code   VARCHAR(30) NOT NULL UNIQUE,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    designation     VARCHAR(100),
    department_id   BIGINT REFERENCES departments(id),
    plant_id        BIGINT REFERENCES plants(id),
    role_id         BIGINT REFERENCES roles(id),
    manager_id      BIGINT REFERENCES users(id),
    status          user_status NOT NULL DEFAULT 'ACTIVE',
    last_login      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
    id              BIGSERIAL PRIMARY KEY,
    customer_code   VARCHAR(30) NOT NULL UNIQUE,
    customer_name   VARCHAR(150) NOT NULL,
    oem_type        VARCHAR(50),
    location        VARCHAR(200),
    country         VARCHAR(100),
    contact_person  VARCHAR(150),
    contact_email   VARCHAR(150),
    contact_phone   VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- PROJECT / PROGRAM LAYER
-- =============================================================

CREATE TABLE projects (
    id                  BIGSERIAL PRIMARY KEY,
    mun_no              VARCHAR(30) NOT NULL UNIQUE,  -- Master Unit Number
    project_code        VARCHAR(50) NOT NULL UNIQUE,
    project_name        VARCHAR(200) NOT NULL,
    customer_id         BIGINT NOT NULL REFERENCES customers(id),
    plant_id            BIGINT NOT NULL REFERENCES plants(id),
    vehicle_name        VARCHAR(150),
    vehicle_platform    VARCHAR(100),
    model_name          VARCHAR(100),
    customer_part_no    VARCHAR(100),
    internal_part_no    VARCHAR(100),
    sop_date            DATE,
    sample_date         DATE,
    sos_date            DATE,                         -- Start of Series
    annual_volume       INTEGER,
    daily_volume        INTEGER,
    project_type        project_type NOT NULL DEFAULT 'NEW_DEVELOPMENT',
    status              project_status NOT NULL DEFAULT 'DRAFT',
    risk_level          risk_level NOT NULL DEFAULT 'GREEN',
    risk_remarks        TEXT,
    project_manager_id  BIGINT REFERENCES users(id),
    plant_head_id       BIGINT REFERENCES users(id),
    quality_head_id     BIGINT REFERENCES users(id),
    created_by          BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE project_team (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id             BIGINT NOT NULL REFERENCES users(id),
    function_name       VARCHAR(100),
    responsibility_type responsibility_type NOT NULL DEFAULT 'RESPONSIBLE',
    is_core_team        BOOLEAN NOT NULL DEFAULT FALSE,
    start_date          DATE,
    end_date            DATE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, user_id)
);

-- =============================================================
-- PART / ASSEMBLY LAYER
-- =============================================================

CREATE TABLE parts (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          BIGINT NOT NULL REFERENCES projects(id),
    part_no             VARCHAR(100) NOT NULL,
    part_name           VARCHAR(200) NOT NULL,
    part_type           part_type NOT NULL,
    customer_drawing_no VARCHAR(100),
    internal_drawing_no VARCHAR(100),
    drawing_revision    VARCHAR(20) NOT NULL DEFAULT 'A',
    material_spec       VARCHAR(200),
    material_grade      VARCHAR(100),
    surface_treatment   VARCHAR(100),
    weight_kg           DECIMAL(10,4),
    uom                 VARCHAR(20) NOT NULL DEFAULT 'NOS',
    criticality         VARCHAR(50),   -- Safety / Structural / Non-critical
    sourcing_type       sourcing_type NOT NULL DEFAULT 'INHOUSE',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_by          BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, part_no)
);

CREATE TABLE part_revisions (
    id              BIGSERIAL PRIMARY KEY,
    part_id         BIGINT NOT NULL REFERENCES parts(id),
    revision_no     VARCHAR(20) NOT NULL,
    revision_date   DATE NOT NULL,
    change_reason   TEXT NOT NULL,
    drawing_url     VARCHAR(500),
    is_current      BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by     BIGINT REFERENCES users(id),
    approved_at     TIMESTAMP,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- BOM STRUCTURE
-- =============================================================

CREATE TABLE bom_headers (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id),
    top_part_id     BIGINT NOT NULL REFERENCES parts(id),  -- Assembly root
    bom_revision    VARCHAR(20) NOT NULL DEFAULT '1',
    bom_type        VARCHAR(50) NOT NULL DEFAULT 'ENGINEERING',  -- ENGINEERING / MANUFACTURING
    effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to    DATE,
    status          approval_status NOT NULL DEFAULT 'PENDING',
    is_current      BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    approved_by     BIGINT REFERENCES users(id),
    approved_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bom_lines (
    id                  BIGSERIAL PRIMARY KEY,
    bom_id              BIGINT NOT NULL REFERENCES bom_headers(id) ON DELETE CASCADE,
    parent_part_id      BIGINT NOT NULL REFERENCES parts(id),
    child_part_id       BIGINT NOT NULL REFERENCES parts(id),
    level_no            INTEGER NOT NULL DEFAULT 1,
    sequence_no         INTEGER NOT NULL DEFAULT 10,
    quantity            DECIMAL(12,4) NOT NULL DEFAULT 1,
    uom                 VARCHAR(20) NOT NULL DEFAULT 'NOS',
    scrap_percent       DECIMAL(5,2) NOT NULL DEFAULT 0,
    sourcing_type       sourcing_type NOT NULL DEFAULT 'INHOUSE',
    preferred_vendor_id BIGINT,  -- FK to vendors added later
    find_no             VARCHAR(20),    -- Balloon number in drawing
    remarks             TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- PROCESS ROUTING
-- =============================================================

CREATE TABLE process_routes (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id),
    part_id         BIGINT NOT NULL REFERENCES parts(id),
    route_code      VARCHAR(50) NOT NULL,
    route_name      VARCHAR(200) NOT NULL,
    revision_no     VARCHAR(20) NOT NULL DEFAULT '1',
    is_current      BOOLEAN NOT NULL DEFAULT TRUE,
    approved_by     BIGINT REFERENCES users(id),
    approved_at     TIMESTAMP,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE process_operations (
    id                  BIGSERIAL PRIMARY KEY,
    route_id            BIGINT NOT NULL REFERENCES process_routes(id) ON DELETE CASCADE,
    operation_no        VARCHAR(20) NOT NULL,
    operation_name      VARCHAR(200) NOT NULL,
    operation_type      VARCHAR(100),   -- Pressing / Welding / Painting / Assembly etc.
    workstation         VARCHAR(100),
    machine_no          VARCHAR(50),
    cycle_time_sec      DECIMAL(10,2),
    setup_time_min      DECIMAL(10,2),
    labour_type         VARCHAR(100),
    heads_required      INTEGER NOT NULL DEFAULT 1,
    is_outsourced       BOOLEAN NOT NULL DEFAULT FALSE,
    outsource_vendor_id BIGINT,         -- FK to vendors
    sequence_no         INTEGER NOT NULL,
    remarks             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TOOLING
-- =============================================================

CREATE TABLE tooling_items (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          BIGINT NOT NULL REFERENCES projects(id),
    part_id             BIGINT NOT NULL REFERENCES parts(id),
    operation_id        BIGINT REFERENCES process_operations(id),
    tool_no             VARCHAR(50) NOT NULL UNIQUE,
    tool_name           VARCHAR(200) NOT NULL,
    tool_type           VARCHAR(100) NOT NULL,  -- DIE / FIXTURE / GAUGE / JIG
    tool_category       VARCHAR(100),            -- Press tool / Welding fixture etc.
    tool_supplier_id    BIGINT,                  -- FK to vendors
    tool_cost           DECIMAL(15,2),
    planned_ready_date  DATE,
    actual_ready_date   DATE,
    status              tool_status NOT NULL DEFAULT 'DESIGN',
    trial_stage         VARCHAR(20),             -- T0 / T1 / T2
    drawing_ref         VARCHAR(200),
    remarks             TEXT,
    created_by          BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tooling_trials (
    id              BIGSERIAL PRIMARY KEY,
    tooling_id      BIGINT NOT NULL REFERENCES tooling_items(id),
    trial_stage     VARCHAR(20) NOT NULL,   -- T0 / T1 / T2
    planned_date    DATE,
    actual_date     DATE,
    result          validation_result NOT NULL DEFAULT 'PENDING',
    sample_qty      INTEGER,
    approved_by     BIGINT REFERENCES users(id),
    remarks         TEXT,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- VENDOR MANAGEMENT
-- =============================================================

CREATE TABLE vendors (
    id                  BIGSERIAL PRIMARY KEY,
    vendor_code         VARCHAR(30) NOT NULL UNIQUE,
    vendor_name         VARCHAR(200) NOT NULL,
    vendor_type         VARCHAR(50) NOT NULL,  -- COMPONENT / TOOLING / SERVICE / RM
    location            VARCHAR(200),
    country             VARCHAR(100),
    contact_person      VARCHAR(150),
    contact_email       VARCHAR(150),
    contact_phone       VARCHAR(20),
    gst_no              VARCHAR(30),
    pan_no              VARCHAR(20),
    status              vendor_status NOT NULL DEFAULT 'ACTIVE',
    approval_status     vendor_approval_status NOT NULL DEFAULT 'NOT_EVALUATED',
    approved_by         BIGINT REFERENCES users(id),
    approved_at         TIMESTAMP,
    is_tier2_visible    BOOLEAN NOT NULL DEFAULT FALSE,
    created_by          BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add vendor FK to bom_lines and process_operations
ALTER TABLE bom_lines ADD CONSTRAINT fk_bom_vendor FOREIGN KEY (preferred_vendor_id) REFERENCES vendors(id);
ALTER TABLE process_operations ADD CONSTRAINT fk_op_vendor FOREIGN KEY (outsource_vendor_id) REFERENCES vendors(id);
ALTER TABLE tooling_items ADD CONSTRAINT fk_tool_supplier FOREIGN KEY (tool_supplier_id) REFERENCES vendors(id);

CREATE TABLE vendor_parts (
    id                  BIGSERIAL PRIMARY KEY,
    vendor_id           BIGINT NOT NULL REFERENCES vendors(id),
    part_id             BIGINT NOT NULL REFERENCES parts(id),
    project_id          BIGINT NOT NULL REFERENCES projects(id),
    is_preferred        BOOLEAN NOT NULL DEFAULT FALSE,
    lead_time_days      INTEGER,
    quoted_cost         DECIMAL(15,4),
    approval_status     vendor_approval_status NOT NULL DEFAULT 'NOT_EVALUATED',
    approved_by         BIGINT REFERENCES users(id),
    approved_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (vendor_id, part_id, project_id)
);

CREATE TABLE vendor_assessments (
    id                  BIGSERIAL PRIMARY KEY,
    vendor_id           BIGINT NOT NULL REFERENCES vendors(id),
    project_id          BIGINT REFERENCES projects(id),
    technical_score     DECIMAL(5,2),   -- 0-100
    quality_score       DECIMAL(5,2),
    delivery_score      DECIMAL(5,2),
    tooling_score       DECIMAL(5,2),
    commercial_score    DECIMAL(5,2),
    overall_score       DECIMAL(5,2) GENERATED ALWAYS AS (
                            (COALESCE(technical_score,0) + COALESCE(quality_score,0) +
                             COALESCE(delivery_score,0) + COALESCE(tooling_score,0) +
                             COALESCE(commercial_score,0)) / 5
                        ) STORED,
    assessment_date     DATE NOT NULL,
    assessed_by         BIGINT NOT NULL REFERENCES users(id),
    remarks             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- APQP WORKFLOW
-- =============================================================

CREATE TABLE apqp_phases (
    id              BIGSERIAL PRIMARY KEY,
    phase_code      VARCHAR(20) NOT NULL UNIQUE,
    phase_name      VARCHAR(100) NOT NULL,
    sequence_no     INTEGER NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Seed APQP phases
INSERT INTO apqp_phases (phase_code, phase_name, sequence_no, description) VALUES
('P1', 'Planning & Definition',          1, 'Define project goals, constraints, and preliminary assessments'),
('P2', 'Product Design & Development',   2, 'Design reviews, DFMEAs, prototype builds'),
('P3', 'Process Design & Development',   3, 'Process flow, PFMEA, control plan, tooling design'),
('P4', 'Product & Process Validation',   4, 'Production trials, MSA, SPC, run at rate'),
('P5', 'Launch & Continuous Improvement',5, 'SOP readiness, PPAP submission, lessons learned');

CREATE TABLE apqp_task_templates (
    id                  BIGSERIAL PRIMARY KEY,
    phase_id            BIGINT NOT NULL REFERENCES apqp_phases(id),
    task_code           VARCHAR(30) NOT NULL UNIQUE,
    task_name           VARCHAR(200) NOT NULL,
    description         TEXT,
    default_dept_code   VARCHAR(20),
    is_mandatory        BOOLEAN NOT NULL DEFAULT TRUE,
    sla_days            INTEGER NOT NULL DEFAULT 14,
    document_required   BOOLEAN NOT NULL DEFAULT FALSE,
    document_type_name  VARCHAR(100),
    dependency_codes    TEXT[],     -- Array of task_code dependencies
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed APQP task templates
INSERT INTO apqp_task_templates (phase_id, task_code, task_name, is_mandatory, sla_days, document_required, document_type_name) VALUES
-- Phase 1
(1, 'P1-T01', 'Design Goals Definition',            TRUE, 14, TRUE,  'Design Goals Document'),
(1, 'P1-T02', 'Reliability & Quality Goals',        TRUE, 14, TRUE,  'Reliability Study'),
(1, 'P1-T03', 'Preliminary BOM',                    TRUE, 21, TRUE,  'Preliminary BOM'),
(1, 'P1-T04', 'Preliminary Process Flow Diagram',   TRUE, 21, TRUE,  'Preliminary PFD'),
(1, 'P1-T05', 'Preliminary Special Char. List',     TRUE, 14, TRUE,  'Special Characteristics List'),
(1, 'P1-T06', 'Product Assurance Plan',             TRUE, 21, FALSE, NULL),
(1, 'P1-T07', 'Management Support',                 TRUE, 7,  FALSE, NULL),
-- Phase 2
(2, 'P2-T01', 'Design FMEA (DFMEA)',                TRUE, 30, TRUE,  'DFMEA'),
(2, 'P2-T02', 'Design Verification Plan (DVP)',     TRUE, 21, TRUE,  'DVP&R'),
(2, 'P2-T03', 'Design Reviews',                     TRUE, 14, FALSE, NULL),
(2, 'P2-T04', 'Prototype Build Control Plan',       TRUE, 21, TRUE,  'Prototype Control Plan'),
(2, 'P2-T05', 'Engineering Drawings Release',       TRUE, 30, TRUE,  'Engineering Drawing'),
(2, 'P2-T06', 'Engineering Specifications',         TRUE, 21, TRUE,  'Engineering Spec'),
(2, 'P2-T07', 'Material Specifications',            TRUE, 14, TRUE,  'Material Spec'),
(2, 'P2-T08', 'Drawing & Spec Changes (DV Results)',TRUE, 21, FALSE, NULL),
(2, 'P2-T09', 'New Equipment / Tooling Requirements',TRUE, 28,TRUE,  'Tooling Requirement List'),
(2, 'P2-T10', 'Team Feasibility Commitment',        TRUE, 14, TRUE,  'Feasibility Sign-off'),
-- Phase 3
(3, 'P3-T01', 'Packaging Standards',                TRUE, 14, TRUE,  'Packaging Specification'),
(3, 'P3-T02', 'Process Flow Diagram (PFD)',         TRUE, 21, TRUE,  'Process Flow Diagram'),
(3, 'P3-T03', 'Process FMEA (PFMEA)',               TRUE, 30, TRUE,  'PFMEA'),
(3, 'P3-T04', 'Pre-launch Control Plan',            TRUE, 30, TRUE,  'Pre-launch Control Plan'),
(3, 'P3-T05', 'Process Instructions / SOPs',        TRUE, 21, TRUE,  'SOP'),
(3, 'P3-T06', 'MSA Plan',                           TRUE, 21, TRUE,  'MSA Plan'),
(3, 'P3-T07', 'Preliminary Process Capability Plan',TRUE, 21, TRUE,  'Capability Plan'),
(3, 'P3-T08', 'Tooling Design & Approval',          TRUE, 45, TRUE,  'Tool Drawing'),
(3, 'P3-T09', 'Gauge/Check Fixture Design',         TRUE, 30, TRUE,  'Gauge Drawing'),
(3, 'P3-T10', 'Vendor/Sub-contractor Selection',    TRUE, 30, FALSE, NULL),
-- Phase 4
(4, 'P4-T01', 'Production Trial Run (T0)',          TRUE, 7,  FALSE, NULL),
(4, 'P4-T02', 'Production Trial Run (T1)',          TRUE, 7,  FALSE, NULL),
(4, 'P4-T03', 'Production Trial Run (T2)',          TRUE, 7,  FALSE, NULL),
(4, 'P4-T04', 'Measurement System Analysis (MSA)',  TRUE, 21, TRUE,  'MSA Report'),
(4, 'P4-T05', 'Preliminary Process Capability',     TRUE, 14, TRUE,  'Cpk Study'),
(4, 'P4-T06', 'Production Validation Testing',      TRUE, 21, TRUE,  'PVT Report'),
(4, 'P4-T07', 'Production Control Plan',            TRUE, 21, TRUE,  'Production Control Plan'),
(4, 'P4-T08', 'Run at Rate',                        TRUE, 7,  TRUE,  'Run@Rate Report'),
(4, 'P4-T09', 'Packaging Evaluation',               TRUE, 7,  FALSE, NULL),
(4, 'P4-T10', 'PPAP Submission',                    TRUE, 30, TRUE,  'PSW'),
-- Phase 5
(5, 'P5-T01', 'Reduced Variation',                  FALSE, 90, FALSE, NULL),
(5, 'P5-T02', 'Customer Satisfaction',              FALSE, 90, FALSE, NULL),
(5, 'P5-T03', 'Delivery & Service',                 FALSE, 90, FALSE, NULL),
(5, 'P5-T04', 'Lessons Learned',                    TRUE,  30, TRUE,  'Lessons Learned Document');

CREATE TABLE project_apqp_tasks (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    part_id             BIGINT REFERENCES parts(id),
    phase_id            BIGINT NOT NULL REFERENCES apqp_phases(id),
    template_task_id    BIGINT REFERENCES apqp_task_templates(id),
    task_code           VARCHAR(50) NOT NULL,
    task_name           VARCHAR(200) NOT NULL,
    owner_user_id       BIGINT REFERENCES users(id),
    department_id       BIGINT REFERENCES departments(id),
    planned_start       DATE,
    planned_end         DATE,
    actual_start        DATE,
    actual_end          DATE,
    status              task_status NOT NULL DEFAULT 'NOT_STARTED',
    priority            priority_level NOT NULL DEFAULT 'MEDIUM',
    percent_complete    INTEGER NOT NULL DEFAULT 0 CHECK (percent_complete BETWEEN 0 AND 100),
    dependency_task_id  BIGINT REFERENCES project_apqp_tasks(id),
    is_blocking         BOOLEAN NOT NULL DEFAULT FALSE,
    risk_level          risk_level NOT NULL DEFAULT 'GREEN',
    escalation_level    INTEGER NOT NULL DEFAULT 0,
    remarks             TEXT,
    created_by          BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- DOCUMENT MANAGEMENT
-- =============================================================

CREATE TABLE document_types (
    id                  BIGSERIAL PRIMARY KEY,
    type_code           VARCHAR(30) NOT NULL UNIQUE,
    type_name           VARCHAR(100) NOT NULL,
    category            VARCHAR(50) NOT NULL,  -- APQP / PPAP / DESIGN / QUALITY / COMMERCIAL
    is_mandatory_ppap   BOOLEAN NOT NULL DEFAULT FALSE,
    requires_approval   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          BIGINT NOT NULL REFERENCES projects(id),
    part_id             BIGINT REFERENCES parts(id),
    vendor_id           BIGINT REFERENCES vendors(id),
    task_id             BIGINT REFERENCES project_apqp_tasks(id),
    document_type_id    BIGINT NOT NULL REFERENCES document_types(id),
    title               VARCHAR(300) NOT NULL,
    document_no         VARCHAR(100),
    version_no          VARCHAR(20) NOT NULL DEFAULT '1.0',
    revision_no         VARCHAR(20) NOT NULL DEFAULT 'A',
    file_url            VARCHAR(500),
    file_name           VARCHAR(300),
    file_size_bytes     BIGINT,
    mime_type           VARCHAR(100),
    status              document_status NOT NULL DEFAULT 'DRAFT',
    uploaded_by         BIGINT NOT NULL REFERENCES users(id),
    uploaded_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    approved_by         BIGINT REFERENCES users(id),
    approved_at         TIMESTAMP,
    review_comments     TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- PPAP MANAGEMENT
-- =============================================================

CREATE TABLE ppap_packages (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          BIGINT NOT NULL REFERENCES projects(id),
    part_id             BIGINT NOT NULL REFERENCES parts(id),
    vendor_id           BIGINT REFERENCES vendors(id),
    ppap_level          ppap_level NOT NULL DEFAULT 'LEVEL_3',
    submission_date     DATE,
    customer_submission_date DATE,
    psw_status          ppap_status NOT NULL DEFAULT 'NOT_STARTED',
    overall_status      ppap_status NOT NULL DEFAULT 'NOT_STARTED',
    resubmission_required BOOLEAN NOT NULL DEFAULT FALSE,
    resubmission_reason TEXT,
    customer_dri        VARCHAR(150),   -- Customer DRI for PPAP
    approved_by         BIGINT REFERENCES users(id),
    approved_at         TIMESTAMP,
    created_by          BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ppap_elements (
    id                  BIGSERIAL PRIMARY KEY,
    ppap_id             BIGINT NOT NULL REFERENCES ppap_packages(id) ON DELETE CASCADE,
    document_type_id    BIGINT NOT NULL REFERENCES document_types(id),
    element_name        VARCHAR(200) NOT NULL,
    is_required         BOOLEAN NOT NULL DEFAULT TRUE,
    is_submitted        BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved         BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_document_id BIGINT REFERENCES documents(id),
    due_date            DATE,
    owner_user_id       BIGINT REFERENCES users(id),
    remarks             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ECN / CHANGE MANAGEMENT
-- =============================================================

CREATE TABLE change_requests (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          BIGINT NOT NULL REFERENCES projects(id),
    part_id             BIGINT REFERENCES parts(id),
    ecn_no              VARCHAR(50) NOT NULL UNIQUE,
    ecn_type            ecn_type NOT NULL,
    severity            ecn_severity NOT NULL DEFAULT 'MODERATE',
    title               VARCHAR(300) NOT NULL,
    description         TEXT NOT NULL,
    reason              TEXT NOT NULL,
    impact_cost         DECIMAL(15,2),
    impact_timeline_days INTEGER,
    impact_quality      TEXT,
    status              ecn_status NOT NULL DEFAULT 'DRAFT',
    effective_date      DATE,
    old_revision        VARCHAR(20),
    new_revision        VARCHAR(20),
    requested_by        BIGINT NOT NULL REFERENCES users(id),
    requested_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    approved_by         BIGINT REFERENCES users(id),
    approved_at         TIMESTAMP,
    implemented_by      BIGINT REFERENCES users(id),
    implemented_at      TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ecn_approval_steps (
    id              BIGSERIAL PRIMARY KEY,
    ecn_id          BIGINT NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
    sequence_no     INTEGER NOT NULL,
    role_name       VARCHAR(100) NOT NULL,
    approver_id     BIGINT REFERENCES users(id),
    status          approval_status NOT NULL DEFAULT 'PENDING',
    comments        TEXT,
    actioned_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ecn_impacted_objects (
    id              BIGSERIAL PRIMARY KEY,
    ecn_id          BIGINT NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
    object_type     change_object_type NOT NULL,
    object_id       BIGINT NOT NULL,
    object_ref      VARCHAR(200),   -- Human-readable reference
    old_value       TEXT,
    new_value       TEXT,
    action_required TEXT,
    is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by     BIGINT REFERENCES users(id),
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- VALIDATION / FIRST-TIME-RIGHT
-- =============================================================

CREATE TABLE validation_events (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id),
    part_id         BIGINT NOT NULL REFERENCES parts(id),
    tooling_id      BIGINT REFERENCES tooling_items(id),
    event_type      VARCHAR(30) NOT NULL,   -- T0 / T1 / T2 / PV / DV / RUN_AT_RATE
    planned_date    DATE,
    actual_date     DATE,
    sample_qty      INTEGER,
    accepted_qty    INTEGER,
    rejected_qty    INTEGER,
    result          validation_result NOT NULL DEFAULT 'PENDING',
    conducted_by    BIGINT REFERENCES users(id),
    approved_by     BIGINT REFERENCES users(id),
    remarks         TEXT,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE non_conformities (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          BIGINT NOT NULL REFERENCES projects(id),
    part_id             BIGINT NOT NULL REFERENCES parts(id),
    validation_id       BIGINT REFERENCES validation_events(id),
    vendor_id           BIGINT REFERENCES vendors(id),
    nc_no               VARCHAR(50) NOT NULL UNIQUE,
    title               VARCHAR(300) NOT NULL,
    description         TEXT NOT NULL,
    detected_at         DATE NOT NULL,
    detection_stage     VARCHAR(50),    -- T0 / T1 / T2 / CUSTOMER / INTERNAL
    root_cause          TEXT,
    correction          TEXT,          -- Immediate action
    corrective_action   TEXT,          -- Long-term fix
    preventive_action   TEXT,
    owner_user_id       BIGINT REFERENCES users(id),
    target_date         DATE,
    closure_date        DATE,
    status              VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    recurrence_count    INTEGER NOT NULL DEFAULT 0,
    created_by          BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- NOTIFICATIONS & AUDIT
-- =============================================================

CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    type            notification_type NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       BIGINT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       BIGINT NOT NULL,
    action          VARCHAR(50) NOT NULL,   -- CREATE / UPDATE / DELETE / APPROVE / REJECT
    old_data        JSONB,
    new_data        JSONB,
    changed_by      BIGINT NOT NULL REFERENCES users(id),
    changed_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address      INET,
    user_agent      TEXT
);

-- =============================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================

-- Projects
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_sop_date ON projects(sop_date);
CREATE INDEX idx_projects_mun ON projects(mun_no);

-- Parts
CREATE INDEX idx_parts_project ON parts(project_id);
CREATE INDEX idx_parts_type ON parts(part_type);

-- BOM
CREATE INDEX idx_bom_lines_bom ON bom_lines(bom_id);
CREATE INDEX idx_bom_lines_parent ON bom_lines(parent_part_id);
CREATE INDEX idx_bom_lines_child ON bom_lines(child_part_id);

-- APQP Tasks
CREATE INDEX idx_tasks_project ON project_apqp_tasks(project_id);
CREATE INDEX idx_tasks_phase ON project_apqp_tasks(phase_id);
CREATE INDEX idx_tasks_owner ON project_apqp_tasks(owner_user_id);
CREATE INDEX idx_tasks_status ON project_apqp_tasks(status);
CREATE INDEX idx_tasks_planned_end ON project_apqp_tasks(planned_end);

-- Documents
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_part ON documents(part_id);
CREATE INDEX idx_documents_type ON documents(document_type_id);

-- ECN
CREATE INDEX idx_ecn_project ON change_requests(project_id);
CREATE INDEX idx_ecn_status ON change_requests(status);
CREATE INDEX idx_ecn_impacts ON ecn_impacted_objects(ecn_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Audit
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(changed_by);
CREATE INDEX idx_audit_date ON audit_log(changed_at);

-- =============================================================
-- SEED DATA - Roles
-- =============================================================

INSERT INTO roles (role_code, role_name, description) VALUES
('SUPER_ADMIN',     'Super Administrator',     'Full system access'),
('PLANT_HEAD',      'Plant Head',              'Plant level visibility and approvals'),
('PROGRAM_MANAGER', 'Program Manager',         'Manage projects and APQP'),
('DESIGN_ENGINEER', 'Design Engineer',         'Design and BOM management'),
('MFG_ENGINEER',    'Manufacturing Engineer',  'Process and tooling management'),
('QUALITY_ENGINEER','Quality Engineer',        'Quality planning and PPAP'),
('SCM',             'SCM / Vendor Dev',        'Vendor and sourcing management'),
('TOOLROOM',        'Tool Room Engineer',      'Tooling development and trials'),
('VIEWER',          'Read Only',               'View only access');

-- =============================================================
-- SEED DATA - Document Types
-- =============================================================

INSERT INTO document_types (type_code, type_name, category, is_mandatory_ppap, requires_approval) VALUES
('DFMEA',       'Design FMEA',                      'PPAP', TRUE,  TRUE),
('PFMEA',       'Process FMEA',                     'PPAP', TRUE,  TRUE),
('PFD',         'Process Flow Diagram',              'PPAP', TRUE,  TRUE),
('CTRL_PLAN',   'Control Plan',                     'PPAP', TRUE,  TRUE),
('DIM_REPORT',  'Dimensional Report',               'PPAP', TRUE,  TRUE),
('MSA',         'Measurement System Analysis',      'PPAP', TRUE,  TRUE),
('SPC',         'Capability Study / SPC',           'PPAP', TRUE,  TRUE),
('MATL_CERT',   'Material Certification',           'PPAP', TRUE,  FALSE),
('IMDS',        'IMDS Submission',                  'PPAP', TRUE,  FALSE),
('PSW',         'Part Submission Warrant',          'PPAP', TRUE,  TRUE),
('RUN_RATE',    'Run at Rate Report',               'PPAP', TRUE,  TRUE),
('ENG_DRAWING', 'Engineering Drawing',              'DESIGN', FALSE, TRUE),
('TOOL_DESIGN', 'Tooling Design',                   'DESIGN', FALSE, TRUE),
('SOP',         'Standard Operating Procedure',    'QUALITY', FALSE, TRUE),
('WORK_INSTR',  'Work Instruction',                 'QUALITY', FALSE, FALSE),
('LESSONS',     'Lessons Learned',                  'QUALITY', FALSE, FALSE),
('BOM_DOC',     'Bill of Materials',                'DESIGN', FALSE, TRUE),
('DVP_REPORT',  'DVP&R Report',                     'DESIGN', FALSE, TRUE);

-- =============================================================
-- UPDATED_AT Trigger Function
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'plants', 'departments', 'users', 'customers', 'projects',
        'parts', 'bom_headers', 'bom_lines', 'process_routes', 'process_operations',
        'tooling_items', 'vendors', 'documents', 'ppap_packages', 'ppap_elements',
        'change_requests', 'non_conformities', 'project_apqp_tasks'
    ] LOOP
        EXECUTE format('
            CREATE TRIGGER trg_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END $$;
