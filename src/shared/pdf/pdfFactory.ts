import jsPDF from 'jspdf';

export const MM = {left: 15, right: 15, top: 15, bottom: 15} as const;
export const A4 = {w: 210, h: 297} as const;
export const CONTENT_W = A4.w - MM.left - MM.right; // 180 mm

export const C = {
    ink: [30, 30, 30] as [number, number, number],
    dim: [100, 100, 100] as [number, number, number],
    muted: [160, 160, 160] as [number, number, number],
    rule: [210, 210, 210] as [number, number, number],
};

export function createA4(): jsPDF {
    return new jsPDF({orientation: 'portrait', unit: 'mm', format: 'a4'});
}

export function setFont(pdf: jsPDF, style: 'normal' | 'bold', size: number, color: [number, number, number] = C.ink): void {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
}

export function hRule(pdf: jsPDF, y: number, x1: number = MM.left, x2: number = A4.w - MM.right, color: [number, number, number] = C.rule): void {
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.25);
    pdf.line(x1, y, x2, y);
}

export function txt(pdf: jsPDF, text: string, x: number, y: number, opts?: {align?: 'left' | 'right' | 'center'; maxWidth?: number}): void {
    pdf.text(text, x, y, {align: opts?.align ?? 'left', maxWidth: opts?.maxWidth});
}

/** Truncate `text` so it fits within `maxMm` mm in the current font, appending '…' if cut. */
export function fitText(pdf: jsPDF, text: string, maxMm: number): string {
    if (pdf.getTextWidth(text) <= maxMm) return text;
    let s = text;
    while (s.length > 1 && pdf.getTextWidth(s + '…') > maxMm) {
        s = s.slice(0, -1);
    }
    return s + '…';
}
