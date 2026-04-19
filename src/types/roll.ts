import {Felt} from './felt';
import {ProductId} from './product';

/**
 * Roll type - represents a physical roll of felt material in inventory
 * Includes batch information, location, and roll-specific properties
 * Felt specifications (color, type, thickness, weight, density) are referenced through the felt property
 */
export type Roll = {
    id: ProductId;
    name?: string;
    articleNumber: string;
    batch: string;
    quantity: number;
    location: string;
    // Roll-specific dimensions
    width?: number; // Width in mm
    lengthM?: number; // Length in meters
    // Felt specifications with color, type, thickness, weight, density
    felt?: Felt;
};
