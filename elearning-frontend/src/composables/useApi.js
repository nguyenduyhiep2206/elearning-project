import { ref } from 'vue'

const baseURL = 'http://localhost:3000/api/v1'

export function useApi() {
  const isLoading = ref(false)
  const error = ref(null)

  // Lấy auth token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  // Lấy headers với auth token
  const getHeaders = (includeAuth = true) => {
    const headers = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const token = getAuthToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  // Hàm request API tổng quát
  const request = async (endpoint, options = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const url = `${baseURL}${endpoint}`
      const config = {
        headers: getHeaders(options.includeAuth !== false),
        ...options,
      }

      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return { success: true, data }
    } catch (err) {
      error.value = err.message
      console.error('API request error:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // GET request
  const get = (endpoint, options = {}) => {
    return request(endpoint, {
      method: 'GET',
      ...options,
    })
  }

  // POST request
  const post = (endpoint, data, options = {}) => {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  }

  // PUT request
  const put = (endpoint, data, options = {}) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })
  }

  // DELETE request
  const del = (endpoint, options = {}) => {
    return request(endpoint, {
      method: 'DELETE',
      ...options,
    })
  }

  // PATCH request
  const patch = (endpoint, data, options = {}) => {
    return request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    })
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    get,
    post,
    put,
    delete: del,
    patch,
    request,
  }
}
