import {Batch, CreateFeltRequest, FeltDto, FeltTypeDto, Supplier} from './types';
import {del, get, patch, post} from '@/shared/api/http';

export const fetchFelts = (): Promise<FeltDto[]> => get<FeltDto[]>('/felts');

export const fetchSuppliers = (): Promise<Supplier[]> => get<Supplier[]>('/felts/suppliers');

export const fetchFeltTypes = (): Promise<FeltTypeDto[]> => get<FeltTypeDto[]>('/felts/types');

export const fetchBatchesByFelt = (feltId: number): Promise<Batch[]> => get<Batch[]>(`/felts/${feltId}/batches`);

export const createFelt = (payload: CreateFeltRequest): Promise<FeltDto> => post<FeltDto>('/felts', payload);

export const updateFelt = (id: number, payload: CreateFeltRequest): Promise<FeltDto> => patch<FeltDto>(`/felts/${id}`, payload);

/** Delete a felt. Calls DELETE /api/felts/{id}. */
export const deleteFelt = (feltId: number): Promise<void> => del<void>(`/felts/${feltId}`);
