import { readFileSync } from 'node:fs';

// Runs from .husky/commit-msg. Every commit starts with a gitmoji (https://gitmoji.dev), as a code or the emoji itself:
//   :sparkles: add login page
//   ✨ add login page
const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/check-commit-msg.mjs <commit message file>');
  process.exit(1);
}

const subject =
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .find((line) => line.trim() && !line.startsWith('#'))
    ?.trim() ?? '';

const startsWithGitmoji = /^(:[a-z0-9_+-]+:|\p{Extended_Pictographic}️?) +\S/u.test(subject);
// Messages git writes itself.
const isGitGenerated = /^(Merge|Revert|fixup!|squash!|amend!) /.test(subject);

if (!startsWithGitmoji && !isGitGenerated) {
  console.error(`
  Commit message must start with a gitmoji, then a space and a short summary:

    :sparkles: add login page
    :bug: fix redirect after sign-in

  Pick one at https://gitmoji.dev
  Got: "${subject}"
`);
  process.exit(1);
}
