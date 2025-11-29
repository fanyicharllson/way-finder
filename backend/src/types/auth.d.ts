interface RegisterDTO {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  token: string;
}

interface JWTPayload {
  userId: string;
  email: string;
}
