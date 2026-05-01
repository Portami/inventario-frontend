import RollLabel from '@/components/RollLabel';
import {A4_HEIGHT_MM, A4_WIDTH_MM} from '@/pages/constants/labelConstants';
import {Product} from '@/types/product';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import {createRoot} from 'react-dom/client';

// PDF rendering constants (specific to PDF generation)
const MARGIN_MM = 10;
const GAP_MM = 5;
const RENDER_DELAY_MS = 100;
const CANVAS_SCALE = 2;

// A4 page dimensions (shared from labelConstants)
const PDF_WIDTH_MM = A4_WIDTH_MM;
const PDF_HEIGHT_MM = A4_HEIGHT_MM;

interface PageLayout {
    labelsPerRow: number;
    labelsPerColumn: number;
    labelsPerPage: number;
}

/**
 * Creates a temporary container for rendering React components off-screen
 */
const createTempContainer = (labelWidth: number, labelHeight: number, isFixed: boolean = false): HTMLDivElement => {
    const container = document.createElement('div');
    container.style.position = isFixed ? 'fixed' : 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    // Add extra padding to capture shadows (10mm padding on all sides)
    const paddingMm = 10;
    container.style.width = `${labelWidth + paddingMm * 2}mm`;
    container.style.height = `${labelHeight + paddingMm * 2}mm`;
    container.style.padding = `${paddingMm}mm`;
    container.style.backgroundColor = 'white';
    container.style.boxSizing = 'border-box';
    // Only hide visibility for fixed positioning (print mode)
    if (isFixed) {
        container.style.visibility = 'hidden';
    }
    document.body.appendChild(container);
    return container;
};

/**
 * Calculates the optimal label layout for a PDF page
 */
const calculatePageLayout = (labelWidth: number, labelHeight: number): PageLayout => {
    const availableWidth = PDF_WIDTH_MM - 2 * MARGIN_MM;
    const availableHeight = PDF_HEIGHT_MM - 2 * MARGIN_MM;
    const labelsPerRow = Math.max(1, Math.floor(availableWidth / (labelWidth + GAP_MM)));
    const labelsPerColumn = Math.max(1, Math.floor(availableHeight / (labelHeight + GAP_MM)));
    const labelsPerPage = labelsPerRow * labelsPerColumn;

    return {labelsPerRow, labelsPerColumn, labelsPerPage};
};

/**
 * Renders a label component to canvas
 */
const renderLabelToCanvas = async (
    container: HTMLDivElement,
    product: Product,
    labelWidth: number,
    labelHeight: number,
    renderDelay: number = RENDER_DELAY_MS,
): Promise<HTMLCanvasElement> => {
    container.innerHTML = '';

    // Temporarily disable print media queries by adding a style tag
    const styleTag = document.createElement('style');
    styleTag.textContent = '@media print { * { box-shadow: initial !important; } }';
    document.head.appendChild(styleTag);

    const root = createRoot(container);
    root.render(React.createElement(RollLabel, {product, width: labelWidth, height: labelHeight}));

    await new Promise((resolve) => setTimeout(resolve, renderDelay));

    const canvas = await html2canvas(container, {
        scale: CANVAS_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: labelHeight * 4,
        allowTaint: true,
    });

    root.unmount();

    // Clean up the temporary style tag
    styleTag.remove();

    return canvas;
};

/**
 * Generates PDF with labels and optionally saves or opens it
 */
const generateLabelsPdfInternal = async (
    products: Product[],
    labelWidth: number,
    labelHeight: number,
    isFixed: boolean,

    onComplete: (pdf: jsPDF) => Promise<void>,
): Promise<void> => {
    if (products.length === 0) {
        throw new Error('No products selected');
    }

    const tempContainer = createTempContainer(labelWidth, labelHeight, isFixed);
    const renderDelay = isFixed ? 150 : 100; // Use longer delay for fixed positioning (print mode)

    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const layout = calculatePageLayout(labelWidth, labelHeight);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            if (i > 0 && i % layout.labelsPerPage === 0) {
                pdf.addPage();
            }

            const indexOnPage = i % layout.labelsPerPage;
            const row = Math.floor(indexOnPage / layout.labelsPerRow);
            const col = indexOnPage % layout.labelsPerRow;

            const xPos = MARGIN_MM + col * (labelWidth + GAP_MM);
            const yPos = MARGIN_MM + row * (labelHeight + GAP_MM);

            const canvas = await renderLabelToCanvas(tempContainer, product, labelWidth, labelHeight, renderDelay);

            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * labelWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', xPos, yPos, labelWidth, imgHeight);
        }

        await onComplete(pdf);
    } finally {
        if (tempContainer.parentNode) {
            tempContainer.remove();
        }
    }
};

/**
 * Generate a PDF containing labels for selected rolls
 * Multiple labels are placed on the same page if there is enough space
 *
 * @param products - Array of products to generate labels for
 * @param filename - Output filename (without .pdf extension)
 * @param labelWidth - Label width in mm (default: 100mm)
 * @param labelHeight - Label height in mm (default: 150mm)
 */
export const generateLabelsPDF = async (
    products: Product[],
    filename: string = 'roll-labels',
    labelWidth: number = 100,
    labelHeight: number = 150,
): Promise<void> => {
    await generateLabelsPdfInternal(products, labelWidth, labelHeight, false, async (pdf) => {
        pdf.save(`${filename}.pdf`);
    });
};

/**
 * Open PDF in new window for printing
 * Multiple labels are placed on the same page if there is enough space
 *
 * @param products - Array of products to generate labels for
 * @param labelWidth - Label width in mm (default: 90mm - allows ~2 per row on A4)
 * @param labelHeight - Label height in mm (default: 100mm - allows ~2 per column on A4)
 */
export const printLabelsPDF = async (products: Product[], labelWidth: number = 90, labelHeight: number = 100): Promise<void> => {
    await generateLabelsPdfInternal(products, labelWidth, labelHeight, true, async (pdf) => {
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
    });
};
