import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';
import { ApiResponse, ApiError, RequestConfig } from '@/types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiOptions extends RequestConfig {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T = any>(
  endpoint?: string,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { immediate = false, onSuccess, onError, ...requestConfig } = options;

  /**
   * Execute API request
   */
  const execute = useCallback(async (
    customEndpoint?: string,
    customOptions?: RequestConfig
  ): Promise<ApiResponse<T> | null> => {
    const targetEndpoint = customEndpoint || endpoint;
    
    if (!targetEndpoint) {
      console.error('No endpoint provided for API request');
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiService.get<T>(targetEndpoint, {
        ...requestConfig,
        ...customOptions,
      });

      setState({
        data: response.data,
        loading: false,
        error: null,
      });

      onSuccess?.(response.data);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
      }));

      onError?.(apiError);
      return null;
    }
  }, [endpoint, requestConfig, onSuccess, onError]);

  /**
   * POST request
   */
  const post = useCallback(async (
    data?: any,
    customEndpoint?: string,
    customOptions?: RequestConfig
  ): Promise<ApiResponse<T> | null> => {
    const targetEndpoint = customEndpoint || endpoint;
    
    if (!targetEndpoint) {
      console.error('No endpoint provided for POST request');
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiService.post<T>(targetEndpoint, data, {
        ...requestConfig,
        ...customOptions,
      });

      setState({
        data: response.data,
        loading: false,
        error: null,
      });

      onSuccess?.(response.data);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
      }));

      onError?.(apiError);
      return null;
    }
  }, [endpoint, requestConfig, onSuccess, onError]);

  /**
   * PUT request
   */
  const put = useCallback(async (
    data?: any,
    customEndpoint?: string,
    customOptions?: RequestConfig
  ): Promise<ApiResponse<T> | null> => {
    const targetEndpoint = customEndpoint || endpoint;
    
    if (!targetEndpoint) {
      console.error('No endpoint provided for PUT request');
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiService.put<T>(targetEndpoint, data, {
        ...requestConfig,
        ...customOptions,
      });

      setState({
        data: response.data,
        loading: false,
        error: null,
      });

      onSuccess?.(response.data);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
      }));

      onError?.(apiError);
      return null;
    }
  }, [endpoint, requestConfig, onSuccess, onError]);

  /**
   * DELETE request
   */
  const remove = useCallback(async (
    customEndpoint?: string,
    customOptions?: RequestConfig
  ): Promise<ApiResponse<T> | null> => {
    const targetEndpoint = customEndpoint || endpoint;
    
    if (!targetEndpoint) {
      console.error('No endpoint provided for DELETE request');
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiService.delete<T>(targetEndpoint, {
        ...requestConfig,
        ...customOptions,
      });

      setState({
        data: response.data,
        loading: false,
        error: null,
      });

      onSuccess?.(response.data);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
      }));

      onError?.(apiError);
      return null;
    }
  }, [endpoint, requestConfig, onSuccess, onError]);

  /**
   * Clear state
   */
  const clear = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  /**
   * Retry last request
   */
  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  // Execute immediately if requested
  // useEffect(() => {
  //   if (immediate && endpoint) {
  //     execute();
  //   }
  // }, [immediate, endpoint, execute]);

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,

    // Actions
    execute,
    post,
    put,
    delete: remove,
    clear,
    retry,
  };
}

/**
 * Hook for paginated API requests
 */
export function usePaginatedApi<T = any>(
  endpoint: string,
  initialPage: number = 1,
  initialLimit: number = 20,
  options: UseApiOptions = {}
) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { execute, loading, error } = useApi(endpoint, options);

  /**
   * Load page data
   */
  const loadPage = useCallback(async (pageNum: number = page, pageLimit: number = limit) => {
    try {
      const response = await apiService.getPaginated<T>(endpoint, pageNum, pageLimit);
      
      if (pageNum === 1) {
        setAllData(response.data);
      } else {
        setAllData(prev => [...prev, ...response.data]);
      }

      setHasMore(response.pagination.hasNext);
      setPage(pageNum);
      
      return response;
    } catch (error) {
      console.error('Paginated API error:', error);
      throw error;
    }
  }, [endpoint, page, limit]);

  /**
   * Load next page
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      return loadPage(page + 1, limit);
    }
  }, [loading, hasMore, page, limit, loadPage]);

  /**
   * Refresh data (load first page)
   */
  const refresh = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    return loadPage(1, limit);
  }, [limit, loadPage]);

  return {
    // State
    data: allData,
    loading,
    error,
    page,
    limit,
    hasMore,

    // Actions
    loadPage,
    loadMore,
    refresh,
    setLimit,
  };
}