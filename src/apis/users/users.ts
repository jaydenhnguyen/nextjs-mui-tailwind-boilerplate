import { http } from 'src/configs/request';
import { CreateUserRequest, GetUserListRequest, GetUserListResponse, User } from 'src/modules/Users/models';
import { USER_ENDPOINTS } from './endpoints';

export const getUserList = (params: GetUserListRequest, signal?: AbortSignal) =>
  http.get<GetUserListResponse>(USER_ENDPOINTS.USERS, { params, signal });

export const createUser = (payload: CreateUserRequest) =>
  http.post<User, CreateUserRequest>(USER_ENDPOINTS.USERS, payload);

export const deleteUser = (id: string) => http.delete(`${USER_ENDPOINTS.USERS}/${encodeURIComponent(id)}`);
