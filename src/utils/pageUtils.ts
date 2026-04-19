/**
 * Shared utilities for pages
 */

import React from 'react';

/**
 * Convert error to readable message
 */
export const toErrorMessage = (error: unknown, fallback: string): string => {
    return error instanceof Error ? `${fallback}: ${error.message}` : fallback;
};

/**
 * Generic delete handler factory
 * Creates a delete handler with loading state management
 */
export const createDeleteHandler = <T extends {id: string | number}>(
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    setDeletingIds: React.Dispatch<React.SetStateAction<Set<string | number>>>,
    setError: React.Dispatch<React.SetStateAction<string>>,
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the deleteApi callback signature
    deleteApi?: (_id: string | number) => Promise<void>,
) => {
    return async (itemId: string | number) => {
        setError('');
        setDeletingIds((prev) => new Set(prev).add(itemId));
        try {
            // Call API if provided
            if (deleteApi) {
                await deleteApi(itemId);
            } else {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
            // Remove from list
            setItems((prev) => prev.filter((item) => item.id !== itemId));
        } catch (err) {
            setError(toErrorMessage(err, 'Failed to delete item'));
        } finally {
            setDeletingIds((prev) => {
                const updated = new Set(prev);
                updated.delete(itemId);
                return updated;
            });
        }
    };
};
