import type {Dispatch, SetStateAction} from 'react';

export const toErrorMessage = (error: unknown, fallback: string): string => {
    return error instanceof Error ? `${fallback}: ${error.message}` : fallback;
};

export const createDeleteHandler = <T extends {id: string | number}>(
    setItems: Dispatch<SetStateAction<T[]>>,
    setDeletingIds: Dispatch<SetStateAction<Set<string | number>>>,
    setError: Dispatch<SetStateAction<string>>,

    deleteApi: (_id: string | number) => Promise<void>,
) => {
    return async (itemId: string | number) => {
        setError('');
        setDeletingIds((prev) => new Set(prev).add(itemId));
        try {
            await deleteApi(itemId);
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

export function formatDate(value: Date | string | number | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear().toString()}`;
}

export function formatDateTime(value: Date | string | number | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const dateString = formatDate(value);
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return `${dateString} ${time}`;
}
