import {useEffect, useState} from 'react';

/**
 * Hook for handling Bluetooth/USB HID scanner input
 *
 * Bluetooth barcode scanners typically act as HID keyboards and transmit
 * barcode data as keyboard events, ending with an Enter key.
 *
 * This hook accumulates keyboard input and triggers the onScan callback
 * when an Enter key is detected.
 *
 * @param isActive - Whether to listen for scanner input
 * @param onScan - Callback when a complete scan is received
 */
export const useBluetoothScanner = (
    isActive: boolean,
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the callback signature
    onScan: (code: string) => void,
) => {
    const [scannedCode, setScannedCode] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setIsConnected(false);
            return;
        }

        setIsConnected(true);
        setScannedCode('');

        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if the scanner is actively sending data
            // Some scanners prefix with special characters, we'll ignore them
            const char = event.key;

            // Enter key signals end of barcode
            if (char === 'Enter') {
                event.preventDefault();

                if (scannedCode.trim().length > 0) {
                    onScan(scannedCode.trim());
                    setScannedCode('');
                }

                return;
            }

            // Collect printable characters and numbers
            if (char.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
                event.preventDefault();
                setScannedCode((prev) => prev + char);
            }
        };

        globalThis.addEventListener('keydown', handleKeyDown);

        return () => {
            globalThis.removeEventListener('keydown', handleKeyDown);
            setIsConnected(false);
        };
    }, [isActive, scannedCode, onScan]);

    return {
        isConnected,
        scannedCode,
    };
};
