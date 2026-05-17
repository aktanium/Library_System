import axiosClient from './axiosClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};
