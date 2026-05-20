import {Storage} from './storage';
import {Felt} from '@/types/felt.ts';

//TODO JET Adjust according to Stephan's APIs :)
export const STORAGE_STATE = {
    Open: 'Open',
    Closed: 'Closed',
} as const;

export type StorageState = (typeof STORAGE_STATE)[keyof typeof STORAGE_STATE];

export const ITEM_STATE = {
    Initial: 'Initial',
    Missing: 'Missing',
    WrongStorage: 'Wrong Storage',
    UnknownStorage: 'Unknown',
    Ok: 'OK',
} as const;

export type ItemState = (typeof ITEM_STATE)[keyof typeof ITEM_STATE];

export type StorageAuditing = {
    state: StorageState;
    storage: Storage;
};

export type ItemAuditing = {
    state: ItemState;
    storageId: number;
    felt: Felt;
    length: number;
    width: number;
};

export type InventoryAuditing = {
    date: Date;
    storages: StorageAuditing[];
};

export type Changelog = {
    state: ItemState;
    felt: Felt;
    length: number;
    width: number;
    actionTaken: string;
};
