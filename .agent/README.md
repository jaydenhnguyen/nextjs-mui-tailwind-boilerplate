# AI Prompts

This folder contains reusable prompts for AI agents such as:

- Cursor
- Claude Code
- OpenAI agents
- Copilot Workspace

The goal is to standardize:

- feature generation
- CRUD generation
- routing patterns
- form architecture
- API integration
- component structure
- engineering consistency

---

# Usage

Before using any prompt:

1. Read all files inside:

```txt
.ai/templates/
```

2. Follow existing architecture first.

3. Reuse existing:

- components
- hooks
- layouts
- utilities
- query hooks
- form controls

before creating new implementations.

---

# Prompt Philosophy

Prompts should:

- be deterministic
- enforce architecture
- avoid hallucinated structure
- avoid introducing new conventions
- generate production-grade code
- remain feature/module-first

---

# Recommended Prompt Flow

```txt
1. Read .ai/templates/*
2. Read related existing feature/module
3. Reuse existing patterns
4. Generate minimal consistent implementation
```

---

# Available Prompt Types

| Prompt                          | Purpose                           |
|---------------------------------|-----------------------------------|
| `create-feature.prompt.md`      | Create new feature module         |
| `create-page.prompt.md`         | Create new route/page             |
| `create-crud.prompt.md`         | Generate CRUD module              |
| `create-form.prompt.md`         | Generate RHF + zod form           |
| `create-admin-module.prompt.md` | Generate admin feature            |
| `refactor-feature.prompt.md`    | Refactor existing feature         |
| `generate-api.prompt.md`        | Generate API/query/mutation layer |

---

# Golden Rules

AI agents must:

- keep pages thin
- keep feature logic inside modules
- use `src/` imports
- use RHF + zod
- use `useAppQuery`
- use reusable components first
- keep components mobile-first
- avoid giant components
- avoid over-engineering
- follow naming conventions strictly
