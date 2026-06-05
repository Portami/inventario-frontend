export const STORAGE_STATE = {
    Open: 'Offen',
    Closed: 'Abgeschlossen',
} as const;

export type StorageState = (typeof STORAGE_STATE)[keyof typeof STORAGE_STATE];

export const ITEM_STATE = {
    INITIAL: 'INITIAL',
    OK: 'OK',
    MISSING: 'MISSING',
    WRONG_STORAGE: 'WRONG_STORAGE',
    RESCAN_REQUIRED: 'RESCAN_REQUIRED',
    DUPLICATE_SCAN: 'DUPLICATE_SCAN', //one scan must be voided - can only be done when it is not part of a resolution - selection on which needs to be voided
    NOT_IN_STOCKTAKE: 'NOT_IN_STOCKTAKE',
    UNKNOWN: 'UNKNOWN',
} as const;

export type ItemState = (typeof ITEM_STATE)[keyof typeof ITEM_STATE];

export const ITEM_STATE_LABELS: Record<ItemState, string> = {
    [ITEM_STATE.INITIAL]: 'Initial',
    [ITEM_STATE.OK]: 'Ok',
    [ITEM_STATE.MISSING]: 'Fehlt',
    [ITEM_STATE.WRONG_STORAGE]: 'Falsches Lager',
    [ITEM_STATE.RESCAN_REQUIRED]: 'Erneuter Scan nötig',
    [ITEM_STATE.DUPLICATE_SCAN]: 'Doppelter Scan',
    [ITEM_STATE.NOT_IN_STOCKTAKE]: 'Nicht in Überprüfung',
    [ITEM_STATE.UNKNOWN]: 'Unbekannt',
} as const;

export type ItemStateLabels = (typeof ITEM_STATE_LABELS)[keyof typeof ITEM_STATE_LABELS];

export const ITEM_TYPE = {
    ROLL: 'ROLL',
    SCRAP: 'SCRAP',
    UNKNOWN: 'UNKNOWN',
} as const;

export type ItemType = (typeof ITEM_TYPE)[keyof typeof ITEM_TYPE];

export const RESOLUTION_TYPE = {
    ADJUST_STORAGE: 'ADJUST_STORAGE',
    MOVE_PHYSICALLY: 'MOVE_PHYSICALLY',
    IGNORE_MISSING: 'IGNORE_MISSING',
    REMOVE_MISSING: 'REMOVE_MISSING',
    ACKNOWLEDGE: 'ACKNOWLEDGE',
} as const;

export type ResolutionType = (typeof RESOLUTION_TYPE)[keyof typeof RESOLUTION_TYPE];

export const RESOLUTION_TYPES_LABELS: Record<ResolutionType, string> = {
    [RESOLUTION_TYPE.ADJUST_STORAGE]: 'Lager anpassen',
    [RESOLUTION_TYPE.MOVE_PHYSICALLY]: 'Verschieben',
    [RESOLUTION_TYPE.IGNORE_MISSING]: 'Fehlende ignorieren',
    [RESOLUTION_TYPE.REMOVE_MISSING]: 'Fehlende entfernen',
    [RESOLUTION_TYPE.ACKNOWLEDGE]: 'Bestätigen',
};

export type ResolutionTypeLabels = (typeof RESOLUTION_TYPES_LABELS)[keyof typeof RESOLUTION_TYPES_LABELS];

export const PROBLEM_STATE_COLORS: Partial<Record<ItemState, {backgroundColor: string; color: string}>> = {
    [ITEM_STATE.MISSING]: {
        backgroundColor: '#ffebee',
        color: '#b71c1c',
    },
    [ITEM_STATE.WRONG_STORAGE]: {
        backgroundColor: '#fff3e0',
        color: '#e65100',
    },
    [ITEM_STATE.RESCAN_REQUIRED]: {
        backgroundColor: '#e3f2fd',
        color: '#0d47a1',
    },
    [ITEM_STATE.DUPLICATE_SCAN]: {
        backgroundColor: '#f3e5f5',
        color: '#4a148c',
    },
    [ITEM_STATE.NOT_IN_STOCKTAKE]: {
        backgroundColor: '#eeeeee',
        color: '#212121',
    },
    [ITEM_STATE.UNKNOWN]: {
        backgroundColor: '#eceff1',
        color: '#263238',
    },
};

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
    rollOrScrap: FeltStocktakeRollOrScrapDto;
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
