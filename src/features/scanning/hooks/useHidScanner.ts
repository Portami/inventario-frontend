import {useEffect, useRef, useState} from 'react';

// HID barcode/data-matrix scanners act as keyboards: they stream key events and finish with Enter.
export const useHidScanner = (
    isActive: boolean,

    onScan: (code: string) => void,
) => {
    const [scannedCode, setScannedCode] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const bufferRef = useRef('');
    const onScanRef = useRef(onScan);

    // Keep the callback ref current without triggering effect re-runs
    useEffect(() => {
        onScanRef.current = onScan;
    });

    useEffect(() => {
        if (!isActive) {
            setIsConnected(false);
            return;
        }

        setIsConnected(true);
        bufferRef.current = '';
        setScannedCode('');

        const handleKeyDown = (event: KeyboardEvent) => {
            const char = event.key;

            if (char === 'Enter') {
                event.preventDefault();

                const current = bufferRef.current.trim();
                if (current.length > 0) {
                    onScanRef.current(current);
                    bufferRef.current = '';
                    setScannedCode('');
                }

                return;
            }

            if (char.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
                event.preventDefault();
                bufferRef.current += char;
                setScannedCode(bufferRef.current);
            }
        };

        globalThis.addEventListener('keydown', handleKeyDown);

        return () => {
            globalThis.removeEventListener('keydown', handleKeyDown);
            setIsConnected(false);
        };
    }, [isActive]);

    return {isConnected, scannedCode};
};
