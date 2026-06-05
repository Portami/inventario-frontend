export const toErrorMessage = (error: unknown, fallback: string): string => {
    return error instanceof Error ? `${fallback}: ${error.message}` : fallback;
};
