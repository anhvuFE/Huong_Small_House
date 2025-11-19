import axios from 'axios';

interface ErrorResponse {
  message?: string;
}

export const getErrorMessage = (error: unknown, fallback = 'Có lỗi xảy ra, vui lòng thử lại.'): string => {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
