export type ProductId = number | string;

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

export const PRODUCT_COLOR_OPTIONS = Object.values(COLORS) as Color[];
export const PRODUCT_TYPE_OPTIONS = Object.values(TYPES) as Type[];

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

export type Product = {
    id: ProductId;
    articleNumber: string;
    name?: string;
    type: Type;
    color: Color;
};

export type CreateProductRequest = {
    articleNumber: string;
    name?: string;
    type: Type;
    color: Color;
};

export type ProductFilters = {
    type?: Type;
    color?: Color;
};
