/**
 * Scanner module types
 * Defines all type definitions for the Data Matrix scanner feature
 */

export type ScanResultType = 'roll' | 'scrap_piece';

export interface ScanResult {
    type: ScanResultType;
    id: string;
}

export type ScanError = 'invalid_format' | 'not_found' | 'camera_denied' | 'unknown';

/**
 * Supported scanner device types
 */
export type ScannerDeviceType = 'camera' | 'bluetooth' | 'usb' | 'manual';

/**
 * Bluetooth scanner connection status
 */
export interface BluetoothScannerStatus {
    isConnected: boolean;
    lastScannedAt?: Date;
    deviceName?: string;
}
