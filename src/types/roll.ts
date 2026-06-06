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

/**
 * Response shape from GET /api/scraps/{id}. Structurally identical to {@link FeltRollDto}; a scrap
 * piece is an offcut of felt that is no longer a roll.
 */
export type ScrapPieceDto = FeltRollDto;

/** One leftover scrap piece entered in the Abschneiden dialog. */
export type CutScrapInput = {
    length: number; // cm
    width: number; // cm
    batchId?: number;
    storageId?: number;
};

/** Request body for POST /api/rolls/{id}/cut (Abschneiden). */
export type CutFeltRollRequest = {
    cutLength: number; // cm to remove from the roll
    scraps: CutScrapInput[];
};

/** Result of a roll cut: the shortened roll plus the scrap pieces that were actually kept. */
export type CutResult = {
    roll: FeltRollDto;
    createdScraps: ScrapPieceDto[];
};
