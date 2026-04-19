import {COLORS, TYPES} from '@/types/felt';
import {Roll} from '@/types/roll';

/**
 * Mock roll data for development
 * These are placeholder rolls until backend endpoints are implemented
 * Includes realistic specifications through felt references
 *
 * TODO: Replace with actual backend calls to:
 * - GET /api/rolls
 * - GET /api/rolls?feltId=X&storage=Y (with filters)
 * - POST /api/rolls (create)
 * - DELETE /api/rolls/:id (delete)
 */
export const MOCK_ROLLS: Roll[] = [
    {
        id: '1',
        name: 'Premium Wool Roll',
        articleNumber: 'ART-001',
        batch: 'BATCH-2026-001',
        quantity: 100,
        location: 'STORAGE-A',
        width: 1500,
        lengthM: 50,
        felt: {
            id: 'FELT-001',
            color: COLORS.Red,
            type: TYPES.Wool,
            thickness: 3.5,
            weight: 22.5,
            density: 0.85,
        },
    },
    {
        id: '2',
        name: 'Synthetic Blend Roll',
        articleNumber: 'ART-002',
        batch: 'BATCH-2026-002',
        quantity: 75,
        location: 'STORAGE-B',
        width: 1200,
        lengthM: 75,
        felt: {
            id: 'FELT-002',
            color: COLORS.Green,
            type: TYPES.Synthetic,
            thickness: 2.8,
            weight: 18.2,
            density: 0.72,
        },
    },
    {
        id: '3',
        name: 'Industrial Felt Roll',
        articleNumber: 'ART-003',
        batch: 'BATCH-2026-003',
        quantity: 50,
        location: 'STORAGE-A',
        width: 1800,
        lengthM: 40,
        felt: {
            id: 'FELT-003',
            color: COLORS.Blue,
            type: TYPES.Industrial,
            thickness: 4.2,
            weight: 28.8,
            density: 0.95,
        },
    },
    {
        id: '4',
        name: 'Blended Wool Roll',
        articleNumber: 'ART-004',
        batch: 'BATCH-2026-004',
        quantity: 120,
        location: 'STORAGE-C',
        width: 1600,
        lengthM: 60,
        felt: {
            id: 'FELT-004',
            color: COLORS.Other,
            type: TYPES.Blended,
            thickness: 3.2,
            weight: 24.6,
            density: 0.81,
        },
    },
    {
        id: '5',
        name: 'Fine Wool Roll',
        articleNumber: 'ART-005',
        batch: 'BATCH-2026-005',
        quantity: 60,
        location: 'STORAGE-A',
        width: 1400,
        lengthM: 80,
        felt: {
            id: 'FELT-005',
            color: COLORS.Red,
            type: TYPES.Wool,
            thickness: 2.5,
            weight: 19.8,
            density: 0.68,
        },
    },
];

/**
 * Get all mock rolls
 */
export const getMockRolls = (): Roll[] => {
    return [...MOCK_ROLLS];
};

/**
 * Get a mock roll by ID
 */

export const getMockRollById = (id: number | string): Roll | undefined => {
    return MOCK_ROLLS.find((roll) => roll.id === id);
};
