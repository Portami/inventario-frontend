import {ScanResult} from './types';
import {get} from '@/shared/api/http';

/**
 * Lookup a roll or scrap piece by Data Matrix code.
 * Calls GET /api/barcodes/{code} and normalizes the response to ScanResult.
 *
 * @param code - 5-digit roll code to lookup
 * @returns Promise with scan result (type and ID)
 */
export const lookupRollCode = async (code: string): Promise<ScanResult> => {
    const raw = await get<{type: string; id: number}>(`/barcodes/${encodeURIComponent(code)}`);
    return {
        // Backend returns "scrap"; frontend uses "scrap_piece"
        type: raw.type === 'scrap' ? 'scrap_piece' : 'roll',
        id: String(raw.id),
    };
};
