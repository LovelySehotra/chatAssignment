import axiosClient from './axiosClient';

export interface User {
  _id: string;
  email: string;
  username?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface UpdateUserPayload {
  username?: string;
  avatar?: string;
  bio?: string;
}

export const userApi = {
  getMe: () =>
    axiosClient.get<User>('/users/me'),

  getAllUsers: () =>
    axiosClient.get<User[]>('/users'),

  updateUser: (data: UpdateUserPayload) =>
    axiosClient.patch<User>('/users', data),

  deleteUser: () =>
    axiosClient.delete('/users'),
};
