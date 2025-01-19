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

Run unit tests with Jest:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### E2E Tests

Run end-to-end tests with Playwright:

```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

### Preview Deployments

Each pull request automatically creates a preview deployment on Vercel. The preview URL will be posted as a comment in the PR.

To view the preview deployment:
1. Open the pull request on GitHub
2. Look for the "Vercel" bot comment
3. Click the preview URL

## License

ISC 
