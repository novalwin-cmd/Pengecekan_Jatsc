/**
 * useApi - Custom React Hook for API Calls
 * Wrapper around axios with built-in loading and error states
 * Eliminates repeated axios boilerplate in components
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

/**
 * Custom hook for making API calls
 * Returns { data, loading, error, call }
 *
 * Usage:
 * const { data: inspections, loading, error, call } = useApi();
 *
 * // Trigger API call
 * const fetchData = async () => {
 *   const result = await call('GET', '/chiller-pump-ahu');
 *   console.log(result); // returns data or throws error
 * };
 */
export const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (method, endpoint, payload = null) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        method,
        url,
        headers: { 'Content-Type': 'application/json' },
      };

      if (payload) {
        config.data = payload;
      }

      const response = await axios(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'API Error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, call };
};

/**
 * Convenience hook for GET requests
 */
export const useApiGet = (endpoint, dependencies = []) => {
  const { data, loading, error, call } = useApi();

  const fetch = useCallback(async () => {
    return call('GET', endpoint);
  }, [endpoint, call]);

  return { data, loading, error, fetch };
};

/**
 * Convenience hook for POST requests
 */
export const useApiPost = () => {
  const { data, loading, error, call } = useApi();

  const post = useCallback(async (endpoint, payload) => {
    return call('POST', endpoint, payload);
  }, [call]);

  return { data, loading, error, post };
};

/**
 * Convenience hook for DELETE requests
 */
export const useApiDelete = () => {
  const { data, loading, error, call } = useApi();

  const remove = useCallback(async (endpoint) => {
    return call('DELETE', endpoint);
  }, [call]);

  return { data, loading, error, remove };
};

/**
 * Convenience hook for PUT requests
 */
export const useApiPut = () => {
  const { data, loading, error, call } = useApi();

  const put = useCallback(async (endpoint, payload) => {
    return call('PUT', endpoint, payload);
  }, [call]);

  return { data, loading, error, put };
};
