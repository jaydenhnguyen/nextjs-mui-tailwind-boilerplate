import { ROLES } from 'src/shared/enums';
import { User } from 'src/shared/types';

export const MOCK_PASSWORD = 'password';

export const MOCK_ACCOUNTS = {
  ADMIN: 'admin@example.com',
  VIEWER: 'viewer@example.com',
};

const FIRST_NAMES = ['Ava', 'Liam', 'Mia', 'Noah', 'Zoe', 'Ethan', 'Chloe', 'Lucas', 'Ivy', 'Mason', 'Ella', 'Leo'];
const LAST_NAMES = ['Nguyen', 'Smith', 'Tran', 'Garcia', 'Kim', 'Brown', 'Le', 'Martin', 'Pham', 'Lopez', 'Wilson'];

const weeksAgo = (weeks: number) => new Date(Date.UTC(2026, 9, 1) - weeks * 7 * 24 * 60 * 60 * 1000).toISOString();

const generatedUsers: User[] = Array.from({ length: 22 }, (_, index) => {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length] ?? 'Sam';
  const lastName = LAST_NAMES[(index * 7) % LAST_NAMES.length] ?? 'Lee';
  return {
    id: `u${index + 3}`,
    firstName,
    lastName,
    email: `${firstName}.${lastName}${index}@example.com`.toLowerCase(),
    roles: [index % 5 === 0 ? ROLES.ADMIN : ROLES.EMPLOYEE],
    createdAt: weeksAgo(index + 2),
  };
});

// Lives in memory, so changes reset when the page reloads.
export const db = {
  users: [
    {
      id: 'u1',
      firstName: 'Alex',
      lastName: 'Admin',
      email: MOCK_ACCOUNTS.ADMIN,
      roles: [ROLES.ADMIN],
      createdAt: weeksAgo(60),
    },
    {
      id: 'u2',
      firstName: 'Vic',
      lastName: 'Viewer',
      email: MOCK_ACCOUNTS.VIEWER,
      roles: [ROLES.EMPLOYEE],
      createdAt: weeksAgo(40),
    },
    ...generatedUsers,
  ] as User[],
};
