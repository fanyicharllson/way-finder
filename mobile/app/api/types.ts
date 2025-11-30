// Request DTOs
export interface RegisterDTO {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Backend Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Auth Data from Backend
export interface AuthData {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  token: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
