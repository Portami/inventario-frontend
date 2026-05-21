export type CreateFeltRollRequest = {
    feltId: number;
    length: number; // cm
    width: number; // cm
    batchId?: number;
    storageId?: number;
};

export type UpdateFeltRollRequest = {
    length: number; // cm
    width: number; // cm
    batchId?: number;
    storageId?: number;
};

/** Response shape from GET /api/rolls/{id} */
export type FeltRollDto = {
    id: number;
    articleNumber: string;
    length: number; // cm
    width: number; // cm
    color: string;
    supplierColor: string;
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
