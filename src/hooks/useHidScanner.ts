import {useEffect, useState} from 'react';

// HID barcode/data-matrix scanners act as keyboards: they stream key events and finish with Enter.
export const useHidScanner = (
    isActive: boolean,

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
            const char = event.key;

            if (char === 'Enter') {
                event.preventDefault();

                if (scannedCode.trim().length > 0) {
                    onScan(scannedCode.trim());
                    setScannedCode('');
                }

                return;
            }

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

    return {isConnected, scannedCode};
};
