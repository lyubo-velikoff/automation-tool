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
└── packages/
    └── shared/       # Shared utilities and types
```

## Prerequisites

- Node.js v20+
- pnpm (latest version)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development servers:
   ```bash
   pnpm dev
   ```

   This will start:
   - Frontend at http://localhost:3000
   - Backend at http://localhost:4000/graphql

## Development Commands

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm test` - Run tests across all applications
- `pnpm lint` - Run linting across all applications

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
