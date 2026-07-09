import {Storage} from './types';
import {get} from '@/shared/api/http';

export const fetchStorages = (): Promise<Storage[]> => get<Storage[]>('/storages');
