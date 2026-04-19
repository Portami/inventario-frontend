import {COLORS, TYPES} from '@/types/felt';
import {Product} from '@/types/product';

/**
 * Mock product data for development
 * These are placeholder products until backend endpoints are implemented
 * Products reference Felt specifications for color, type, and material properties
 *
 * TODO: Replace with actual backend calls to:
 * - GET /api/products
 * - GET /api/products?type=WOOL&color=RED (with filters)
 * - POST /api/products (create)
 * - DELETE /api/products/:id (delete)
 */
export const MOCK_PRODUCTS: Product[] = [
    {
        id: '00001',
        articleNumber: 'ART-001-RED-WOOL',
        name: 'Premium Wool Roll - Red',
        length: 50,
        width: 1500,
        felt: {
            id: 'FELT-001',
            type: TYPES.Wool,
            color: COLORS.Red,
            thickness: 3.5,
            weight: 22.5,
            density: 0.85,
        },
    },
    {
        id: '00002',
        articleNumber: 'ART-002-BLUE-WOOL',
        name: 'Premium Wool Roll - Blue',
        length: 50,
        width: 1500,
        felt: {
            id: 'FELT-002',
            type: TYPES.Wool,
            color: COLORS.Blue,
            thickness: 3.5,
            weight: 22.5,
            density: 0.85,
        },
    },
    {
        id: '00003',
        articleNumber: 'ART-003-GREEN-SYNTHETIC',
        name: 'Synthetic Roll - Green',
        length: 75,
        width: 1200,
        felt: {
            id: 'FELT-003',
            type: TYPES.Synthetic,
            color: COLORS.Green,
            thickness: 2.8,
            weight: 18.2,
            density: 0.72,
        },
    },
    {
        id: '00004',
        articleNumber: 'ART-004-RED-BLENDED',
        name: 'Blended Roll - Red',
        length: 60,
        width: 1600,
        felt: {
            id: 'FELT-004',
            type: TYPES.Blended,
            color: COLORS.Red,
            thickness: 3.2,
            weight: 24.6,
            density: 0.81,
        },
    },
    {
        id: '00005',
        articleNumber: 'ART-005-BLUE-INDUSTRIAL',
        name: 'Industrial Roll - Blue',
        length: 40,
        width: 1800,
        felt: {
            id: 'FELT-005',
            type: TYPES.Industrial,
            color: COLORS.Blue,
            thickness: 4.2,
            weight: 28.8,
            density: 0.95,
        },
    },
    {
        id: '00006',
        articleNumber: 'ART-006-OTHER-WOOL',
        name: 'Specialty Wool Roll',
        length: 55,
        width: 1400,
        felt: {
            id: 'FELT-006',
            type: TYPES.Wool,
            color: COLORS.Other,
            thickness: 3,
            weight: 20.1,
            density: 0.82,
        },
    },
    {
        id: '00007',
        articleNumber: 'ART-007-GREEN-BLENDED',
        name: 'Blended Roll - Green',
        length: 60,
        width: 1600,
        felt: {
            id: 'FELT-007',
            type: TYPES.Blended,
            color: COLORS.Green,
            thickness: 3.2,
            weight: 24.6,
            density: 0.81,
        },
    },
    {
        id: '00008',
        articleNumber: 'ART-008-RED-SYNTHETIC',
        name: 'Synthetic Roll - Red',
        length: 75,
        width: 1200,
        felt: {
            id: 'FELT-008',
            type: TYPES.Synthetic,
            color: COLORS.Red,
            thickness: 2.8,
            weight: 18.2,
            density: 0.72,
        },
    },
];

/**
 * Get mock products, optionally filtered
 * @param filters - Optional product filters (type and/or color)
 * @returns Filtered mock products
 */
export const getMockProducts = (filters?: {type?: string; color?: string}): Product[] => {
    if (!filters || (!filters.type && !filters.color)) {
        return MOCK_PRODUCTS;
    }

    return MOCK_PRODUCTS.filter((product) => {
        if (filters.type && product.felt?.type !== filters.type) {
            return false;
        }
        if (filters.color && product.felt?.color !== filters.color) {
            return false;
        }
        return true;
    });
};

/**
 * Get a mock product by ID
 * @param id - Product ID to find
 * @returns Product if found, null otherwise
 */
export const getMockProductById = (id: string | number): Product | undefined => {
    return MOCK_PRODUCTS.find((p) => String(p.id) === String(id));
};
