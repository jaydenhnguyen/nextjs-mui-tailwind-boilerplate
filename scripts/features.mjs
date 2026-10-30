#!/usr/bin/env node
// Lists and removes optional parts ("packs") of the boilerplate. Usage: npm run features help
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROUTES = 'src/shared/constants/routes.constant.ts';
const NAV = 'src/configs/navigation.config.ts';
const ENV = 'src/configs/env.ts';
const ENV_TYPES = 'src/types/env.d.ts';
const MOCK_HANDLERS = 'src/mocks/handlers/index.ts';

// Removes the whole line whose trimmed text is exactly `text`.
const line = (file, text) => ({
  file,
  find: new RegExp(`^[ \\t]*${escapeRegex(text)}[ \\t]*\\r?\\n`, 'm'),
  replace: '',
});
// Removes `item` from a one-line array like [A, item, B], whatever its position.
const arrayItem = (file, item) => ({
  file,
  find: new RegExp(`(, )?${escapeRegex(item)}(?!\\w)(, )?`),
  replace: arrayGlue,
});
const edit = (file, find, replace = '', { optional = false } = {}) => ({ file, find, replace, optional });
// Removes the first line containing `text`, for table rows in docs. People edit docs, so a miss never blocks a removal.
const docLine = (file, text) => ({
  file,
  find: new RegExp(`^.*${escapeRegex(text)}.*\\r?\\n`, 'm'),
  replace: '',
  optional: true,
});
const docText = (file, text) => edit(file, text, '', { optional: true });
// Drops `import { name } from '...'` once the earlier edits left nothing in the file using `name`.
const unusedImport = (file, name) => ({
  file,
  optional: true,
  find: (content) => {
    const rest = content.replace(new RegExp(`^import \\{ ${name} \\} from .*\\r?\\n`, 'm'), '');
    return new RegExp(`\\b${name}\\b`).test(rest) ? content : rest;
  },
});

function arrayGlue(_match, before, after) {
  return before && after ? ', ' : '';
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Each pack lists what it owns. `requires` are packs it can't work without, so removing one of those
// removes this pack too. Edits on files that no longer exist are skipped.
const PACKS = {
  examples: {
    description: 'Users CRUD demo: list, search, create, delete, permissions',
    requires: ['api', 'auth'],
    detect: 'src/modules/Users',
    files: ['src/modules/Users', 'src/apis/users', 'src/pages/users', 'src/mocks/handlers/users.handlers.ts'],
    edits: [
      line('src/apis/index.ts', "export * from './users';"),
      line(MOCK_HANDLERS, "import { usersHandlers } from './users.handlers';"),
      arrayItem(MOCK_HANDLERS, '...usersHandlers'),
      line(ROUTES, "USERS: '/users',"),
      arrayItem(ROUTES, 'APP_ROUTES.USERS'),
      line(NAV, "{ label: 'Users', href: APP_ROUTES.USERS },"),
      line('src/modules/Authentication/constants/auth.constant.ts', "USERS_READ: 'users:read',"),
      line('src/modules/Authentication/constants/auth.constant.ts', "USERS_WRITE: 'users:write',"),
      edit('src/modules/Authentication/constants/auth.constant.ts', '[PERMISSIONS.USERS_READ]', '[]'),
      edit('.agent/examples/crud-flow-example.md', /\r?\n---\r?\n\r?\n## 4\. A finished example[\s\S]*$/, '\n', {
        optional: true,
      }),
      docText('.agent/examples/README.md', '; `src/modules/Users` (examples pack)'),
      docLine('.agent/examples/README.md', '`src/modules/Users/Users.test.tsx`'),
      docText('.agent/templates/09-motion.template.md', ' (and `src/modules/Users/Users.tsx` in the examples pack)'),
    ],
  },

  auth: {
    description: 'Sign-in, token refresh, PrivateLayout guard, roles/permissions, /login and /home',
    requires: ['api'],
    detect: 'src/modules/Authentication',
    files: [
      'src/modules/Authentication',
      'src/modules/Home',
      'src/configs/auth',
      'src/apis/auth',
      'src/pages/login.tsx',
      'src/pages/home',
      'src/layouts/PrivateLayout',
      'src/shared/enums',
      'src/shared/types/user.type.ts',
      'src/types/axios.d.ts',
      'src/mocks/handlers/auth.handlers.ts',
      'src/mocks/session.ts',
      'src/mocks/db.ts',
      'src/test/session.ts',
      '.agent/templates/03-auth-flow.template.md',
      '.agent/examples/auth-flow-example.md',
    ],
    edits: [
      line('src/configs/index.ts', "export * from './auth';"),
      line('src/configs/request.ts', "import { setupAuthInterceptors } from './auth';"),
      line('src/configs/request.ts', 'setupAuthInterceptors(request);'),
      line('src/apis/index.ts', "export * from './auth';"),
      line('src/shared/types/index.ts', "export * from './user.type';"),
      line('src/providers/AppProviders.tsx', "import { SessionWatcher } from 'src/modules/Authentication';"),
      line('src/providers/AppProviders.tsx', '<SessionWatcher />'),
      line('src/layouts/PublicLayout/PublicLayout.tsx', "import { AuthActions } from 'src/modules/Authentication';"),
      edit('src/layouts/PublicLayout/PublicLayout.tsx', ' actions={<AuthActions />}'),
      line('src/layouts/index.ts', "export * from './PrivateLayout';"),
      line(ROUTES, "LOGIN: '/login',"),
      line(ROUTES, "HOME: '/home',"),
      arrayItem(ROUTES, 'APP_ROUTES.HOME'),
      edit(NAV, /\r?\n[ \t]*private: \[[\s\S]*?\] as NavItem\[\],/),
      unusedImport(NAV, 'APP_ROUTES'),
      line(ENV, 'ACCESS_TOKEN_TTL: optional(z.coerce.number().int().positive().default(3600)),'),
      line(ENV, 'REFRESH_TOKEN_TTL: optional(z.coerce.number().int().positive().default(604800)),'),
      line(ENV, 'ACCESS_TOKEN_TTL: process.env.NEXT_PUBLIC_ACCESS_TOKEN_TTL,'),
      line(ENV, 'REFRESH_TOKEN_TTL: process.env.NEXT_PUBLIC_REFRESH_TOKEN_TTL,'),
      line(ENV_TYPES, 'NEXT_PUBLIC_ACCESS_TOKEN_TTL?: string;'),
      line(ENV_TYPES, 'NEXT_PUBLIC_REFRESH_TOKEN_TTL?: string;'),
      edit('.env.example', /# Token cookie lifetimes in seconds\r?\n(NEXT_PUBLIC_\w+_TOKEN_TTL=.*\r?\n)+\r?\n?/),
      line('Dockerfile', 'ARG NEXT_PUBLIC_ACCESS_TOKEN_TTL'),
      line('Dockerfile', 'ARG NEXT_PUBLIC_REFRESH_TOKEN_TTL'),
      line(MOCK_HANDLERS, "import { authHandlers } from './auth.handlers';"),
      arrayItem(MOCK_HANDLERS, '...authHandlers'),
      line('src/mocks/MockBanner/MockBanner.tsx', "import { MOCK_ACCOUNTS, MOCK_PASSWORD } from '../db';"),
      edit(
        'src/mocks/MockBanner/MockBanner.tsx',
        /\r?\n[ \t]*<Typography[^>]*text\.secondary[^>]*>\s*\{MOCK_ACCOUNTS[\s\S]*?<\/Typography>/,
      ),
      line('src/test/index.ts', "export * from './session';"),
      line('src/test/setup.ts', "import { tokenManager } from 'src/configs/auth';"),
      line('src/test/setup.ts', 'tokenManager.removeAllCredentials();'),
      docLine('.agent/MASTER_TEMPLATE.md', '`templates/03-auth-flow.template.md`'),
      docLine('.agent/MASTER_TEMPLATE.md', '`examples/auth-flow-example.md`'),
      docLine('.agent/examples/README.md', '(./auth-flow-example.md)'),
      docLine('.agent/examples/README.md', '`src/modules/Authentication/Login`'),
    ],
  },

  'mock-api': {
    description: 'MSW fake backend for `npm run dev:mock` and tests',
    requires: ['api'],
    detect: 'src/mocks',
    files: ['src/mocks', 'public/mockServiceWorker.js'],
    edits: [
      line('src/pages/_app.tsx', "import { ApiMockingGate } from 'src/mocks';"),
      edit(
        'src/pages/_app.tsx',
        '<ApiMockingGate>{getLayout(<Component {...pageProps} />)}</ApiMockingGate>',
        '{getLayout(<Component {...pageProps} />)}',
      ),
      line(
        'next.config.ts',
        "// MSW's browser entry doesn't exist for the server build, so the server gets a stub instead.",
      ),
      line(
        'next.config.ts',
        "'msw/browser': { browser: 'msw/browser', default: './src/mocks/msw-browser.server.ts' },",
      ),
      edit('next.config.ts', /\r?\n[ \t]*turbopack: \{\s*resolveAlias: \{\s*\},\s*\},/, '', { optional: true }),
      edit('eslint.config.mjs', ", 'public/mockServiceWorker.js'"),
      line('.prettierignore', 'public/mockServiceWorker.js'),
      line(
        ENV,
        "API_MOCKING: optional(z.enum(['enabled', 'disabled']).default('disabled')).transform((value) => value === 'enabled'),",
      ),
      line(ENV, 'API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,'),
      line(ENV_TYPES, "NEXT_PUBLIC_API_MOCKING?: 'enabled' | 'disabled';"),
      edit('.env.example', /(\r?\n)?\r?\n# "enabled" answers API calls[\s\S]*?NEXT_PUBLIC_API_MOCKING=.*\r?\n/, '\n'),
      docLine('.agent/MASTER_TEMPLATE.md', '`src/mocks/README.md`'),
      docLine('README.md', '| `npm run dev:mock`'),
      docLine('AGENTS.md', 'npm run dev:mock'),
      docText('AGENTS.md', ', `src/mocks`'),
    ],
    scripts: ['dev:mock'],
    packageKeys: ['msw'],
    devDependencies: ['msw', 'cross-env'],
  },

  api: {
    description: 'HTTP client (axios), React Query, ApiError handling, QueryState, src/apis',
    requires: [],
    detect: 'src/configs/request.ts',
    files: [
      'src/apis',
      'src/configs/request.ts',
      'src/configs/api.config.ts',
      'src/configs/queryClient.ts',
      'src/providers/QueryProvider.tsx',
      'src/hooks/useAppQuery.ts',
      'src/hooks/useAppMutation.ts',
      'src/types/react-query.d.ts',
      'src/shared/utils/apiError.ts',
      'src/shared/types/pagination.type.ts',
      'src/components/QueryState',
      '.agent/templates/02-api-structure.template.md',
      '.agent/examples/crud-flow-example.md',
      '.agent/prompts/create-crud.prompt.md',
    ],
    edits: [
      line('src/configs/index.ts', "export * from './api.config';"),
      line('src/configs/index.ts', "export * from './request';"),
      line('src/configs/index.ts', "export * from './queryClient';"),
      line('src/providers/AppProviders.tsx', "import { QueryProvider } from './QueryProvider';"),
      line('src/providers/AppProviders.tsx', '<QueryProvider>'),
      line('src/providers/AppProviders.tsx', '</QueryProvider>'),
      line('src/hooks/index.ts', "export * from './useAppQuery';"),
      line('src/hooks/index.ts', "export * from './useAppMutation';"),
      line('src/shared/utils/index.ts', "export * from './apiError';"),
      line('src/shared/types/index.ts', "export * from './pagination.type';"),
      line('src/components/index.ts', "export * from './QueryState';"),
      line(ENV, "API_URL: optional(z.url().default('http://localhost:3001/api/v1')),"),
      line(ENV, 'API_URL: process.env.NEXT_PUBLIC_API_URL,'),
      line(ENV_TYPES, 'NEXT_PUBLIC_API_URL?: string;'),
      edit('.env.example', /# Backend base URL.*\r?\nNEXT_PUBLIC_API_URL=.*\r?\n\r?\n?/),
      edit('next.config.ts', /const originOf = [\s\S]*?\r?\n\};\r?\n\r?\n/),
      edit('next.config.ts', ' ${originOf(process.env.NEXT_PUBLIC_API_URL)}', ''),
      line('Dockerfile', 'ARG NEXT_PUBLIC_API_URL'),
      docLine('.agent/MASTER_TEMPLATE.md', '`templates/02-api-structure.template.md`'),
      docLine('.agent/MASTER_TEMPLATE.md', '`examples/crud-flow-example.md`'),
      docLine('.agent/examples/README.md', '(./crud-flow-example.md)'),
      docLine('src/components/README.md', '`QueryState/`'),
      edit('src/components/README.md', /## QueryState\r?\n[\s\S]*?(?=## )/, '', { optional: true }),
      docLine('src/hooks/README.md', '`useAppQuery(options)`'),
      docLine('src/hooks/README.md', '`useAppMutation(options)`'),
      docLine('.agent/README.md', '`prompts/create-crud.prompt.md`'),
    ],
    dependencies: [
      'axios',
      'camelcase-keys',
      'http-status-codes',
      '@tanstack/react-query',
      '@tanstack/react-query-devtools',
    ],
  },

  tests: {
    description: 'Vitest + Testing Library, test helpers in src/test, *.test.tsx files',
    requires: ['mock-api'],
    detect: 'vitest.config.mts',
    files: ['vitest.config.mts', 'src/test', '**/*.test.ts', '**/*.test.tsx'],
    edits: [
      line('.github/workflows/ci.yml', '- run: npm test'),
      docLine('.agent/MASTER_TEMPLATE.md', '`src/test/README.md`'),
      docLine('README.md', '| `npm test`'),
      docText('AGENTS.md', ', `src/test`'),
      docText('.agent/MASTER_TEMPLATE.md', ' (type-check, lint, tests, build)'),
    ],
    scripts: ['test', 'test:watch'],
    scriptEdits: { check: [' && npm run test', ''] },
    devDependencies: [
      'vitest',
      '@vitejs/plugin-react',
      'jsdom',
      '@testing-library/react',
      '@testing-library/dom',
      '@testing-library/user-event',
      '@testing-library/jest-dom',
      'next-router-mock',
    ],
  },

  ci: {
    description: 'GitHub Actions (type-check, lint, test, build) and Dependabot',
    requires: [],
    detect: '.github/workflows/ci.yml',
    files: ['.github/workflows/ci.yml', '.github/dependabot.yml'],
    edits: [],
  },

  'git-hooks': {
    description: 'Husky pre-commit (lint-staged) and gitmoji commit message check',
    requires: [],
    detect: '.husky',
    files: ['.husky', 'scripts/check-commit-msg.mjs'],
    edits: [line('.github/workflows/ci.yml', 'HUSKY: 0'), edit('Dockerfile', 'RUN HUSKY=0 npm ci', 'RUN npm ci')],
    scripts: ['prepare'],
    packageKeys: ['lint-staged'],
    devDependencies: ['husky', 'lint-staged'],
    after: () => run('git config --unset core.hooksPath', { quiet: true }),
  },

  docker: {
    description: 'Dockerfile with Next.js standalone output',
    requires: [],
    detect: 'Dockerfile',
    files: ['Dockerfile', '.dockerignore'],
    edits: [
      line(
        'next.config.ts',
        "// The Dockerfile sets this to get a self-contained server in .next/standalone. Vercel doesn't need it.",
      ),
      line('next.config.ts', "output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,"),
      line(ENV_TYPES, '// Build-time only, set by the Dockerfile.'),
      line(ENV_TYPES, "NEXT_OUTPUT?: 'standalone';"),
    ],
  },
};

// ---------- helpers ----------

const root = process.cwd();
const abs = (file) => path.join(root, file);

function run(command, { quiet = false } = {}) {
  try {
    return execSync(command, { cwd: root, stdio: quiet ? 'pipe' : 'inherit' })?.toString() ?? '';
  } catch {
    return null;
  }
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const isInstalled = (name) => existsSync(abs(PACKS[name].detect));

// Every pack that needs `name`, directly or through another pack.
function dependentsOf(name) {
  const result = new Set();
  const visit = (target) => {
    for (const [other, pack] of Object.entries(PACKS)) {
      if (pack.requires.includes(target) && !result.has(other)) {
        result.add(other);
        visit(other);
      }
    }
  };
  visit(name);
  return [...result];
}

// Packs that need others go first, so their edits run before the files they touch are deleted.
function removalOrder(names) {
  const depth = (name) => Math.max(0, ...dependentsOf(name).map((other) => depth(other) + 1));
  return [...names].sort((a, b) => depth(a) - depth(b));
}

function walk(dir, onFile) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, onFile);
    else onFile(full);
  }
}

function expandFiles(patterns) {
  const result = [];
  for (const pattern of patterns) {
    if (!pattern.startsWith('**/')) {
      if (existsSync(abs(pattern))) result.push(pattern);
      continue;
    }
    const suffix = pattern.replace('**/*', '');
    walk(abs('src'), (full) => {
      if (full.endsWith(suffix)) result.push(path.relative(root, full).split(path.sep).join('/'));
    });
  }
  return result;
}

const isInside = (file, parent) => file === parent || file.startsWith(`${parent}/`);

// ---------- commands ----------

function list() {
  console.log('\nPacks (remove with: npm run features remove <name> ...)\n');
  for (const [name, pack] of Object.entries(PACKS)) {
    const status = isInstalled(name) ? '✔ installed' : '· removed  ';
    const needs = pack.requires.length ? `  (needs ${pack.requires.join(', ')})` : '';
    console.log(`  ${status}  ${name.padEnd(10)} ${pack.description}${needs}`);
  }
  console.log('');
}

function remove(names, { dryRun, force }) {
  if (names.length === 0) fail('Name at least one pack, e.g. npm run features remove examples');
  for (const name of names) {
    if (!PACKS[name]) fail(`Unknown pack "${name}". Run npm run features list.`);
    if (!isInstalled(name)) fail(`"${name}" is already removed.`);
  }

  const missing = new Set();
  for (const name of names) {
    for (const other of dependentsOf(name)) {
      if (isInstalled(other) && !names.includes(other)) missing.add(other);
    }
  }
  if (missing.size) {
    const all = removalOrder([...names, ...missing]);
    fail(
      `${[...missing].join(', ')} ${missing.size > 1 ? 'need' : 'needs'} ${names.join(', ')}, so they have to go together:\n` +
        `  npm run features remove ${all.join(' ')}`,
    );
  }

  if (!dryRun && !force) {
    const status = run('git status --porcelain', { quiet: true });
    if (status === null) fail('This needs a git repository, so the removal can be undone. Use --force to skip.');
    if (status.trim())
      fail('Commit or stash your changes first, so the removal is easy to review and undo. Use --force to skip.');
  }

  const order = removalOrder(names);
  const toDelete = order.flatMap((name) => expandFiles(PACKS[name].files));
  const isDeleted = (file) => toDelete.some((deleted) => isInside(file, deleted));

  // Edits run in memory first, so nothing is written unless every one of them applies.
  const contents = new Map();
  const problems = [];
  for (const name of order) {
    for (const { file, find, replace, optional } of PACKS[name].edits) {
      if (isDeleted(file) || !existsSync(abs(file))) continue;
      const current = contents.get(file) ?? readFileSync(abs(file), 'utf8');
      const next = typeof find === 'function' ? find(current) : current.replace(find, replace);
      if (next === current) {
        if (!optional) problems.push(`${file}: couldn't find ${find instanceof RegExp ? find : JSON.stringify(find)}`);
        continue;
      }
      contents.set(file, next);
    }
  }

  const packageJson = JSON.parse(readFileSync(abs('package.json'), 'utf8'));
  const uninstall = [];
  for (const name of order) {
    const pack = PACKS[name];
    for (const script of pack.scripts ?? []) delete packageJson.scripts[script];
    for (const [script, [from, to]] of Object.entries(pack.scriptEdits ?? {})) {
      if (packageJson.scripts[script]) packageJson.scripts[script] = packageJson.scripts[script].replace(from, to);
    }
    for (const key of pack.packageKeys ?? []) delete packageJson[key];
    for (const dep of [...(pack.dependencies ?? []), ...(pack.devDependencies ?? [])]) {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) uninstall.push(dep);
    }
  }

  console.log(`\n${dryRun ? 'Would remove' : 'Removing'}: ${order.join(', ')}\n`);
  console.log('Delete:');
  for (const file of toDelete) console.log(`  - ${file}`);
  console.log('Edit:');
  for (const file of contents.keys()) console.log(`  ~ ${file}`);
  console.log('  ~ package.json');
  if (uninstall.length) console.log(`Uninstall: ${uninstall.join(' ')}`);

  if (problems.length) {
    console.log('\nThese edits no longer match the code (it was probably changed by hand):');
    for (const problem of problems) console.log(`  ! ${problem}`);
    if (!force) fail('Nothing was changed. Make these edits yourself, or rerun with --force to apply everything else.');
  }

  if (dryRun) return console.log('\nDry run, nothing changed.\n');

  for (const file of toDelete) rmSync(abs(file), { recursive: true, force: true });

  const edited = [];
  for (const [file, content] of contents) {
    // A barrel file with nothing left in it would break the build, so it goes too.
    if (!content.trim()) {
      rmSync(abs(file));
      continue;
    }
    writeFileSync(abs(file), content);
    edited.push(file);
  }

  const eol = readFileSync(abs('package.json'), 'utf8').includes('\r\n') ? '\r\n' : '\n';
  writeFileSync(abs('package.json'), `${JSON.stringify(packageJson, null, 2)}\n`.replace(/\n/g, eol));

  for (const file of [...toDelete, ...contents.keys()]) removeEmptyParents(path.dirname(abs(file)));

  for (const name of order) PACKS[name].after?.();

  if (uninstall.length) run(`npm uninstall --no-audit --no-fund ${uninstall.join(' ')}`);
  if (edited.length && existsSync(abs('node_modules/.bin/prettier'))) {
    run(`npx prettier --write --ignore-unknown --log-level warn ${edited.map((file) => `"${file}"`).join(' ')}`);
  }

  console.log(`\n✔ Removed ${order.join(', ')}. Review with git diff, then run npm run check.\n`);
}

function removeEmptyParents(dir) {
  let current = dir;
  while (current.startsWith(root) && current !== root && existsSync(current)) {
    if (!statSync(current).isDirectory() || readdirSync(current).length > 0) return;
    rmSync(current, { recursive: true });
    current = path.dirname(current);
  }
}

function help() {
  console.log(`
Usage:
  npm run features list                    show every pack and whether it's installed
  npm run features remove <pack> ...       remove packs (code, config, scripts and dependencies)

Options (after --, e.g. npm run features remove docker -- --dry-run):
  --dry-run   show what would change without touching anything
  --force     run with uncommitted changes, and apply what it can if some edits no longer match

Packs: ${Object.keys(PACKS).join(', ')}
`);
}

// ---------- cli ----------

const args = process.argv.slice(2);
// npm swallows --flags given without "--" and passes them as npm_config_* instead.
const dryRun = args.includes('--dry-run') || process.env.npm_config_dry_run === 'true';
const force = args.includes('--force') || process.env.npm_config_force === 'true';
const [command, ...rest] = args.filter((arg) => !arg.startsWith('--'));

if (command === 'list') list();
else if (command === 'remove') remove(rest, { dryRun, force });
else help();
