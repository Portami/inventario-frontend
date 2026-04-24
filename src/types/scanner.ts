/**
 * Scanner module types
 * Defines all type definitions for the Data Matrix scanner feature
 */

export type ScanResultType = 'roll' | 'scrap_piece';

export interface ScanResult {
    type: ScanResultType;
    id: string;
}
