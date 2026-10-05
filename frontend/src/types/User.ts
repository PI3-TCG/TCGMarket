export interface UserResponse {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  registrationDate: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserResponse
}

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  fields: ApiFieldError[]
}
