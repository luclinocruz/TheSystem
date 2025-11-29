# The System - Life RPG SaaS

## Overview

The System is a gamified personal development SaaS application inspired by Korean manhwa RPGs (particularly Solo Leveling). It transforms real-life personal development into an immersive RPG experience with a cold, data-driven AI system that monitors user progress, generates personalized quests, and tracks evolution through stats and levels.

The application provides three core features:
1. **Journaling** - AI-powered daily reflection that analyzes user input and converts it into game mechanics (XP, stats, quest generation)
2. **Mapping** - Visual analytics showing productivity trends, discipline scores, and behavioral patterns
3. **Acting** - Dynamic quest generation system that breaks down large goals into progressive daily missions

The design aesthetic is dark, cyberpunk, and neon-lit with a manhwa/Solo Leveling visual style - meant to feel like an omniscient system overlay rather than a playful gamification app.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool

**UI Component System**: 
- Shadcn/UI components with Radix UI primitives for accessibility
- Custom "System" components that implement the manhwa RPG aesthetic
- Tailwind CSS for styling with a dark cyberpunk theme (slate backgrounds, cyan accents, neon glows)

**State Management**:
- TanStack Query (React Query) for server state management
- Local React state for UI interactions
- Custom QueryClient configuration with disabled refetching to minimize API calls

**Routing**: Wouter for lightweight client-side routing

**Design System**:
- Color palette: Deep slate/charcoal backgrounds with cyan neon accents
- Typography: System fonts for readability, monospace for stats/numbers, uppercase tracking for headers
- Visual effects: Subtle glows, holographic card designs, gradient overlays
- Component hierarchy: PlayerCard, StatPanel, QuestCard, JournalChat, MappingPanel

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**Application Structure**:
- RESTful API design with routes defined in `server/routes.ts`
- HTTP server created with Node's native `http` module
- Middleware stack: JSON parsing, URL encoding, custom logging

**Key API Endpoints**:
- `GET /api/player` - Retrieve player data
- `POST /api/player` - Create new player with onboarding data
- Quest management endpoints (get, create, update, delete)
- Journal entry creation with AI analysis
- Habit logging and system messages

**Storage Layer**:
- Abstract storage interface (`IStorage`) for database operations
- In-memory storage implementation (`MemStorage`) as default
- Schema designed for PostgreSQL with Drizzle ORM (prepared but not actively used yet)
- Storage handles: Players, Quests, Journal Entries, Habit Logs, System Messages

**AI Integration**:
- Google Gemini AI for journal analysis and quest generation
- Custom prompts that enforce "The System" persona (cold, objective, RPG-focused)
- AI analyzes user input to calculate XP, stat changes, productivity/discipline scores
- Generates suggested quests based on user progress and failures

### Data Models

**Player Schema**:
- Identity: id, name, title, job, level
- Progression: currentXp, maxXp, pointsAvailable
- Resources: hp, maxHp, mp, maxMp, gold
- Stats: forca (strength), inteligencia (intelligence), agilidade (agility), vitalidade (vitality), sentidos (senses)
- Goal: mainGoal

**Quest Schema**:
- Classification: type (DIÁRIA, URGENTE, MAIN, OCULTA, PENALIDADE), difficulty (E-S ranking)
- Content: title, description
- Rewards: xp, statReward
- Status: completed, createdAt, completedAt

**Journal Entry Schema**:
- User input: content, createdAt
- AI analysis: xpGained, statsGained, productivityScore, disciplineScore, systemMessage

**Habit Log Schema**:
- Tracking: date, productivityScore, disciplineScore
- Used for generating the mapping/analytics visualizations

### Build System

**Development**:
- Vite dev server with HMR
- Custom Vite setup in `server/vite.ts` for middleware mode
- Replit-specific plugins for error overlay and development tools

**Production**:
- Custom build script using esbuild for server bundling
- Vite for client-side bundling
- Dependency bundling strategy with allowlist for cold start optimization
- Output: `dist/public` for client, `dist/index.cjs` for server

## External Dependencies

### Third-Party Services

**AI Service**: Google Gemini API
- Purpose: Natural language processing for journal analysis and quest generation
- Implementation: `@google/genai` package
- Configuration: API key via `GEMINI_API_KEY` environment variable
- Usage: Analyzes journal entries, generates quests, provides system messages in character

**Database**: PostgreSQL via Neon (ACTIVE)
- ORM: Drizzle ORM with Drizzle Kit for migrations
- Connection: `@neondatabase/serverless` package with WebSocket support
- Configuration: `DATABASE_URL` environment variable
- Current Status: **FULLY INTEGRATED** - DatabaseStorage implementation active, all data persisted to PostgreSQL
- Tables: players, quests, journal_entries, habit_logs, system_messages

### UI Component Libraries

**Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- Components: Dialog, Dropdown, Popover, Tooltip, Accordion, Tabs, and 20+ others
- Purpose: Provides accessible foundation for custom-styled components

**Recharts**: Charting library for data visualization
- Used in MappingPanel for productivity/discipline trend graphs
- Provides LineChart and AreaChart components

### Utility Libraries

**Form Management**: React Hook Form with Zod validation
- `@hookform/resolvers` for schema validation integration
- `zod` for runtime type validation
- `drizzle-zod` for generating Zod schemas from database schema

**Date Handling**: date-fns for date manipulation and formatting

**Styling**: 
- Tailwind CSS for utility-first styling
- `clsx` and `tailwind-merge` for conditional class names
- `class-variance-authority` for component variant management

**State Management**: TanStack Query for server state caching and synchronization

**Fonts**: Google Fonts
- Orbitron (display/tech font)
- JetBrains Mono (monospace for stats)
- Inter (body text)