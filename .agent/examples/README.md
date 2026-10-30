# Examples

Walkthroughs that point at real, working code. The best example of any pattern is the code itself: generate it (`npm run gen ...`) or open the module that already does it.

| Example                                          | Shows                                                           |
| ------------------------------------------------ | --------------------------------------------------------------- |
| [`crud-flow-example.md`](./crud-flow-example.md) | Adding a resource: generate, make it real, patterns to keep     |
| [`auth-flow-example.md`](./auth-flow-example.md) | Recipes: protect a page or a button, add a permission, sign out |

Reference code in the repo:

| Pattern                                         | Where                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| List + search + pagination + create/edit/delete | output of `npm run gen crud <Name>`; `src/modules/Users` (examples pack) |
| Simple screen and page                          | output of `npm run gen page <Name>`; `src/modules/Landing`               |
| Form with server errors                         | `src/modules/Authentication/Login` (auth pack)                           |
| Field error animation, reserved space           | `src/components/Form/FieldMessage`                                       |
| Page layouts and `getLayout`                    | `src/layouts`, any file in `src/pages`                                   |
| Screen tests                                    | `src/modules/Users/Users.test.tsx`, `src/test/README.md`                 |
