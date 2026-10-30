#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const USAGE = `
Usage: npm run gen <kind> <Name> [-- options]

Kinds:
  crud <Name>        list + create/edit dialog + delete, with API, hooks, page, mock handler, route and nav entry
  page <Name>        a module with one screen, its page, route and nav entry
  component <Name>   src/components/<Name> (or inside a module with --module)
  hook <useName>     src/hooks/<useName>.ts (or inside a module with --module)

Options:
  --public           page/crud: use PublicLayout and leave it indexable (default is private when auth exists)
  --no-nav           page/crud: don't add a nav entry
  --singular <Name>  crud: singular name when the guess is wrong (e.g. --singular Person for People)
  --module <Name>    component/hook: put it inside src/modules/<Name>
  --dry-run          print what would change without writing anything

Examples:
  npm run gen crud Products
  npm run gen page Settings
  npm run gen component StatCard -- --module Home
  npm run gen hook useInterval
`;

// ---------- names ----------

function toWords(input) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function makeNames(words) {
  const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);
  const pascal = words.map(capitalize).join('');
  return {
    pascal,
    camel: pascal.charAt(0).toLowerCase() + pascal.slice(1),
    kebab: words.join('-'),
    constant: words.join('_').toUpperCase(),
    label: capitalize(words.join(' ')),
    lower: words.join(' '),
  };
}

function singularize(word) {
  if (/ies$/.test(word)) return word.replace(/ies$/, 'y');
  if (/(ss|us|is)$/.test(word)) return word;
  if (/(x|ch|sh|ss|us|z)es$/.test(word)) return word.replace(/es$/, '');
  return word.replace(/s$/, '');
}

// ---------- files ----------

const exists = (file) => fs.existsSync(path.join(ROOT, file));
const readRaw = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const editorConfigEol = /end_of_line\s*=\s*crlf/.test(exists('.editorconfig') ? readRaw('.editorconfig') : '')
  ? '\r\n'
  : '\n';

const changes = { created: [], updated: new Set(), skipped: [] };
let dryRun = false;

function write(file, content, eol) {
  if (!dryRun) {
    fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, file), content.replace(/\n/g, eol));
  }
}

function create(file, content) {
  if (exists(file)) fail(`${file} already exists. Pick another name or delete it first.`);
  write(file, content.trimStart(), editorConfigEol);
  changes.created.push(file);
}

// Edits an existing file. If the expected shape isn't found, it says what to add by hand instead of guessing.
function update(file, edit, manualHint) {
  if (!exists(file)) return;
  const raw = readRaw(file);
  const before = raw.replace(/\r\n/g, '\n');
  const after = edit(before);
  if (after === null) changes.skipped.push(`${file}: ${manualHint}`);
  else if (after !== before) {
    write(file, after, raw.includes('\r\n') ? '\r\n' : '\n');
    changes.updated.add(file);
  }
}

function addBarrelExport(file, from) {
  const line = `export * from '${from}';`;
  if (!exists(file)) return create(file, `${line}\n`);
  update(
    file,
    (content) => {
      if (content.includes(line)) return content;
      const lines = content.trimEnd().split('\n');
      const position = lines.findIndex((item) => item.startsWith('export * from') && item.localeCompare(line) > 0);
      lines.splice(position === -1 ? lines.length : position, 0, line);
      return `${lines.join('\n')}\n`;
    },
    `add ${line}`,
  );
}

function addObjectEntry(file, objectName, entry) {
  update(
    file,
    (content) => {
      const match = new RegExp(`(export const ${objectName} = \\{[\\s\\S]*?)(\\n\\};)`).exec(content);
      if (!match) return null;
      const body = /[{,]\s*$/.test(match[1]) ? match[1] : `${match[1]},`;
      return content.replace(match[0], () => `${body}\n  ${entry},${match[2]}`);
    },
    `add ${entry} to ${objectName}`,
  );
}

function addArrayItem(file, arrayPattern, item) {
  update(
    file,
    (content) => {
      const match = arrayPattern.exec(content);
      if (!match) return null;
      const items = match[2].trim().replace(/,$/, '');
      return content.replace(match[0], () => `${match[1]}${items ? `${items}, ` : ''}${item}${match[3]}`);
    },
    `add ${item}`,
  );
}

function formatChanged() {
  const files = [...changes.created, ...changes.updated].filter((file) => /\.(tsx?|scss|md)$/.test(file));
  if (dryRun || files.length === 0) return;
  try {
    const prettier = createRequire(import.meta.url).resolve('prettier/bin/prettier.cjs');
    execFileSync(process.execPath, [prettier, '--write', '--log-level', 'warn', '--end-of-line', 'auto', ...files], {
      cwd: ROOT,
      stdio: 'inherit',
    });
  } catch {
    console.warn('Prettier failed, run `npm run format` to tidy the new files.');
  }
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

// ---------- shared wiring ----------

const hasAuth = () => exists('src/modules/Authentication');
const hasMocks = () => exists('src/mocks/handlers/index.ts');

function addRoute(names, { isPrivate, nav }) {
  const routes = 'src/shared/constants/routes.constant.ts';
  addObjectEntry(routes, 'APP_ROUTES', `${names.constant}: '/${names.kebab}'`);
  addArrayItem(
    routes,
    isPrivate ? /(NO_INDEX_ROUTES = \[)([\s\S]*?)(\];)/ : /(SITEMAP_ROUTES = \[)([\s\S]*?)(\];)/,
    `APP_ROUTES.${names.constant}`,
  );
  if (nav) {
    addArrayItem(
      'src/configs/navigation.config.ts',
      new RegExp(`(\\b${isPrivate ? 'private' : 'public'}: \\[)([\\s\\S]*?)(\\] as NavItem\\[\\])`),
      `{ label: '${names.label}', href: APP_ROUTES.${names.constant} }`,
    );
  }
}

const pageFile = (names, isPrivate) => {
  const layout = isPrivate ? 'PrivateLayout' : 'PublicLayout';
  return `
import * as React from 'react';
import { Seo } from 'src/components/Seo';
import { ${layout} } from 'src/layouts';
import { ${names.pascal} } from 'src/modules/${names.pascal}';

export default function ${names.pascal}Page() {
  return (
    <>
      <Seo title="${names.label}"${isPrivate ? ' noIndex' : ''} />
      <${names.pascal} />
    </>
  );
}

${names.pascal}Page.getLayout = (page: React.ReactElement) => <${layout}>{page}</${layout}>;
`;
};

function checkModuleName(names) {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(names.pascal)) fail(`"${names.pascal}" isn't a valid name. Use letters and numbers.`);
  if (exists(`src/modules/${names.pascal}`)) fail(`src/modules/${names.pascal} already exists.`);
  if (exists(`src/pages/${names.kebab}`) || exists(`src/pages/${names.kebab}.tsx`)) {
    fail(`src/pages/${names.kebab} already exists.`);
  }
}

// ---------- page ----------

function genPage(names, options) {
  checkModuleName(names);
  const isPrivate = hasAuth() && !options.public;
  const dir = `src/modules/${names.pascal}`;

  create(`${dir}/index.ts`, `export * from './${names.pascal}';\n`);
  create(
    `${dir}/${names.pascal}.tsx`,
    `
import { Typography } from '@mui/material';
import classes from './${names.pascal}.module.scss';

export function ${names.pascal}() {
  return (
    <div className={classes['root']}>
      <Typography variant="h4" component="h1">
        ${names.label}
      </Typography>
    </div>
  );
}
`,
  );
  create(`${dir}/${names.pascal}.module.scss`, `.root {\n  @apply flex flex-col gap-6;\n}\n`);
  create(`src/pages/${names.kebab}/index.tsx`, pageFile(names, isPrivate));
  addRoute(names, { isPrivate, nav: options.nav });
}

// ---------- component / hook ----------

function moduleDir(moduleName) {
  const dir = `src/modules/${makeNames(toWords(moduleName)).pascal}`;
  if (!exists(dir)) fail(`${dir} doesn't exist.`);
  return dir;
}

function genComponent(names, options) {
  const base = options.module ? `${moduleDir(options.module)}/components` : 'src/components';
  const dir = `${base}/${names.pascal}`;

  create(`${dir}/index.ts`, `export * from './${names.pascal}';\n`);
  create(
    `${dir}/${names.pascal}.tsx`,
    `
import clsx from 'clsx';
import classes from './${names.pascal}.module.scss';

type Props = {
  className?: string;
};

export function ${names.pascal}({ className }: Props) {
  return <div className={clsx(classes['root'], className)}>${names.label}</div>;
}
`,
  );
  create(`${dir}/${names.pascal}.module.scss`, `.root {\n  @apply flex flex-col gap-2;\n}\n`);
  addBarrelExport(`${base}/index.ts`, `./${names.pascal}`);
}

function genHook(rawName, options) {
  const names = makeNames(toWords(rawName.replace(/^use(?=[A-Z_-]|$)/i, '')));
  if (!names.pascal) fail('Give the hook a name, like useInterval.');
  const hookName = `use${names.pascal}`;
  const base = options.module ? `${moduleDir(options.module)}/hooks` : 'src/hooks';

  create(
    `${base}/${hookName}.ts`,
    `
export function ${hookName}() {
  return {};
}
`,
  );
  addBarrelExport(`${base}/index.ts`, `./${hookName}`);
}

// ---------- crud ----------

function genCrud(p, s, options) {
  checkModuleName(p);
  if (exists(`src/apis/${p.kebab}`)) fail(`src/apis/${p.kebab} already exists.`);
  if (exists(`src/mocks/handlers/${p.kebab}.handlers.ts`))
    fail(`src/mocks/handlers/${p.kebab}.handlers.ts already exists.`);
  if (p.pascal === s.pascal) {
    console.warn(`"${p.pascal}" looks singular already. Pass --singular <Name> if the item name should differ.`);
  }

  const isPrivate = hasAuth() && !options.public;
  const mod = `src/modules/${p.pascal}`;
  const api = `src/apis/${p.kebab}`;
  const ENDPOINTS = `${s.constant}_ENDPOINTS`;
  const QUERY_KEYS = `${s.constant}_QUERY_KEYS`;
  const LIST_KEY = `GET_${s.constant}_LIST`;
  const PAGE_SIZE = `${s.constant}_LIST_PAGE_SIZE`;

  // API
  create(`${api}/index.ts`, `export * from './${p.kebab}';\nexport * from './endpoints';\n`);
  create(`${api}/endpoints.ts`, `export const ${ENDPOINTS} = {\n  ${p.constant}: '/${p.kebab}',\n};\n`);
  create(
    `${api}/${p.kebab}.ts`,
    `
import { http } from 'src/configs/request';
import {
  Create${s.pascal}Request,
  Get${s.pascal}ListRequest,
  Get${s.pascal}ListResponse,
  ${s.pascal},
  Update${s.pascal}Request,
} from 'src/modules/${p.pascal}/models';
import { ${ENDPOINTS} } from './endpoints';

const ${s.camel}Url = (id: string) => \`\${${ENDPOINTS}.${p.constant}}/\${encodeURIComponent(id)}\`;

export const get${s.pascal}List = (params: Get${s.pascal}ListRequest, signal?: AbortSignal) =>
  http.get<Get${s.pascal}ListResponse>(${ENDPOINTS}.${p.constant}, { params, signal });

export const create${s.pascal} = (payload: Create${s.pascal}Request) =>
  http.post<${s.pascal}, Create${s.pascal}Request>(${ENDPOINTS}.${p.constant}, payload);

export const update${s.pascal} = (id: string, payload: Update${s.pascal}Request) =>
  http.put<${s.pascal}, Update${s.pascal}Request>(${s.camel}Url(id), payload);

export const delete${s.pascal} = (id: string) => http.delete(${s.camel}Url(id));
`,
  );
  addBarrelExport('src/apis/index.ts', `./${p.kebab}`);

  // Module: schema, models, constants
  create(
    `${mod}/schema/${s.kebab}.schema.ts`,
    `
import { z } from 'zod';

export const ${s.camel}Schema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500),
});
`,
  );
  create(`${mod}/models/index.ts`, `export * from './${s.kebab}.model';\n`);
  create(
    `${mod}/models/${s.kebab}.model.ts`,
    `
import { z } from 'zod';
import { PaginatedResponse, PaginationRequest } from 'src/shared/types';
import { ${s.camel}Schema } from '../schema/${s.kebab}.schema';

export type ${s.pascal} = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

export type Get${s.pascal}ListRequest = PaginationRequest & {
  search?: string;
};

export type Get${s.pascal}ListResponse = PaginatedResponse<${s.pascal}>;

export type ${s.pascal}FormValues = z.input<typeof ${s.camel}Schema>;

export type Create${s.pascal}Request = z.output<typeof ${s.camel}Schema>;

export type Update${s.pascal}Request = Create${s.pascal}Request;
`,
  );
  create(`${mod}/constants/index.ts`, `export * from './${p.kebab}.constant';\n`);
  create(
    `${mod}/constants/${p.kebab}.constant.ts`,
    `
export const ${QUERY_KEYS} = {
  ${LIST_KEY}: 'get${s.pascal}List',
} as const;

export const ${PAGE_SIZE} = 10;
`,
  );

  // Module: hooks
  const invalidateList = `onSuccess: () => queryClient.invalidateQueries({ queryKey: [${QUERY_KEYS}.${LIST_KEY}] }),`;
  const mutationHook = (name, apiFn, input, call, message, silent) => `
import { useQueryClient } from '@tanstack/react-query';
import { ${apiFn} } from 'src/apis/${p.kebab}';
import { useAppMutation } from 'src/hooks';
import { ${QUERY_KEYS} } from '../constants';
${input.imports}
export function ${name}() {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (${input.args}) => ${call},
    meta: { successMessage: '${message}'${silent ? ', silent: true' : ''} },
    ${invalidateList}
  });
}
`;

  create(
    `${mod}/hooks/index.ts`,
    [
      `useCreate${s.pascal}`,
      `useDelete${s.pascal}`,
      `useGet${s.pascal}List`,
      `use${s.pascal}Form`,
      `useUpdate${s.pascal}`,
    ]
      .sort((a, b) => a.localeCompare(b))
      .map((hook) => `export * from './${hook}';`)
      .join('\n') + '\n',
  );
  create(
    `${mod}/hooks/useGet${s.pascal}List.ts`,
    `
import { keepPreviousData } from '@tanstack/react-query';
import { get${s.pascal}List } from 'src/apis/${p.kebab}';
import { useAppQuery } from 'src/hooks';
import { ${QUERY_KEYS} } from '../constants';
import { Get${s.pascal}ListRequest } from '../models';

export function useGet${s.pascal}List(params: Get${s.pascal}ListRequest, { enabled = true }: { enabled?: boolean } = {}) {
  return useAppQuery({
    queryKey: [${QUERY_KEYS}.${LIST_KEY}, params],
    queryFn: ({ signal }) => get${s.pascal}List(params, signal),
    // Keeps the current page on screen while the next one loads, instead of flashing a spinner.
    placeholderData: keepPreviousData,
    enabled,
  });
}
`,
  );
  // silent: the form dialog shows errors itself, so the global error toast would double up.
  create(
    `${mod}/hooks/useCreate${s.pascal}.ts`,
    mutationHook(
      `useCreate${s.pascal}`,
      `create${s.pascal}`,
      { imports: `import { Create${s.pascal}Request } from '../models';\n`, args: `payload: Create${s.pascal}Request` },
      `create${s.pascal}(payload)`,
      `${s.label} created`,
      true,
    ),
  );
  create(
    `${mod}/hooks/useUpdate${s.pascal}.ts`,
    mutationHook(
      `useUpdate${s.pascal}`,
      `update${s.pascal}`,
      {
        imports: `import { Update${s.pascal}Request } from '../models';\n`,
        args: `{ id, payload }: { id: string; payload: Update${s.pascal}Request }`,
      },
      `update${s.pascal}(id, payload)`,
      `${s.label} saved`,
      true,
    ),
  );
  create(
    `${mod}/hooks/useDelete${s.pascal}.ts`,
    mutationHook(
      `useDelete${s.pascal}`,
      `delete${s.pascal}`,
      { imports: '', args: 'id: string' },
      `delete${s.pascal}(id)`,
      `${s.label} deleted`,
      false,
    ),
  );
  create(
    `${mod}/hooks/use${s.pascal}Form.ts`,
    `
import { useZodForm } from 'src/components/Form';
import { ${s.pascal}, ${s.pascal}FormValues } from '../models';
import { ${s.camel}Schema } from '../schema/${s.kebab}.schema';

export const initial${s.pascal}Values: ${s.pascal}FormValues = {
  name: '',
  description: '',
};

export const to${s.pascal}FormValues = (${s.camel}: ${s.pascal}): ${s.pascal}FormValues => ({
  name: ${s.camel}.name,
  description: ${s.camel}.description ?? '',
});

export function use${s.pascal}Form() {
  return useZodForm(${s.camel}Schema, { defaultValues: initial${s.pascal}Values });
}
`,
  );

  // Module: components
  create(
    `${mod}/components/index.ts`,
    `export * from './Delete${s.pascal}Button';\nexport * from './${s.pascal}FormDialog';\nexport * from './${s.pascal}Table';\n`,
  );

  create(`${mod}/components/Delete${s.pascal}Button/index.ts`, `export * from './Delete${s.pascal}Button';\n`);
  create(
    `${mod}/components/Delete${s.pascal}Button/Delete${s.pascal}Button.tsx`,
    `
import { IconButton, Tooltip } from '@mui/material';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { useConfirm } from 'src/components/ConfirmDialog';
import { useDelete${s.pascal} } from '../../hooks';
import { ${s.pascal} } from '../../models';

export function Delete${s.pascal}Button({ ${s.camel} }: { ${s.camel}: ${s.pascal} }) {
  const confirm = useConfirm();
  const { mutate: delete${s.pascal}, isPending } = useDelete${s.pascal}();

  const handleClick = async () => {
    const confirmed = await confirm({
      title: \`Delete \${${s.camel}.name}?\`,
      description: "This can't be undone.",
      confirmText: 'Delete',
      destructive: true,
    });
    if (confirmed) delete${s.pascal}(${s.camel}.id);
  };

  return (
    <Tooltip title="Delete">
      <IconButton aria-label={\`Delete \${${s.camel}.name}\`} onClick={handleClick} disabled={isPending} size="small">
        <DeleteOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
`,
  );

  create(`${mod}/components/${s.pascal}Table/index.ts`, `export * from './${s.pascal}Table';\n`);
  create(
    `${mod}/components/${s.pascal}Table/${s.pascal}Table.module.scss`,
    `
.container {
  @apply overflow-x-auto rounded-theme border border-solid border-divider;
}

.name {
  @apply min-w-0;
}

.optional {
  @apply hidden md:table-cell;
}

.actions {
  @apply whitespace-nowrap;
}
`,
  );
  create(
    `${mod}/components/${s.pascal}Table/${s.pascal}Table.tsx`,
    `
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlined from '@mui/icons-material/EditOutlined';
import { formatDate } from 'src/shared/utils';
import { ${s.pascal} } from '../../models';
import { Delete${s.pascal}Button } from '../Delete${s.pascal}Button';
import classes from './${s.pascal}Table.module.scss';

type Props = {
  ${p.camel}: ${s.pascal}[];
  onEdit: (${s.camel}: ${s.pascal}) => void;
};

export function ${s.pascal}Table({ ${p.camel}, onEdit }: Props) {
  return (
    <TableContainer className={classes['container']}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell className={classes['optional']}>Created</TableCell>
            <TableCell align="right">
              <span className="sr-only">Actions</span>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {${p.camel}.map((${s.camel}) => (
            <TableRow key={${s.camel}.id} hover>
              <TableCell>
                <div className={classes['name']}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {${s.camel}.name}
                  </Typography>
                  {${s.camel}.description && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {${s.camel}.description}
                    </Typography>
                  )}
                </div>
              </TableCell>
              <TableCell className={classes['optional']}>{formatDate(${s.camel}.createdAt)}</TableCell>
              <TableCell align="right" className={classes['actions']}>
                <Tooltip title="Edit">
                  <IconButton aria-label={\`Edit \${${s.camel}.name}\`} onClick={() => onEdit(${s.camel})} size="small">
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Delete${s.pascal}Button ${s.camel}={${s.camel}} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
`,
  );

  create(`${mod}/components/${s.pascal}FormDialog/index.ts`, `export * from './${s.pascal}FormDialog';\n`);
  create(
    `${mod}/components/${s.pascal}FormDialog/${s.pascal}FormDialog.module.scss`,
    `.form {\n  @apply flex flex-col gap-1 pt-2;\n}\n`,
  );
  create(
    `${mod}/components/${s.pascal}FormDialog/${s.pascal}FormDialog.tsx`,
    `
import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { ControlErrorMessage, ControlTextField, Form } from 'src/components/Form';
import { applyApiErrorToForm } from 'src/shared/utils';
import { initial${s.pascal}Values, to${s.pascal}FormValues, useCreate${s.pascal}, use${s.pascal}Form, useUpdate${s.pascal} } from '../../hooks';
import { Create${s.pascal}Request, ${s.pascal} } from '../../models';
import classes from './${s.pascal}FormDialog.module.scss';

type Props = {
  open: boolean;
  // Leave empty to create a new one.
  ${s.camel}?: ${s.pascal} | null;
  onClose: () => void;
};

export function ${s.pascal}FormDialog({ open, ${s.camel}, onClose }: Props) {
  const formId = React.useId();
  const titleId = React.useId();
  const form = use${s.pascal}Form();
  const { control, reset, setError } = form;
  const create${s.pascal} = useCreate${s.pascal}();
  const update${s.pascal} = useUpdate${s.pascal}();
  const isPending = create${s.pascal}.isPending || update${s.pascal}.isPending;

  const handleSubmit = (values: Create${s.pascal}Request) => {
    const onError = (error: unknown) => applyApiErrorToForm(setError, error);
    if (${s.camel}) update${s.pascal}.mutate({ id: ${s.camel}.id, payload: values }, { onSuccess: onClose, onError });
    else create${s.pascal}.mutate(values, { onSuccess: onClose, onError });
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby={titleId}
      // Fills the form before the dialog paints, so old values never flash while it opens.
      slotProps={{ transition: { onEnter: () => reset(${s.camel} ? to${s.pascal}FormValues(${s.camel}) : initial${s.pascal}Values) } }}
    >
      <DialogTitle id={titleId}>{${s.camel} ? 'Edit ${s.lower}' : 'New ${s.lower}'}</DialogTitle>
      <DialogContent>
        <Form id={formId} form={form} onSubmit={handleSubmit} className={classes['form']}>
          <ControlTextField control={control} name="name" label="Name" autoFocus fullWidth />
          <ControlTextField control={control} name="description" label="Description" multiline minRows={3} fullWidth />
          <ControlErrorMessage control={control} name="root.server" />
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" form={formId} variant="contained" loading={isPending}>
          {${s.camel} ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
`,
  );

  // Module: screen
  create(`${mod}/index.ts`, `export * from './${p.pascal}';\n`);
  create(
    `${mod}/${p.pascal}.module.scss`,
    `
.root {
  @apply flex flex-col gap-6;
}

.header {
  @apply flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between;
}

.search {
  @apply w-full sm:max-w-sm;
}

.results {
  @apply flex flex-col gap-4;
}

.pagination {
  @apply self-center;
}
`,
  );
  create(
    `${mod}/${p.pascal}.tsx`,
    `
import * as React from 'react';
import { Button, InputAdornment, Pagination, TextField, Typography } from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { m } from 'motion/react';
import { EmptyState } from 'src/components/EmptyState';
import { QueryState } from 'src/components/QueryState';
import { useDebounce, useOpenState, useQueryParams } from 'src/hooks';
import { formatNumber } from 'src/shared/utils';
import { moveTransition } from 'src/theme/motion';
import { ${s.pascal}FormDialog, ${s.pascal}Table } from './components';
import { ${PAGE_SIZE} } from './constants';
import { useGet${s.pascal}List } from './hooks';
import { ${s.pascal} } from './models';
import classes from './${p.pascal}.module.scss';

export function ${p.pascal}() {
  const { params, setParams, isReady } = useQueryParams<'search' | 'page'>();
  const formDialog = useOpenState();
  // Kept after closing, so the dialog title doesn't change while it animates out.
  const [editing, setEditing] = React.useState<${s.pascal} | null>(null);

  // null until the user types, so the box shows whatever search is already in the URL.
  const [searchInput, setSearchInput] = React.useState<string | null>(null);
  const debouncedSearch = useDebounce(searchInput);

  React.useEffect(() => {
    if (debouncedSearch !== null) void setParams({ search: debouncedSearch, page: undefined });
  }, [debouncedSearch, setParams]);

  const page = Math.max(1, Number(params.page) || 1);
  const listQuery = useGet${s.pascal}List({ page, pageSize: ${PAGE_SIZE}, search: params.search }, { enabled: isReady });
  const total = listQuery.data?.total ?? 0;
  const pageCount = Math.ceil(total / ${PAGE_SIZE});

  const openForm = (${s.camel}: ${s.pascal} | null) => {
    setEditing(${s.camel});
    formDialog.open();
  };

  const newButton = (
    <Button variant="contained" startIcon={<AddOutlined />} onClick={() => openForm(null)}>
      New ${s.lower}
    </Button>
  );

  return (
    <div className={classes['root']}>
      <div className={classes['header']}>
        <div>
          <Typography variant="h4" component="h1">
            ${p.label}
          </Typography>
          {listQuery.data && <Typography color="text.secondary">{formatNumber(total)} in total</Typography>}
        </div>
        {newButton}
      </div>

      <TextField
        value={searchInput ?? params.search ?? ''}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search"
        size="small"
        className={classes['search']}
        slotProps={{
          htmlInput: { 'aria-label': 'Search ${p.lower}' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <QueryState
        query={listQuery}
        isEmpty={(response) => response.data.length === 0}
        empty={
          params.search ? (
            <EmptyState title="No matches" description={\`Nothing matches "\${params.search}".\`} />
          ) : (
            <EmptyState title="No ${p.lower} yet" action={newButton} />
          )
        }
      >
        {(response) => (
          // Dims the current page while the next one loads, instead of flashing a spinner.
          <m.div
            initial={false}
            animate={{ opacity: listQuery.isPlaceholderData ? 0.6 : 1 }}
            transition={moveTransition()}
            className={classes['results']}
          >
            <${s.pascal}Table ${p.camel}={response.data} onEdit={openForm} />
            {pageCount > 1 && (
              <Pagination
                page={page}
                count={pageCount}
                onChange={(_event, nextPage) => void setParams({ page: nextPage === 1 ? undefined : nextPage })}
                className={classes['pagination']}
              />
            )}
          </m.div>
        )}
      </QueryState>

      <${s.pascal}FormDialog open={formDialog.isOpen} ${s.camel}={editing} onClose={formDialog.close} />
    </div>
  );
}
`,
  );

  create(`src/pages/${p.kebab}/index.tsx`, pageFile(p, isPrivate));
  addRoute(p, { isPrivate, nav: options.nav });

  if (hasMocks()) genCrudMocks(p, s);
}

function genCrudMocks(p, s) {
  const withAuth = hasAuth();
  const guard = withAuth ? `\n    if (!getRequestUser(request)) return unauthorized();` : '';
  const sessionImports = withAuth ? 'apiUrl, getRequestUser, unauthorized' : 'apiUrl';
  const file = `src/mocks/handlers/${p.kebab}.handlers.ts`;

  create(
    file,
    `
import { delay, http, HttpResponse } from 'msw';
import { ${s.pascal} } from 'src/modules/${p.pascal}/models';
import { ${sessionImports} } from '../session';

type ${s.pascal}Body = { name?: string; description?: string };

// Lives in memory, so changes reset when the page reloads.
const ${p.camel}: ${s.pascal}[] = Array.from({ length: 14 }, (_, index) => ({
  id: \`${s.kebab}-\${index + 1}\`,
  name: \`${s.label} \${index + 1}\`,
  description: index % 3 === 0 ? '' : \`A short description of ${s.lower} \${index + 1}.\`,
  createdAt: new Date(Date.UTC(2026, 8, 30 - index)).toISOString(),
}));

function validate(body: ${s.pascal}Body) {
  if (body.name?.trim()) return null;
  return HttpResponse.json(
    { message: 'Please fix the highlighted fields', errors: { name: 'Name is required' } },
    { status: 422 },
  );
}

const notFound = () => HttpResponse.json({ message: '${s.label} not found' }, { status: 404 });

export const ${p.camel}Handlers = [
  http.get(apiUrl('/${p.kebab}'), async ({ request }) => {
    await delay();${guard}

    const params = new URL(request.url).searchParams;
    const search = (params.get('search') ?? '').trim().toLowerCase();
    const page = Math.max(1, Number(params.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize')) || 10));

    const matches = ${p.camel}.filter((item) => item.name.toLowerCase().includes(search));
    return HttpResponse.json({ data: matches.slice((page - 1) * pageSize, page * pageSize), total: matches.length });
  }),

  http.post(apiUrl('/${p.kebab}'), async ({ request }) => {
    await delay();${guard}

    const body = (await request.json()) as ${s.pascal}Body;
    const invalid = validate(body);
    if (invalid) return invalid;

    const created: ${s.pascal} = {
      id: \`${s.kebab}-\${Date.now()}\`,
      name: body.name?.trim() ?? '',
      description: body.description?.trim() ?? '',
      createdAt: new Date().toISOString(),
    };
    ${p.camel}.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put(apiUrl('/${p.kebab}/:id'), async ({ request, params }) => {
    await delay();${guard}

    const existing = ${p.camel}.find((item) => item.id === params['id']);
    if (!existing) return notFound();

    const body = (await request.json()) as ${s.pascal}Body;
    const invalid = validate(body);
    if (invalid) return invalid;

    Object.assign(existing, { name: body.name?.trim() ?? '', description: body.description?.trim() ?? '' });
    return HttpResponse.json(existing);
  }),

  http.delete(apiUrl('/${p.kebab}/:id'), async ({ ${withAuth ? 'request, ' : ''}params }) => {
    await delay();${guard}

    const index = ${p.camel}.findIndex((item) => item.id === params['id']);
    if (index === -1) return notFound();

    ${p.camel}.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
`,
  );

  const index = 'src/mocks/handlers/index.ts';
  update(
    index,
    (content) => {
      const match = /(export const handlers = \[)([\s\S]*?)(\];)/.exec(content);
      if (!match) return null;
      const items = match[2].trim().replace(/,$/, '');
      const importLine = `import { ${p.camel}Handlers } from './${p.kebab}.handlers';`;
      const imports = content.slice(0, match.index).trimEnd();
      return `${imports}\n${importLine}\n\n${match[1]}${items ? `${items}, ` : ''}...${p.camel}Handlers${match[3]}\n`;
    },
    `import ${p.camel}Handlers and add it to the handlers list`,
  );
}

// ---------- cli ----------

function parseArgs(argv) {
  const positional = [];
  // Without the "--" separator npm swallows these flags and hands them over as npm_config_* env vars instead.
  const npmFlag = (name) => process.env[`npm_config_${name}`];
  const options = {
    nav: npmFlag('nav') !== 'false',
    public: npmFlag('public') === 'true',
    dryRun: npmFlag('dry_run') === 'true',
    singular: npmFlag('singular'),
    module: npmFlag('module'),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--public') options.public = true;
    else if (arg === '--no-nav') options.nav = false;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--singular' || arg === '--module') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) fail(`${arg} needs a value.`);
      options[arg.slice(2)] = value;
      i += 1;
    } else if (arg === '-h' || arg === '--help') {
      console.log(USAGE);
      process.exit(0);
    } else if (arg.startsWith('-')) fail(`Unknown option ${arg}.${USAGE}`);
    else positional.push(arg);
  }
  return { kind: positional[0], name: positional.slice(1).join(' '), options };
}

function main() {
  const { kind, name, options } = parseArgs(process.argv.slice(2));
  if (!kind) {
    console.log(USAGE);
    return;
  }
  if (!name) fail(`Give it a name, like: npm run gen ${kind} ${kind === 'hook' ? 'useInterval' : 'Products'}`);
  dryRun = options.dryRun;

  const words = toWords(name);
  if (kind === 'crud') {
    const singularWords = options.singular
      ? toWords(options.singular)
      : [...words.slice(0, -1), singularize(words.at(-1))];
    genCrud(makeNames(words), makeNames(singularWords), options);
  } else if (kind === 'page') genPage(makeNames(words), options);
  else if (kind === 'component') genComponent(makeNames(words), options);
  else if (kind === 'hook') genHook(name, options);
  else fail(`Unknown kind "${kind}".${USAGE}`);

  formatChanged();

  const list = (title, files) =>
    files.length > 0 && console.log(`${title}\n${files.map((file) => `  ${file}`).join('\n')}`);
  console.log(dryRun ? '\nDry run, nothing was written.\n' : '');
  list('Created:', changes.created);
  list('Updated:', [...changes.updated]);
  list('Do these by hand (the file had an unexpected shape):', changes.skipped);
  if (kind === 'crud' && !dryRun) {
    console.log(
      '\nNext: change the fields in the schema, model, table, form dialog and mock handler to match your data.',
    );
  }
  console.log('');
}

main();
