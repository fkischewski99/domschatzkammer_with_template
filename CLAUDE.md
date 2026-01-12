# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 SaaS starter kit monorepo using Turborepo and pnpm workspaces. The project consists of three apps and multiple shared packages under the `@workspace/*` namespace.

## Common Commands

```bash
# Development
pnpm dev                           # Start all apps in parallel
pnpm --filter dashboard dev        # Start only dashboard (port 3000)
pnpm --filter marketing dev        # Start only marketing (port 3001)
pnpm --filter public-api dev       # Start only public API (port 3002)

# Building & Type Checking
pnpm build                         # Build all apps
pnpm typecheck                     # Run TypeScript checks across all packages

# Linting & Formatting
pnpm lint                          # Lint all packages
pnpm lint:fix                      # Auto-fix lint issues
pnpm format                        # Check formatting
pnpm format:fix                    # Auto-fix formatting

# Database (Prisma)
pnpm --filter @workspace/database migrate dev          # Run migrations
pnpm --filter @workspace/database generate             # Generate Prisma client
pnpm --filter @workspace/database studio               # Open Prisma Studio (port 3003)

# Testing (Playwright E2E)
pnpm test                          # Run all E2E tests
npx playwright test e2e/ticket-management.spec.ts     # Run single test file
npx playwright test --project=chromium                # Run tests in specific browser

# Dependency Management
pnpm syncpack:list                 # Check for mismatched versions
pnpm syncpack:fix                  # Fix version mismatches
```

## Architecture

### Apps
- **dashboard** (`apps/dashboard`) - Main web application with auth, billing, organization management
- **marketing** (`apps/marketing`) - Public marketing pages
- **public-api** (`apps/public-api`) - REST API with Swagger documentation

### Key Packages
- `@workspace/database` - Prisma schema and client
- `@workspace/auth` - NextAuth.js authentication with context helpers
- `@workspace/billing` - Stripe payment integration
- `@workspace/ui` - Shadcn UI components
- `@workspace/email` - React Email templates
- `@workspace/i18n` - Internationalization (next-intl)

### Security Patterns
- Never trust user input for `organizationId` or `userId` - always use context values
- Use `getAuthContext()` for user-scoped data
- Use `getAuthOrganizationContext()` for organization-scoped data
- Validate all inputs with Zod schemas

### State Management
- **URL State**: Use Nuqs (`useQueryState`, `createSearchParamsCache`) for shareable state
- **Forms**: React Hook Form with Zod validation
- **Modals**: NiceModal with `useEnhancedModal` hook

## File Conventions

- Kebab-case for files: `add-item-form.tsx`
- Schema files: `*-schema.ts` in `/schemas`
- Data fetching: `get-*.ts` in `/data`
- Server actions: `/actions` folder
- DTOs: `*-dto.ts` in `/types/dtos`

## Important Skills
- ALWAYS test your progress with the crome extension and the browser-feature-tester agent
- 
