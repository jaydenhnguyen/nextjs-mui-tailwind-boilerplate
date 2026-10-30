# .agent

Docs for building on this boilerplate, written for AI agents and people alike.

**Start here:** [`MASTER_TEMPLATE.md`](./MASTER_TEMPLATE.md). It lists the rules, the workflow and which template to read for each task.

```txt
.agent/
├── MASTER_TEMPLATE.md   entry point: read first
├── templates/           the rules, one topic per file (01 structure … 09 motion)
├── examples/            walkthroughs that point at real code
└── prompts/             ready-made task prompts
```

## Prompts

Paste one into your AI tool and add the specifics.

| Prompt                               | For                                                        |
| ------------------------------------ | ---------------------------------------------------------- |
| `prompts/create-project.prompt.md`   | Turning a fresh copy of the boilerplate into a new product |
| `prompts/create-feature.prompt.md`   | A new feature module                                       |
| `prompts/create-page.prompt.md`      | A new page                                                 |
| `prompts/create-crud.prompt.md`      | A resource with list, create, edit, delete                 |
| `prompts/create-form.prompt.md`      | A form                                                     |
| `prompts/refactor-feature.prompt.md` | Bringing an existing feature in line with these rules      |

## Keeping the docs true

Docs describe the code that exists. When you change a pattern, change its template in the same commit. If a doc and the code disagree, the code wins; fix the doc.
