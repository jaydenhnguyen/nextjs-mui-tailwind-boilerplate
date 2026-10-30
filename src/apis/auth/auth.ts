import { http } from 'src/configs/request';
import { LoginRequest, LoginResponse, User } from 'src/modules/Authentication/models';
import { AUTH_ENDPOINTS } from './endpoints';

export const login = (payload: LoginRequest) =>
  http.post<LoginResponse, LoginRequest>(AUTH_ENDPOINTS.LOGIN, payload, { skipAuthRefresh: true });

export const logout = () => http.post<void>(AUTH_ENDPOINTS.LOGOUT, undefined, { skipAuthRefresh: true });

export const getCurrentUser = (signal?: AbortSignal) => http.get<User>(AUTH_ENDPOINTS.ME, { signal });
