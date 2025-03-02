export enum Role {
  USER = 0,
  ADMIN = 1
}

export interface User {
  id: number;
  name: string;
  role: Role
}

export interface UserUpdate {
  name: string;
  role?: string;
}

export interface UserRegister {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
}
