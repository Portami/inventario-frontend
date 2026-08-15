import {
    CreateFeltStocktakeDto,
    CreateFeltStocktakeScanDto,
    FeltStocktakeDto,
    FeltStocktakeItemDto,
    FeltStocktakeScanDto,
    ResolveFeltStocktakeProblemDto,
} from './types';
import {del, get, post} from '@/shared/api/http';

export const createStocktake = (dto: CreateFeltStocktakeDto): Promise<FeltStocktakeDto> => post<FeltStocktakeDto>('/stocktakes', dto);

export const fetchStocktakes = (): Promise<FeltStocktakeDto[]> => get<FeltStocktakeDto[]>('/stocktakes');

export const fetchStocktakeById = (id: string): Promise<FeltStocktakeDto> => get<FeltStocktakeDto>(`/stocktakes/${id}`);

export const deleteStocktake = async (id: string): Promise<void> => {
    await del(`/stocktakes/${id}`);
};

export const completeStocktake = (id: string): Promise<FeltStocktakeDto> => post<FeltStocktakeDto>(`/stocktakes/${id}/complete`, {});

export const fetchStocktakeItems = (stocktakeId: string, storageId: string): Promise<FeltStocktakeItemDto[]> =>
    get<FeltStocktakeItemDto[]>(`/stocktakes/${stocktakeId}/items?storageId=${storageId}`);

export const resolveStocktakeItem = (stocktakeId: string, id: string, dto: ResolveFeltStocktakeProblemDto): Promise<FeltStocktakeItemDto> =>
    post<FeltStocktakeItemDto>(`/stocktakes/${stocktakeId}/items/${id}/resolve`, dto);

export const createFeltStocktakeScan = (stocktakeId: string, dto: CreateFeltStocktakeScanDto): Promise<FeltStocktakeScanDto> =>
    post<FeltStocktakeScanDto>(`/stocktakes/${stocktakeId}/scans`, dto);

export const voidStocktakeScan = (stocktakeId: string, id: string): Promise<void> => post<void>(`/stocktakes/${stocktakeId}/scans/${id}/void`, {});

export const closeStocktakeStorage = (stocktakeId: string, id: string): Promise<void> => post<void>(`/stocktakes/${stocktakeId}/storages/${id}/close`, {});
