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

export const success = <T>(
  status: number,
  data: T,
  message?: string
): SuccessResponse<T> => ({
  success: true,
  status,
  data,
  message,
});

export const failure = (status: number, message: string): ErrorResponse => ({
  success: false,
  status,
  message,
});
