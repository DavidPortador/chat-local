/**
 * A reusable HTTP client for handling all HTTP methods with consistent
 * request handling, error handling, and response parsing.
 */
const httpClient = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    // Handle different response status codes
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    // Parse response based on content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Convenience methods for different HTTP verbs
 */
export const httpGet = (url, options) => httpClient(url, { 
  method: 'GET', 
  ...options 
});
export const httpPost = (url, body, options) => httpClient(url, { 
  method: 'POST', 
  body: JSON.stringify(body), 
  ...options 
});
export const httpPut = (url, body, options) => httpClient(url, { 
  method: 'PUT', 
  body: JSON.stringify(body), 
  ...options 
});
export const httpPatch = (url, body, options) => httpClient(url, { 
  method: 'PATCH', 
  body: JSON.stringify(body), 
  ...options 
});
export const httpDelete = (url, options) => httpClient(url, { 
  method: 'DELETE', 
  ...options 
});