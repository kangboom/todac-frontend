import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // 요청 인터셉터: 토큰 추가
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터: 401 에러 처리
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
          }

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Refresh Token으로 새 Access Token 요청
            // withCredentials: true 설정으로 HttpOnly 쿠키 전송
            const { data } = await this.client.post(
              '/api/v1/auth/refresh',
              {},
              {
                withCredentials: true,
              }
            );

            const { access_token } = data;

            // 상태 업데이트
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              useAuthStore.getState().setAuth(user, access_token);
            } else {
              localStorage.setItem('access_token', access_token);
            }

            // 대기 중인 요청들 처리
            processQueue(null, access_token);

            // 원래 요청 재시도
            originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
            return this.client(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            useAuthStore.getState().clearAuth();
            if (
              window.location.pathname !== '/login' &&
              window.location.pathname !== '/signup'
            ) {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        // 에러 메시지 추출
        if (error.response?.data?.detail) {
          const detail = error.response.data.detail;
          if (typeof detail === 'string') {
            error.message = detail;
          } else if (Array.isArray(detail)) {
            error.message = detail
              .map((d: { msg?: string }) => d.msg || JSON.stringify(d))
              .join(', ');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;

