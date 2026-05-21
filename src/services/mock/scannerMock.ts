import {ScanResult} from '@/types/scanner.ts';

const MOCK_CODES: Record<string, ScanResult> = {
    '00001': {type: 'roll', id: '00001'},
    '00002': {type: 'scrap_piece', id: '00002'},
    '00003': {type: 'roll', id: '00003'},
    '00004': {type: 'scrap_piece', id: '00004'},
    '00005': {type: 'roll', id: '00005'},
};

export const getMockPresetCodes = (): string[] => {
    return Object.keys(MOCK_CODES);
};
