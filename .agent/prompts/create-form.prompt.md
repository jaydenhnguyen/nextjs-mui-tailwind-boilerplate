Read all files inside `.ai/templates/`.

Generate a production-grade form using:

- react-hook-form
- zod
- MUI
- SCSS Modules
- Tailwind

Requirements:

- schema outside TSX
- typed form values
- reusable Control* fields
- responsive layout
- mutation-based submission
- loading/error handling
- mobile-first design

Architecture:

- form component only renders UI
- useXForm handles form logic
- mutation hook handles API submission
- API client remains in src/apis

Generate:

- schema
- form hook
- form component
- constants
- mutation integration
- validation messages
- loading states
- reusable patterns

Do NOT:

- use Formik
- call APIs directly in form component
- use any
- hardcode field names repeatedly
- bypass validation with getValues()
