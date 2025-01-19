# PROJECT_OVERVIEW

## Project Name
Automation Tool (Similar to Make.com)

---

## Goal
Build a monolithic web application that allows users to create automated workflows using a drag-and-drop interface. Key integrations include Gmail, OpenAI (ChatGPT), and a custom web-scraping module.

---

## Project Structure

```
automation-tool/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/        # Next.js app router pages
│   │   │   ├── components/ # React components
│   │   │   │   ├── ui/    # shadcn/ui components
│   │   │   │   └── workflow/ # Workflow-specific components
│   │   │   ├── graphql/   # Apollo Client setup & operations
│   │   │   └── lib/       # Utilities and configurations
│   │   └── public/        # Static assets
│   └── server/            # Express + Apollo backend
│       ├── src/
│       │   ├── resolvers/ # TypeGraphQL resolvers
│       │   ├── schema/    # TypeGraphQL type definitions
│       │   └── services/  # Business logic & integrations
│       └── tests/         # Server-side tests
├── packages/              # Shared packages (future use)
├── .tasks/               # Task documentation
└── supabase/            # Supabase configurations
```

---

## Tech Stack

### Frontend
- **Next.js** (v15.1.5)
  - App Router for routing
  - React Server Components
  - API Routes for backend communication
- **Tailwind CSS** with **shadcn/ui**
  - Custom theme configuration
  - Pre-built accessible components
- **React Flow** (v11.11.4)
  - Drag-and-drop workflow canvas
  - Custom node types for Gmail integration
- **Apollo Client** (v3.12.6)
  - GraphQL state management
  - Type-safe queries and mutations

### Backend
- **Node.js** (v20+) with **TypeScript**
- **Express** (v4.21.2)
  - REST endpoints for specific operations
  - Session management
  - CORS configuration
- **Apollo Server Express** (v3.13.0)
  - GraphQL API layer
  - Type-safe resolvers
- **TypeGraphQL** (v2.0.0-rc.2)
  - Decorator-based schema definition
  - Automatic type inference
  - Built-in validation

### Database & Auth
- **Supabase**
  - PostgreSQL for data storage
  - Auth with multiple providers (GitHub)
  - Row Level Security (RLS)
  - Service role for admin operations

### Development Tools
- **pnpm** (v8.15.4) - Package management
- **Turborepo** - Monorepo management
  - Optimized builds
  - Task orchestration
  - Cache sharing
- **ESLint** & **TypeScript**
  - Strict type checking
  - Code style enforcement

---

## Core Features (MVP)

### 1. Authentication
- GitHub OAuth via Supabase
- Session management
- Protected routes

### 2. Workflow Builder
- Drag-and-drop interface
- Custom node types:
  - Gmail Trigger (poll for new emails)
  - Gmail Action (send emails)
- Node configuration:
  - Polling intervals
  - Email filters
  - Templates

### 3. Data Model
```typescript
// Key types for workflow data
interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  user_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  data?: NodeData;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}
```

### 4. API Structure
- **GraphQL** (Primary API)
  - Workflow CRUD operations
  - Type-safe schema
  - Real-time updates (planned)
- **REST** (Supplementary)
  - File uploads
  - Webhook endpoints
  - Health checks

---

## Development Guidelines

### 1. Code Organization
- Feature-based component structure
- Shared UI components in `components/ui`
- Business logic in appropriate services
- Type definitions close to usage

### 2. Type Safety
- TypeScript `strict` mode enabled
- GraphQL types generated from schema
- Zod for runtime validation
- No `any` types unless absolutely necessary

### 3. State Management
- React Query for server state
- React Context for UI state
- Apollo Client for GraphQL state
- Local storage for preferences

### 4. Testing
- Jest for unit tests
- React Testing Library for components
- Playwright for E2E tests
- GraphQL schema tests

---

## Environment Setup
Required environment variables:
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
```

---

## Commands
```bash
# Development
pnpm dev          # Start all services
pnpm dev:web      # Start frontend only
pnpm dev:server   # Start backend only

# Building
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm lint         # Lint all code
```

---
