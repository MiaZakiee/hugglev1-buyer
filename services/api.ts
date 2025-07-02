import { ApiResponse, ApiError, RequestConfig, InterceptorConfig, PaginatedResponse } from '@/types/api';
import { authService } from './auth';

class ApiService {
  private baseURL: string;
  private defaultTimeout: number = 30000;
  private interceptors: InterceptorConfig = {};

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    this.setupDefaultInterceptors();
  }

  /**
   * Set up default request and response interceptors
   */
  private setupDefaultInterceptors(): void {
    this.interceptors = {
      onRequest: async (config: RequestConfig) => {
        // Add authentication headers
        const session = await authService.getCurrentSession();
        if (session) {
          // Check if token needs refresh
          if (authService.isTokenExpired(session)) {
            const refreshedSession = await authService.refreshToken();
            if (refreshedSession) {
              config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${refreshedSession.access_token}`,
              };
            }
          } else {
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${session.access_token}`,
            };
          }
        }

        // Add default headers
        config.headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...config.headers,
        };

        return config;
      },

      onResponse: async <T>(response: ApiResponse<T>) => {
        // Log successful responses in development
        if (__DEV__) {
          console.log('API Response:', {
            success: response.success,
            timestamp: response.timestamp,
            data: response.data,
          });
        }
        return response;
      },

      onError: async (error: ApiError) => {
        // Handle authentication errors
        if (error.status === 401) {
          // Try to refresh token
          const refreshedSession = await authService.refreshToken();
          if (!refreshedSession) {
            // If refresh fails, sign out user
            await authService.signOut();
          }
        }

        // Log errors in development
        if (__DEV__) {
          console.error('API Error:', {
            message: error.message,
            status: error.status,
            code: error.code,
            details: error.details,
          });
        }

        return error;
      },
    };
  }

  /**
   * Make HTTP request with interceptors
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Apply request interceptor
      let config: RequestConfig = {
        headers: options.headers as Record<string, string>,
        timeout: options.timeout || this.defaultTimeout,
        retries: options.retries || 0,
        cache: options.cache || false,
      };

      if (this.interceptors.onRequest) {
        config = await this.interceptors.onRequest(config);
      }

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        ...options,
        headers: config.headers,
      };

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        let responseData: any;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        // Handle HTTP errors
        if (!response.ok) {
          const apiError: ApiError = {
            message: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            code: responseData.code || 'HTTP_ERROR',
            details: responseData.details || responseData,
          };

          if (this.interceptors.onError) {
            await this.interceptors.onError(apiError);
          }

          throw apiError;
        }

        // Create standardized response
        const apiResponse: ApiResponse<T> = {
          data: responseData.data || responseData,
          message: responseData.message,
          success: responseData.success !== false,
          timestamp: responseData.timestamp || new Date().toISOString(),
        };

        // Apply response interceptor
        if (this.interceptors.onResponse) {
          return await this.interceptors.onResponse(apiResponse);
        }

        return apiResponse;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        // Handle network errors
        const apiError: ApiError = {
          message: fetchError.name === 'AbortError' 
            ? 'Request timeout' 
            : fetchError.message || 'Network error',
          status: 0,
          code: fetchError.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
          details: fetchError,
        };

        if (this.interceptors.onError) {
          await this.interceptors.onError(apiError);
        }

        throw apiError;
      }
    } catch (error) {
      // Re-throw ApiError or create new one
      if (this.isApiError(error)) {
        throw error;
      }

      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
        code: 'UNKNOWN_ERROR',
        details: error,
      };

      throw apiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
      ...config,
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      ...config,
    });
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, file: File | FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    const uploadConfig = {
      ...config,
      headers: {
        ...config?.headers,
        // Remove Content-Type to let browser set it with boundary for FormData
      },
    };

    // Remove Content-Type for file uploads
    delete uploadConfig.headers?.['Content-Type'];

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: file instanceof FormData ? file : (() => {
        const formData = new FormData();
        formData.append('file', file);
        return formData;
      })(),
      ...uploadConfig,
    });
  }

  /**
   * Get paginated data
   */
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 20,
    config?: RequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<PaginatedResponse<T>>(
      `${endpoint}?page=${page}&limit=${limit}`,
      config
    );
    return response.data;
  }

  /**
   * Set custom interceptors
   */
  setInterceptors(interceptors: Partial<InterceptorConfig>): void {
    this.interceptors = {
      ...this.interceptors,
      ...interceptors,
    };
  }

  /**
   * Set base URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * Set default timeout
   */
  setTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  /**
   * Check if error is ApiError
   */
  private isApiError(error: any): error is ApiError {
    return error && typeof error.message === 'string' && typeof error.status === 'number';
  }

  /**
   * Create request with retry logic
   */
  async withRetry<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: ApiError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = this.isApiError(error) ? error : {
          message: error instanceof Error ? error.message : 'Unknown error',
          status: 0,
          code: 'RETRY_ERROR',
        };

        // Don't retry on authentication errors or client errors (4xx)
        if (lastError.status >= 400 && lastError.status < 500) {
          throw lastError;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }

    throw lastError!;
  }
}

export const apiService = new ApiService();