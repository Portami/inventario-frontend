//TODO JET Adjust according to Stephan's APIs :)
export const STORAGE_STATE = {
    Open: 'Open',
    Closed: 'Closed',
} as const;

export type StorageState = (typeof STORAGE_STATE)[keyof typeof STORAGE_STATE];

export const ITEM_STATE = {
    Initial: 'Initial',
    Ok: 'Ok',
    Missing: 'Missing',
    WrongStorage: 'Wrong Storage',
    RescanRequired: 'Rescan Required',
    DuplicateScan: 'Duplicate Scan',
    NotInAuditing: 'Not In Auditing',
    UnknownStorage: 'Unknown',
} as const;

export type ItemState = (typeof ITEM_STATE)[keyof typeof ITEM_STATE];

export const ITEM_TYPE = {
    Roll: 'Roll',
    Scrap: 'Scrap',
    Unknown: 'Unknown',
} as const;

export type ItemType = (typeof ITEM_TYPE)[keyof typeof ITEM_TYPE];

export const RESOLUTION_TYPE = {
    AdjustStorage: 'Adjust Storage',
    MovePhysically: 'Move Physically',
    IgnoreMissing: 'Ignore Missing',
    RemoveMissing: 'Remove Missing',
    Acknowledge: 'Acknowledge',
} as const;

export type ResolutionType = (typeof RESOLUTION_TYPE)[keyof typeof RESOLUTION_TYPE];

export type CreateFeltStocktakeDto = {
    description: string;
    includeScrap: boolean;
    storageIds: number[];
};

export type ExtendStocktakeDto = {
    storageIds: number[];
};

export type FeltStocktakeDto = {
    id: number;
    description: string;
    createdAt: Date;
    storageLists: FeltStocktakeListInfoDto[];
    isCompleted: boolean;
    completedAt: Date;
};

export type FeltStocktakeListInfoDto = {
    storageId: number;
    storageName: string;
    isClosed: boolean;
};

export type CreateFeltStocktakeScanDto = {
    barcode: string;
    scannedStorageId: number;
};

export type FeltStocktakeScanDto = {
    scanId: number;
    type: ItemType;
    itemId: number;
    barcode: string;
    scannedStorageId: number;
    isVoided: boolean;
    isCorrected: boolean;
    scannedAt: Date;
};

export type FeltStocktakeItemDto = {
    type: ItemType;
    itemId: number;
    rollOrScrapDto: FeltStocktakeRollOrScrapDto;
    barcode: string;
    expectedStorageId: number;
    expectedStorageName: string;
    status: ItemState;
    needsResolution: boolean;
    resolution: FeltStocktakeResolutionDto;
    scans: FeltStocktakeScanDto[];
};

export type FeltStocktakeRollOrScrapDto = {
    id: number;
    length: number;
    width: number;
    feltId: number;
    color: string;
    thickness: number;
    density: number;
    price: number;
    articleNumber: string;
    feltTypeName: string;
    supplierName: string;
    expectedStorageId: number;
    expectedStorageName: string;
};

export type FeltStocktakeResolutionDto = {
    resolution: ResolutionType;
    mutationOutsideStocktake: boolean;
    mutationApplied: boolean;
    newStorageId: number;
    newStorageName: string;
    comment: string;
};

export type ResolveFeltStocktakeProblemDto = {
    resolution: ResolutionType;
    comment?: string;
};
