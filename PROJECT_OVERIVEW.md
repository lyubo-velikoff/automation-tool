# PROJECT_OVERVIEW

## Project Name
Automation Tool (Similar to Make.com)

---

## Goal
Build a monolithic web application that allows users to create automated workflows using a drag-and-drop interface. Key integrations include Gmail, OpenAI (ChatGPT), and a custom web-scraping module.

---

## Tech Stack

### Frontend
- **Next.js** (React framework)  
- **Tailwind CSS** (utility-first styling)  
- **shadcn/ui** (pre-styled, customizable components for React + Tailwind)  
- **React Flow** (drag-and-drop workflow canvas)

### Backend
- **Node.js** (v20+), using **TypeScript**  
- **Express** (REST endpoints)  
- **Apollo Server** with **TypeGraphQL** (GraphQL layer)  
- **pnpm** (primary package manager)

### Database & Hosting
- **Supabase**:  
  - PostgreSQL database  
  - Authentication & authorization  
  - Optional file/storage needs  
- **Redis** (optional for caching or session management)

### Workflow Orchestration
- **Temporal.io** for:
  - Scheduling and state management of workflows  
  - Automatic retries  
  - Handling long-running processes

---

## Architecture

- **Monolithic**: Both frontend and backend in one repository.  
- **Hybrid API**:  
  - **REST** for simpler endpoints  
  - **GraphQL** (Apollo Server + TypeGraphQL) for more complex data  
- **Drag-and-Drop Builder**: A React Flow–powered UI that stores node/edge configurations in Supabase.

---

## Core Features (MVP)

1. **User Authentication**  
   - Managed by Supabase Auth

2. **Workflow Builder**  
   - Drag-and-drop creation (nodes, edges)  
   - Nodes represent triggers, actions, or conditions

3. **Integrations**  
   - **Gmail** (OAuth2 flow, triggers, actions)  
   - **OpenAI** (Chat/completion endpoints)  
   - **Scraping** (Cheerio, optional Puppeteer/Playwright)

4. **Workflow Execution**  
   - **Temporal.io** for scheduled/event-driven runs (interval-based scheduling)

5. **Logging & Error Handling**  
   - Step-by-step logs in `workflow_logs`  
   - Optional email notifications on failures

6. **Basic Roles**  
   - **User** (create/edit workflows)  
   - **Admin** (oversee usage)

---

## Testing & CI/CD

- **Testing**  
  - **Jest** for unit tests  
  - **Playwright** for end-to-end tests

- **CI/CD**  
  - **GitHub Actions** for building, testing, deploying

---

## Development & Deployment

- **Node.js** (latest LTS, v20+)  
- **pnpm** (package manager)  
- **Supabase** (database + auth)

---

## Roadmap (Beyond MVP)
1. **Advanced Scheduling** (cron-like)  
2. **More Integrations** (Slack, Google Sheets, etc.)  
3. **Usage Plans** (free vs. paid tiers)  
4. **Role-Based Access Control** (multi-tenant)  
5. **Microservices** if scaling demands it

---

## Task Management & Workflow

- **Tasks Folder (`.tasks/`)**: Each milestone has its own markdown file (e.g., `01_project_init.md`).  
- **Git Branching**: Each task is developed in a `feature/task-XX` branch, then merged upon completion.  
- **Continuous Previews**: Each branch can auto-deploy a preview (if configured).

---
