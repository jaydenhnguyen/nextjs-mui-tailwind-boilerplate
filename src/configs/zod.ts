import { z } from 'zod';

// App-wide default validation messages. A message written in a schema always wins over these,
// and anything not handled here falls back to zod's own wording.
// This is also the place to plug in translations later.
export function setupZod() {
  z.config({
    customError: (issue) => {
      switch (issue.code) {
        case 'invalid_type':
          if (issue.input === undefined || issue.input === null) return 'This field is required';
          if (issue.expected === 'number') return 'Enter a valid number';
          if (issue.expected === 'date') return 'Enter a valid date';
          return undefined;

        case 'too_small':
          if (issue.origin === 'string') {
            return Number(issue.minimum) <= 1
              ? 'This field is required'
              : `Must be at least ${issue.minimum} characters`;
          }
          if (issue.origin === 'array' || issue.origin === 'set') {
            return Number(issue.minimum) <= 1 ? 'Pick at least one option' : `Pick at least ${issue.minimum} options`;
          }
          if (issue.origin === 'number' || issue.origin === 'int' || issue.origin === 'bigint') {
            return `Must be ${issue.inclusive ? 'at least' : 'more than'} ${issue.minimum}`;
          }
          return undefined;

        case 'too_big':
          if (issue.origin === 'string') return `Must be at most ${issue.maximum} characters`;
          if (issue.origin === 'array' || issue.origin === 'set') return `Pick at most ${issue.maximum} options`;
          if (issue.origin === 'number' || issue.origin === 'int' || issue.origin === 'bigint') {
            return `Must be ${issue.inclusive ? 'at most' : 'less than'} ${issue.maximum}`;
          }
          return undefined;

        case 'invalid_format':
          if (issue.format === 'email') return 'Enter a valid email address';
          if (issue.format === 'url') return 'Enter a valid URL';
          return "This doesn't look right";

        default:
          return undefined;
      }
    },
  });
}
