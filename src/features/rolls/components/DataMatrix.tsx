import bwipjs from 'bwip-js';
import {useEffect, useRef} from 'react';

type DataMatrixProps = {
    id: string;
    width?: number;
    height?: number;
};

/**
 * 2D Barcode Code Generator Component
 * Generates a proper 2D QR Code barcode using BWIP.JS
 *
 * Data Matrix (2D) Format:
 * - Two-dimensional barcode encoding
 * - Can encode up to 4,296 characters
 * - Ideal for product identification and inventory tracking
 * - High data density - more information in smaller space
 * - Perfect for labeling and traceability systems
 * - Can be scanned by mobile devices and industrial scanners
 *
 * Input: 5-digit roll ID (e.g., 00001)
 * Output: Canvas-rendered Data Matrix (2D)
 */
export default function DataMatrix({id, width = 150, height = 150}: Readonly<DataMatrixProps>) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !id) return;

        const generateQRCode = async () => {
            try {
                containerRef.current!.innerHTML = '';

                const canvas = document.createElement('canvas');
                containerRef.current!.appendChild(canvas);

                // Generate proper 2D DataMatrix directly on canvas
                bwipjs.toCanvas(canvas, {
                    bcid: 'datamatrix', // Format
                    text: id, // Roll ID (e.g., 00001)
                    scale: 3, // Scaling for better print quality
                });
            } catch (error) {
                console.error('Error generating 2D barcode:', error);
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<div style="color: red; font-size: 12px; padding: 10px; text-align: center;">Error generating barcode</div>`;
                }
            }
        };

        void generateQRCode();
    }, [id]);

    return (
        <div
            ref={containerRef}
            className="data-matrix-container"
            style={{
                width,
                height,
            }}
        />
    );
}
