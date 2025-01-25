# Automation Tool

A monolithic web application that allows users to create automated workflows using a drag-and-drop interface.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, shadcn/ui, React Flow
- **Backend**: Node.js, Express, Apollo Server, TypeGraphQL
- **Package Manager**: pnpm
- **Monorepo Tools**: Turborepo

## Project Structure

```
automation-tool/
├── apps/
│   ├── web/          # Next.js frontend
│   └── server/       # Express + Apollo backend
├── packages/         # Shared utilities and types
├── .github/         # GitHub Actions workflows
├── .vscode/         # VSCode configuration
├── .prompts/        # AI assistance prompts
├── .tasks/          # Task documentation
├── e2e/            # End-to-end tests
└── supabase/       # Supabase configuration
```

## Prerequisites

- Node.js v20+ (managed via `.nvmrc`)
- pnpm 8.15.4 or later
- VSCode (recommended)
- Supabase account
- OpenAI API key
- Gmail API credentials (for email automation)
- Temporal server (local or cloud)

## Getting Started

1. Clone the repository and set up Node.js version:
   ```bash
   nvm use  # This will use the version specified in .nvmrc
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start development servers:
   ```bash
   pnpm dev  # Starts all services
   # Or start individual services:
   pnpm dev:web     # Frontend only
   pnpm dev:server  # Backend only
   ```

   This will start:
   - Frontend at http://localhost:3000
   - Backend at http://localhost:4000/graphql
   - Temporal dev server (if configured)

## Development Commands

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm test` - Run tests across all applications
- `pnpm lint` - Run linting across all applications
- `pnpm temporal:dev` - Start Temporal development server
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:e2e:ui` - Run end-to-end tests with UI

## Testing

### Unit Tests

The project uses Jest for unit testing. Tests are co-located with their implementation files.

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

Key test suites:
- Gmail Integration (`apps/server/tests/gmail.test.ts`)
- OpenAI Integration (`apps/server/tests/openai.test.ts`)
- Web Scraping (`apps/server/tests/scraping.test.ts`)
- Contract Tests (`apps/server/tests/contracts/`)

### E2E Tests

End-to-end tests use Playwright and cover the main workflow builder functionality.

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

Key test scenarios:
- Workflow Builder UI
- Node Configuration
- Workflow Execution
- Authentication Flow

### Preview Deployments

Each pull request gets a preview deployment via Vercel. The preview URL is automatically posted as a comment on the PR.

To set up preview deployments:

1. Create a Vercel project and link it to your repository
2. Add the following secrets to your GitHub repository:
   ```
   VERCEL_TOKEN=<your-vercel-token>
   VERCEL_ORG_ID=<your-org-id>
   VERCEL_PROJECT_ID=<your-project-id>
   ```

3. The preview deployment will be triggered automatically when you create or update a PR.

### Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes and ensure all tests pass:
   ```bash
   pnpm test        # Run unit tests
   pnpm test:e2e    # Run E2E tests
   ```

3. Create a pull request
   - A preview deployment will be created automatically
   - All tests will run in CI
   - Review the preview deployment and test results

4. After approval and successful tests, merge your PR

## License

ISC 
