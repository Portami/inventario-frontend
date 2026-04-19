import {Felt} from './felt';

export type ProductId = number | string;

/**
 * Product type - represents basic product information
 * Product specifications (color, type, thickness, weight, density) are referenced through the felt property
 */
export type Product = {
    id: ProductId;
    articleNumber: string;
    name?: string;
    length?: number; // Length in millimeters
    width?: number; // Width in millimeters
    felt?: Felt; // Reference to felt specifications
};

export type CreateProductRequest = {
    articleNumber: string;
    name?: string;
    length: number;
    width: number;
    felt: Felt;
};
