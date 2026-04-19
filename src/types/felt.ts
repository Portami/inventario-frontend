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

export const colorLabels: Record<Color, string> = {
    [COLORS.Red]: 'Red',
    [COLORS.Green]: 'Green',
    [COLORS.Blue]: 'Blue',
    [COLORS.Other]: 'Other',
} as const;

export const typeLabels: Record<Type, string> = {
    [TYPES.Wool]: 'Wool',
    [TYPES.Synthetic]: 'Synthetic',
    [TYPES.Blended]: 'Blended',
    [TYPES.Industrial]: 'Industrial',
} as const;

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

export type ProductFilters = {
    type?: Type;
    color?: Color;
};
