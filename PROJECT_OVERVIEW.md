### Core Features (MVP)

### 1. Authentication
- GitHub OAuth via Supabase
- Session management
- Protected routes

### 2. Workflow Builder
- Drag-and-drop interface
- Custom node types:
  - Gmail Trigger (poll for new emails)
  - Gmail Action (send emails)
  - OpenAI Completion (generate AI responses)
- Node configuration:
  - Polling intervals
  - Email filters
  - Templates
  - AI model parameters

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
  - OpenAI completions
- **REST** (Supplementary)
  - File uploads
  - Webhook endpoints
  - Health checks

## Environment Variables
Required variables:
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
``` 
