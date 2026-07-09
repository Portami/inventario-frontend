import {CreateFeltRollRequest, CutFeltRollRequest, CutResult, FeltRollDto, ScrapPieceDto, UpdateFeltRollRequest} from './types';
import type {Product, ProductId} from '@/features/products/types';
import {del, get, patch, post} from '@/shared/api/http';

export const fetchRolls = (): Promise<FeltRollDto[]> => get<FeltRollDto[]>('/rolls');

/** Fetch details for a specific roll. Calls GET /api/rolls/{id}. */
export const fetchRollDetails = (rollId: ProductId): Promise<FeltRollDto> => get<FeltRollDto>(`/rolls/${rollId}`);

export const fetchRollsByFelt = (feltId: number): Promise<FeltRollDto[]> => get<FeltRollDto[]>(`/felts/${feltId}/rolls`);

export const createRoll = (payload: CreateFeltRollRequest): Promise<FeltRollDto> => post<FeltRollDto>('/rolls', payload);

export const updateRoll = (rollId: ProductId, payload: UpdateFeltRollRequest): Promise<FeltRollDto> => patch<FeltRollDto>(`/rolls/${rollId}`, payload);

export const splitRoll = (rollId: ProductId, payload: {width: number}): Promise<FeltRollDto> => post<FeltRollDto>(`/rolls/${rollId}/split`, payload);

/**
 * Shorten a roll and create the leftover scrap pieces (Abschneiden). Calls POST /api/rolls/{id}/cut.
 * Too-small scraps are dropped server-side and are absent from the returned createdScraps.
 */
export const cutRoll = (rollId: ProductId, payload: CutFeltRollRequest): Promise<CutResult> => post<CutResult>(`/rolls/${rollId}/cut`, payload);

/** Delete a roll. Calls DELETE /api/rolls/{id}. */
export const deleteRoll = (rollId: ProductId): Promise<void> => del<void>(`/rolls/${rollId}`);

export const fetchAllScraps = (): Promise<Product[]> => get<Product[]>('/scraps');

export const fetchScrapsByFelt = (feltId: number): Promise<ScrapPieceDto[]> => get<ScrapPieceDto[]>(`/felts/${feltId}/scraps`);

export const fetchScrapDetails = (scrapId: number): Promise<ScrapPieceDto> => get<ScrapPieceDto>(`/scraps/${scrapId}`);

/** Partially update a scrap piece. Calls PATCH /api/scraps/{id}. */
export const updateScrap = (scrapId: ProductId, payload: UpdateFeltRollRequest): Promise<ScrapPieceDto> => patch<ScrapPieceDto>(`/scraps/${scrapId}`, payload);

/** Delete a scrap piece. Calls DELETE /api/scraps/{id}. */
export const deleteScrap = (scrapId: ProductId): Promise<void> => del<void>(`/scraps/${scrapId}`);
