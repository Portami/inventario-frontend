import {Felt} from './felt';
import {ProductId} from './product';

export type Roll = {
    id: ProductId;
    name?: string;
    articleNumber: string;
    batch: string;
    quantity: number;
    location: string;
    width?: number; // Width in mm
    lengthM?: number; // Length in meters
    felt?: Felt;
};

export type CreateFeltRollRequest = {
    feltId: number;
    length: number; // meters
    width: number; // meters
    batchId?: number;
    storageId?: number;
};

/** Response shape from GET /api/rolls/{id} */
export type FeltRollDto = {
    id: number;
    articleNumber: string;
    length: number; // meters
    width: number; // meters
    feltColorVariantId: number;
    color: string;
    supplierColor: string;
    feltVariantId: number;
    thickness: number;
    density: number;
    price: number;
    feltId: number;
    feltTypeName: string;
    supplierName: string;
    batchId?: number;
    batchName?: string;
    storageId?: number;
    storageName?: string;
};
