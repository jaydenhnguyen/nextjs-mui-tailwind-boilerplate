Read all files inside `.agent/templates/` and `src/components/Form/README.md`.

Generate a production-grade form using:

- `useZodForm` (react-hook-form + zod) from `src/components/Form`
- `<Form form onSubmit>` for submission
- the `Control*` field components (MUI underneath)
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
- use `useForm` + `zodResolver`, raw `<form>` or raw MUI inputs when a `Control*` component exists
- render error messages yourself (use the field's built-in message or `ControlErrorMessage`)
