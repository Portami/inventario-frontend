export const toErrorMessage = (error: unknown, fallback: string): string => {
    return error instanceof Error ? `${fallback}: ${error.message}` : fallback;
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
