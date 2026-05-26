# AI Examples

This folder contains real implementation examples following the boilerplate architecture.

These examples exist to help:

- AI agents
- future contributors
- future maintainers
- future projects

understand how the architecture should be implemented in practice.

---

# Purpose

Templates inside:

```txt
.ai/templates/
```

define:

- rules
- architecture conventions
- engineering standards

Examples inside:

```txt
.ai/examples/
```

demonstrate:

- real implementation patterns
- feature composition
- API integration flow
- form handling flow
- routing structure
- responsive UI patterns
- query/mutation usage
- ownership boundaries

---

# Philosophy

Examples should:

- be production-oriented
- be deterministic
- follow all templates
- demonstrate best practices
- remain easy to scan
- remain reusable across projects

Examples should NOT:

- contain experimental architecture
- contain conflicting conventions
- contain legacy patterns
- contain dead code
- introduce new folder structures
- over-engineer solutions

---

# Available Examples

| File                       | Purpose                          |
|----------------------------|----------------------------------|
| `api-hook-example.md`      | API/query/mutation architecture  |
| `feature-example.md`       | Full feature/module ownership    |
| `page-module-example.md`   | Thin pages + module composition  |
| `form-example.md`          | RHF + zod form architecture      |
| `crud-flow-example.md`     | Full CRUD feature lifecycle      |
| `auth-flow-example.md`     | Authentication + token lifecycle |
| `responsive-ui-example.md` | Mobile-first responsive patterns |
| `query-key-example.md`     | TanStack Query key strategy      |

---

# Example Philosophy

Each example should teach ONE core concept clearly.

Examples are intentionally:

- practical
- copyable
- implementation-focused
- architecture-aligned

---

# Architecture Ownership Reminder

## Pages

Pages are:

- route entry points
- layout composition points
- SEO entry points

Pages should NOT:

- contain business logic
- call APIs directly
- contain giant JSX structures

---

## Modules

Business/domain logic belongs inside:

```txt
src/modules/<Feature>/
```

Each feature owns:

- components
- hooks
- forms
- schemas
- models
- constants
- utilities

---

## Shared Components

Reusable UI belongs in:

```txt
src/components/
```

Feature-specific UI belongs inside feature modules.

---

## APIs

API clients belong in:

```txt
src/apis/
```

Components should NEVER call APIs directly.

---

# Recommended Example Structure

Examples should include:

- file tree
- code snippets
- ownership explanation
- flow explanation
- good vs bad examples when useful

---

# Golden Rules

Examples should demonstrate:

- thin pages
- feature ownership
- reusable shared UI
- mobile-first responsive UI
- typed API boundaries
- query/mutation separation
- RHF + zod form handling
- centralized API architecture
- deterministic naming conventions

---

# AI Agent Usage

Recommended AI workflow:

```txt
1. Read .ai/templates/*
2. Read relevant examples
3. Inspect existing project structure
4. Reuse existing patterns
5. Generate minimal consistent implementation
```

AI agents should:

- follow examples closely
- prioritize consistency
- reuse existing patterns
- avoid introducing new conventions

---

# Naming Conventions

Examples should follow:

- `src/` imports
- named exports
- feature/module-first structure
- PascalCase components
- camelCase utilities/hooks
- kebab-case schema/model filenames

---

# Important Constraint

Examples are:

- guidance
- implementation references
- architecture demonstrations

Examples are NOT:

- isolated mini-projects
- experimental playgrounds
- alternative architecture systems

All examples must remain aligned with:

- `.ai/templates/`
- current project conventions
- current engineering standards

---

# Long-term Goal

This folder should evolve into:

```txt
A real-world implementation knowledge base
for AI-assisted frontend engineering.
```

The examples should help ensure generated projects remain:

- scalable
- predictable
- maintainable
- responsive
- production-grade
- architecture-consistent
- AI-agent-friendly
