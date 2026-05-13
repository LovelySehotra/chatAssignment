import axiosClient from './axiosClient';

export interface SignupPayload {
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  email: string;
  avatar?: string;
  createdAt: string;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  signup: (data: SignupPayload) =>
    axiosClient.post<AuthResponse>('/users', data),

  login: (data: LoginPayload) =>
    axiosClient.post<AuthResponse>('/users/login', data),
};
