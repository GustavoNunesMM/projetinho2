export interface User {
  id: string;
  email: string;
  username: string;
  created_at?: string;
}

export interface UserFormData {
  username: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}