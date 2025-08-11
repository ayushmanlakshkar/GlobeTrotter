export interface CreateUserInput {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string;
  city: string;
  country: string;
  password: string;
  avatar_url?: string;
  additional_info?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string;
  city: string;
  country: string;
  avatar_url?: string;
  additional_info?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}
