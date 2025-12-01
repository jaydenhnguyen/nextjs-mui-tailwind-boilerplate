import * as React from 'react';
import { User } from 'src/modules/Users/models';
import { ROLES } from 'src/shared/enums';
import isNil from 'lodash/isNil';

export const USER_CONTEXT_ACTIONS = {
  SET_AUTHENTICATED_USER: 'SET_AUTHENTICATED_USER',
};

type UserContextState = {
  user: User | null;
  isAdmin: boolean;
};

type UserContextAction = {
  type: (typeof USER_CONTEXT_ACTIONS)[keyof typeof USER_CONTEXT_ACTIONS];
  payload: User | null;
};

type UserContextProps = {
  state: UserContextState;
  dispatch: React.Dispatch<UserContextAction>;
};

const UserContext = React.createContext<UserContextProps | undefined>(undefined);

// Utility to determine admin status
const checkIsAdmin = (user: User | null): boolean => {
  const userRole = user?.role;
  if (isNil(userRole)) return false;

  // TODO: consider using _id to compare
  return userRole.roleName === ROLES.ADMIN || userRole.roleName === ROLES.SUPER_ADMIN;
};

const userContextReducer = (state: UserContextState, action: UserContextAction): UserContextState => {
  switch (action.type) {
    case USER_CONTEXT_ACTIONS.SET_AUTHENTICATED_USER:
      return {
        user: action.payload,
        isAdmin: checkIsAdmin(action.payload),
      };
    default:
      return state;
  }
};

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(userContextReducer, {
    user: null,
    isAdmin: false,
  });

  return <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = React.useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used within a LayoutProvider');
  }

  return context;
};
