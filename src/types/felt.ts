import {ProductId} from './product';

export const COLORS = {
    Red: 'RED',
    Green: 'GREEN',
    Blue: 'BLUE',
    Other: 'OTHER',
} as const;

export type Color = (typeof COLORS)[keyof typeof COLORS];

export const TYPES = {
    Wool: 'WOOL',
    Synthetic: 'SYNTHETIC',
    Blended: 'BLENDED',
    Industrial: 'INDUSTRIAL',
} as const;

export type Type = (typeof TYPES)[keyof typeof TYPES];

/**
 * Felt type - represents felt specifications including color, type, and other material properties
 */
export type Felt = {
    id: ProductId;
    color: Color;
    type: Type;
    thickness?: number; // Thickness in millimeters
    weight?: number; // Weight in grams
    density?: number; // Density in g/cm³
};

export type CreateFeltRequest = {
    color: string;
    supplierColor: string;
    thickness: number;
    density: number;
    price: number;
    articleNumber: string;
    supplierId: number;
    feltTypeId: number;
    isLowOnSupply: boolean;
    hasBeenReordered: boolean;
};

/** Response shape from GET /api/felts and GET /api/felts/{id} */
export type FeltDto = {
    id: number;
    color: string;
    supplierColor: string;
    thickness: number;
    density: number;
    price: number;
    feltVariantId: number;
    articleNumber: string;
    supplierId: number;
    supplierName: string;
    feltId: number;
    feltTypeId: number;
    feltTypeName: string;
    isLowOnSupply: boolean;
    hasBeenReordered: boolean;
};
