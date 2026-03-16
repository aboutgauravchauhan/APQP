# APQP Management System

> Advanced Product Quality Planning platform for automotive component development.

## Overview

A full-stack enterprise application that acts as a **Product Development Operating System** for Tier-1 automotive suppliers. Manages the complete APQP lifecycle from program creation to PPAP submission.

## Architecture

```
Customer → Program/Project → Assembly → Sub Assembly → Part
    → Process Routing → Tooling → Vendor
    → APQP Phases → Tasks/Deliverables
    → PPAP Package → ECN/Change Management
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 17 |
| Frontend | Angular 17, Angular Material |
| Database | PostgreSQL 16 with Flyway migrations |
| Document Storage | MinIO (S3 compatible) |
| Auth | JWT (JJWT 0.12) |
| Containerization | Docker + Docker Compose |

## Core Modules

1. **Project/Program Management** — MUN number generation, RACI team, Gantt tracking
2. **BOM Studio** — 3-panel hierarchical Assembly → Part tree with impact panel
3. **APQP Workflow Engine** — 5-phase task tracking with auto-generation from templates
4. **ECN Impact Engine** — Automatic impact analysis across BOM, Process, Tooling, PPAP
5. **PPAP Cockpit** — All 18 PPAP elements with submission and approval tracking
6. **Vendor Management** — Qualification, scorecard, and approval workflow
7. **Executive Dashboard** — KPIs, RAG status, alerts, program health overview

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 17+ (for local development)
- Node.js 20+ (for local frontend development)

### Run with Docker Compose

```bash
docker-compose up -d
```

Services will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui
- **MinIO Console**: http://localhost:9001

### Local Development

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## Database Schema

The schema is managed via Flyway migrations in `backend/src/main/resources/db/migration/`.

### Core Entities

- `projects` — Master program entity (MUN number is the root key)
- `parts` — Parts and assemblies with revision tracking
- `bom_headers` / `bom_lines` — Full hierarchical BOM
- `apqp_phases` / `project_apqp_tasks` — APQP task management
- `change_requests` / `ecn_impacted_objects` — ECN impact engine
- `ppap_packages` / `ppap_elements` — PPAP tracking
- `vendors` / `vendor_assessments` — Vendor qualification

## Key Business Rules (Enforced)

- No project without MUN/project code (auto-generated)
- APQP tasks auto-generated from templates on project creation
- ECN approval triggers automatic impact analysis and APQP task reopening
- PPAP packages flagged for resubmission when ECN is approved for the part
- Overdue tasks auto-detected by daily scheduler

## API Documentation

Swagger UI available at: `/api/swagger-ui` when running.

## Default Roles

| Role | Access |
|------|--------|
| SUPER_ADMIN | Full system access |
| PLANT_HEAD | Plant visibility + approvals |
| PROGRAM_MANAGER | Project + APQP management |
| DESIGN_ENGINEER | Design + BOM |
| MFG_ENGINEER | Process + Tooling |
| QUALITY_ENGINEER | Quality + PPAP |
| SCM | Vendor management |
| TOOLROOM | Tooling management |
| VIEWER | Read-only |
