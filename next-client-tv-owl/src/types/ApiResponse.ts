export interface SuccessResponse<T> {
  success: true;
  status: number;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  status: number;
  message: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  isPremium: boolean;
}