const BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

export const get = <T>(url: string, options?: RequestInit): Promise<T> => request<T>(url, {method: 'GET', ...options});

export const post = <T>(url: string, body?: any, options?: RequestInit): Promise<T> =>
    request<T>(url, {method: 'POST', body: JSON.stringify(body), ...options});

export const put = <T>(url: string, body?: any, options?: RequestInit): Promise<T> => request<T>(url, {method: 'PUT', body: JSON.stringify(body), ...options});

export const del = <T>(url: string, options?: RequestInit): Promise<T> => request<T>(url, {method: 'DELETE', ...options});

// Add more Types for API responses as needed
export type HelloWorldResponse = {
    message: string;
};
