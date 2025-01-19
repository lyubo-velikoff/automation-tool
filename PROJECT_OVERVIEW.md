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

### Frontend (.env in apps/web)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend (.env in apps/server)
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# Gmail API (for Gmail actions/triggers)
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=http://localhost:4000/auth/gmail/callback
```

### Environment Variables Overview

1. **Supabase Configuration**
   - Frontend needs public URL and anon key for client-side operations
   - Backend needs URL and service key for admin operations

2. **API Configuration**
   - Frontend needs API URL for GraphQL client
   - Backend needs CORS configuration and port

3. **OpenAI Configuration**
   - Backend needs API key for AI completions

4. **Gmail Integration**
   - Backend needs OAuth credentials for Gmail API access
   - Required for Gmail triggers and actions

5. **Development Settings**
   - NODE_ENV for environment-specific behavior
   - PORT for server configuration

### Authentication Configuration

1. **GitHub OAuth Setup**
   - Create OAuth app in GitHub (Settings -> Developer Settings -> OAuth Apps)
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`
   - Configure in Supabase Dashboard:
     - Authentication -> Providers -> GitHub
     - Enable and add Client ID and Secret
   
2. **Required Environment Variables**
   ```bash
   # GitHub OAuth (optional - can be configured in Supabase dashboard)
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
   ```
