import { tokenManager } from 'src/configs/auth';
import { db, MOCK_ACCOUNTS } from 'src/mocks/db';
import { issueTokens } from 'src/mocks/session';

// Stores a valid mock token, so requests in the test are made as this user.
export function signInAs(email = MOCK_ACCOUNTS.ADMIN) {
  const user = db.users.find((item) => item.email === email);
  if (!user) throw new Error(`No mock user with the email ${email}`);
  tokenManager.storeTokens(issueTokens(user.id));
  return user;
}
