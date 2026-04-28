const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? '/api';

const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJsonResponse = contentType.includes('application/json');

    if (!response.ok) {
        if (isJsonResponse) {
            const error = (await response.json()) as {message?: string};
            throw new Error(error.message || 'Request failed');
        }

        const text = await response.text();
        throw new Error(text || 'Request failed');
    }

    if (response.status === 204) {
        return undefined as T;
    }

    if (isJsonResponse) {
        return (await response.json()) as T;
    }

    return (await response.text()) as T;
};

export const get = <T>(url: string, options?: RequestInit): Promise<T> => request<T>(url, {method: 'GET', ...options});

export const post = <T>(url: string, body?: unknown, options?: RequestInit): Promise<T> =>
    request<T>(url, {method: 'POST', body: JSON.stringify(body), ...options});

export const patch = <T>(url: string, body?: unknown, options?: RequestInit): Promise<T> =>
    request<T>(url, {method: 'PATCH', body: JSON.stringify(body), ...options});

export const del = <T>(url: string, options?: RequestInit): Promise<T> => request<T>(url, {method: 'DELETE', ...options});
