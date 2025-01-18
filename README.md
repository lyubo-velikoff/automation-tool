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

## License

ISC 
