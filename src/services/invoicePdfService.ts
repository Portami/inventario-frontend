import {computeTotal} from './invoiceTotal';
import {A4, C, CONTENT_W, createA4, fitText, hRule, MM, setFont, txt} from './pdfFactory';
import logoSvgUrl from '@/assets/logo.svg';
import {PORTAMI} from '@/constants/companyConstants';
import {fmtCHF, fmtDate, fmtNum, lineSubtotal, OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {LineItemDto, OfferDto, OfferState} from '@/types/offerte';
export type {InvoiceOptions} from './invoiceTotal';
import type {InvoiceOptions} from './invoiceTotal';
import jsPDF from 'jspdf';
import {SwissQRBill} from 'swissqrbill/svg';

// ─── Document metadata ───────────────────────────────────────────────────────

const QR_STATES: OfferState[] = ['INVOICE', 'PAYMENT_REMINDER', 'FIRST_DUNNING_NOTICE', 'SECOND_DUNNING_NOTICE', 'COMPLETED'];

const DOC_TITLE: Record<OfferState, string> = {
    OFFER: 'OFFERTE',
    ORDER_CONFIRMATION: 'AUFTRAGSBESTÄTIGUNG',
    INVOICE: 'RECHNUNG',
    PAYMENT_REMINDER: 'ZAHLUNGSERINNERUNG', // extended dynamically with invoice date
    FIRST_DUNNING_NOTICE: '1. MAHNUNG',
    SECOND_DUNNING_NOTICE: '2. MAHNUNG',
    COMPLETED: 'RECHNUNG',
};

const DOC_SUBTITLE: Record<OfferState, string> = {
    OFFER: 'Für die von Ihnen gewünschten Artikel unterbreiten wir Ihnen folgendes Angebot:',
    ORDER_CONFIRMATION: 'Gerne bestätigen wir Ihren geschätzen Auftrag. Wir freuen uns, diesen Auftrag für Sie auszuführen.',
    INVOICE: 'Für die bei uns bestellten Artikel stellen wir Ihnen wie folgt Rechnung:',
    PAYMENT_REMINDER:
        'Verlegt oder vergessen, beides kann passieren. Darum erlauben wir uns,' +
        ' Ihnen einen neuen Einzahlungsschein zuzustellen, mit der Bitte den ausstehenden Betrag zu begleichen.',
    FIRST_DUNNING_NOTICE: 'Leider haben wir den ausstehenden Betrag trotz Zahlungserinnerung nicht erhalten.',
    SECOND_DUNNING_NOTICE: 'Wir bitten Sie, die Einzahlung inkl. Mahngebühren von CHF 30.00 jetzt nachzuholen.',
    COMPLETED: 'Für die bei uns bestellten Artikel stellen wir Ihnen wie folgt Rechnung:',
};

// ─── Table column layout (left margin 15 mm, right edge 195 mm = 210−15) ─────
// widths: 6 + 82 + 20 + 28 + 22 + 22 = 180 mm = CONTENT_W

const COL = {
    num: {x: MM.left, w: 6},
    art: {x: MM.left + 6, w: 82},
    qty: {x: MM.left + 88, w: 20},
    price: {x: MM.left + 108, w: 28},
    cut: {x: MM.left + 136, w: 22},
    total: {x: MM.left + 158, w: 22},
} as const;

const RIGHT = A4.w - MM.right; // 195 mm

const QR_ZONE_TOP = A4.h - 105; // 192 mm — top edge of QR bill zone
const SAFE_BOTTOM_QR = QR_ZONE_TOP - 4; // 188 mm — stop content here to leave a gap
const SAFE_BOTTOM_STD = A4.h - MM.bottom; // 282 mm — for pages without a QR bill

function newPage(pdf: jsPDF): number {
    pdf.addPage();
    return MM.top;
}

// ─── Section renderers ────────────────────────────────────────────────────────

function drawCompanyHeader(pdf: jsPDF): number {
    let y = MM.top + 4;

    setFont(pdf, 'bold', 10, C.ink);
    txt(pdf, PORTAMI.name, RIGHT, y, {align: 'right'});
    y += 5;

    setFont(pdf, 'normal', 9, C.dim);
    txt(pdf, PORTAMI.owners, RIGHT, y, {align: 'right'});
    y += 4.5;
    txt(pdf, `${PORTAMI.street}, CH-${PORTAMI.zip} ${PORTAMI.city}`, RIGHT, y, {align: 'right'});
    y += 4.5;
    txt(pdf, PORTAMI.phone, RIGHT, y, {align: 'right'});
    y += 4.5;
    txt(pdf, `${PORTAMI.email}  ·  ${PORTAMI.web}`, RIGHT, y, {align: 'right'});

    return y + 9; // bottom of header block
}

function drawCustomerBlock(pdf: jsPDF, offer: OfferDto, y: number): number {
    const {customer} = offer;
    const lx = MM.left;
    const labelX = 120;

    let ly = y; // left-column cursor
    let ry = y; // right-column cursor

    // Customer address – left
    setFont(pdf, 'bold', 10, C.ink);
    txt(pdf, customer.name, lx, ly);
    ly += 5;

    setFont(pdf, 'normal', 9, C.dim);
    if (customer.contactPerson) {
        txt(pdf, customer.contactPerson, lx, ly);
        ly += 4.5;
    }
    if (customer.street) {
        txt(pdf, customer.street, lx, ly);
        ly += 4.5;
    }
    if (customer.zip || customer.city) {
        txt(pdf, `${customer.zip} ${customer.city}`.trim(), lx, ly);
        ly += 4.5;
    }

    // Order info – right
    const rows: [string, string][] = [
        ['Auftragsnummer:', offer.number],
        ['Datum:', fmtDate(offer.createdISO)],
    ];
    if (offer.state === 'ORDER_CONFIRMATION') {
        rows.push(['Versandart:', 'Economy']);
        rows.push(['Liefertermin:', 'ca. 10–12 Arbeitstage']);
    }
    if (offer.dueISO) rows.push(['Fällig bis:', fmtDate(offer.dueISO)]);

    for (const [label, value] of rows) {
        setFont(pdf, 'normal', 9, C.dim);
        txt(pdf, label, labelX, ry);
        setFont(pdf, 'normal', 9, C.ink);
        txt(pdf, value, RIGHT, ry, {align: 'right'});
        ry += 4.5;
    }

    const blockBottom = Math.max(ly, ry) + 5;
    hRule(pdf, blockBottom);
    return blockBottom + 6;
}

function drawDocTitle(pdf: jsPDF, offer: OfferDto, y: number): number {
    const title = offer.state === 'PAYMENT_REMINDER' ? `ZAHLUNGSERINNERUNG / RECHNUNG VOM ${fmtDate(offer.createdISO)}` : DOC_TITLE[offer.state];
    setFont(pdf, 'bold', 16, C.ink);
    txt(pdf, title, MM.left, y);
    y += 8;

    setFont(pdf, 'normal', 9, C.dim);
    txt(pdf, DOC_SUBTITLE[offer.state], MM.left, y, {maxWidth: CONTENT_W});
    return y + 8;
}

const ROW_H = 11; // mm per data row
const HDR_H = 8; // mm for header row

function drawTableHeader(pdf: jsPDF, y: number): number {
    const bgGray: [number, number, number] = [245, 245, 245];
    pdf.setFillColor(...bgGray);
    pdf.rect(MM.left, y, CONTENT_W, HDR_H, 'F');
    hRule(pdf, y, MM.left, RIGHT, [185, 185, 185]);
    hRule(pdf, y + HDR_H, MM.left, RIGHT, [185, 185, 185]);
    setFont(pdf, 'bold', 7.5, C.dim);
    const hy = y + 5.5;
    txt(pdf, '#', COL.num.x, hy);
    txt(pdf, 'ARTIKEL', COL.art.x, hy);
    txt(pdf, 'MENGE', COL.qty.x + COL.qty.w, hy, {align: 'right'});
    txt(pdf, 'PREIS / EINH.', COL.price.x + COL.price.w, hy, {align: 'right'});
    txt(pdf, 'ZUSCHNITT', COL.cut.x + COL.cut.w, hy, {align: 'right'});
    txt(pdf, 'GESAMT', COL.total.x + COL.total.w, hy, {align: 'right'});
    return y + HDR_H;
}

function drawLineItemsTable(pdf: jsPDF, lines: LineItemDto[], y: number, safeBottom: number): number {
    y = drawTableHeader(pdf, y);

    if (lines.length === 0) {
        setFont(pdf, 'normal', 9, C.muted);
        txt(pdf, 'Keine Positionen vorhanden.', MM.left, y + 7);
        return y + 14;
    }

    let ry = y;
    let rowOnPage = 0;
    lines.forEach((line, i) => {
        // Only break mid-table for large tables (>10 rows)
        if (lines.length > 10 && ry + ROW_H > safeBottom) {
            ry = newPage(pdf);
            ry = drawTableHeader(pdf, ry);
            rowOnPage = 0;
        }

        const b1 = ry + 4.5;
        const b2 = ry + 8.5;

        if (rowOnPage % 2 === 1) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(MM.left, ry, CONTENT_W, ROW_H, 'F');
        }
        hRule(pdf, ry + ROW_H, MM.left, RIGHT, [228, 228, 228]);

        setFont(pdf, 'normal', 8, C.muted);
        txt(pdf, String(i + 1), COL.num.x, b1);

        setFont(pdf, 'bold', 9, C.ink);
        const nameText = line.feltTypeName + (line.color ? ` · ${line.color}` : '');
        txt(pdf, fitText(pdf, nameText, COL.art.w), COL.art.x, b1);

        setFont(pdf, 'normal', 7.5, C.dim);
        const descPart = line.description !== line.feltTypeName ? line.description : null;
        const secondary = [line.articleNumber, descPart].filter(Boolean).join(' · ');
        if (secondary) txt(pdf, fitText(pdf, secondary, COL.art.w), COL.art.x, b2);

        setFont(pdf, 'normal', 9, C.ink);
        txt(pdf, `${line.quantity} ${line.unit}`, COL.qty.x + COL.qty.w, b1, {align: 'right'});
        txt(pdf, fmtCHF(line.pricePerUnit), COL.price.x + COL.price.w, b1, {align: 'right'});
        txt(pdf, line.cutSurcharge > 0 ? fmtCHF(line.cutSurcharge) : '—', COL.cut.x + COL.cut.w, b1, {align: 'right'});

        setFont(pdf, 'bold', 9, C.ink);
        txt(pdf, fmtCHF(lineSubtotal(line)), COL.total.x + COL.total.w, b1, {align: 'right'});

        ry += ROW_H;
        rowOnPage++;
    });

    return ry + 3;
}

function drawTotals(pdf: jsPDF, lines: LineItemDto[], y: number, state: OfferState, options?: InvoiceOptions): number {
    const {subtotal, shippingFee, vatRate, vatAmount, dunningFee, total} = computeTotal(lines, state, options);
    const labelX = COL.cut.x;

    y += 2;
    hRule(pdf, y, labelX, RIGHT, C.rule);
    y += 5.5;

    setFont(pdf, 'normal', 9, C.dim);
    txt(pdf, 'Zwischensumme', labelX, y);
    setFont(pdf, 'normal', 9, C.ink);
    txt(pdf, fmtCHF(subtotal), RIGHT, y, {align: 'right'});
    y += 6;

    if (shippingFee > 0) {
        setFont(pdf, 'normal', 9, C.dim);
        txt(pdf, 'Liefergebühren', labelX, y);
        setFont(pdf, 'normal', 9, C.ink);
        txt(pdf, fmtCHF(shippingFee), RIGHT, y, {align: 'right'});
        y += 6;
    }

    if (vatRate > 0) {
        setFont(pdf, 'normal', 9, C.dim);
        txt(pdf, `MWST (${fmtNum(vatRate * 100, 1)} %)`, labelX, y);
        setFont(pdf, 'normal', 9, C.ink);
        txt(pdf, fmtCHF(vatAmount), RIGHT, y, {align: 'right'});
        y += 6;
    }

    if (dunningFee > 0) {
        setFont(pdf, 'normal', 9, C.dim);
        txt(pdf, 'Mahngebühren', labelX, y);
        setFont(pdf, 'normal', 9, C.ink);
        txt(pdf, fmtCHF(dunningFee), RIGHT, y, {align: 'right'});
        y += 6;
    }

    hRule(pdf, y, labelX, RIGHT, C.ink);
    y += 5.5;

    setFont(pdf, 'bold', 10, C.ink);
    txt(pdf, 'Total CHF', labelX, y);
    txt(pdf, fmtCHF(total), RIGHT, y, {align: 'right'});
    y += 5;

    if (vatRate === 0) {
        setFont(pdf, 'normal', 7.5, C.muted);
        txt(pdf, 'Nicht mehrwertsteuerpflichtig', labelX, y);
    }

    return y + 8;
}

const HAFTUNG_LINES = [
    'Bitte beachten Sie, dass wir keine Garantie für die Lebensdauer der Auflagen übernehmen,',
    'da sie stark vom individuellen Nutzen, der Pflege und der Sonneneinstrahlung abhängig ist.',
    'Minimalabweichungen wegen der Materialbeschaffenheit möglich (Toleranz +/- 3 mm).',
    'Abweichungen der Oberflächenstruktur, Farbe & Abmessung bleiben, aufgrund der versch.',
    'Naturprodukte vorbehalten. Beim Filz sind Strukturen sichtbar (Sprenkel, Tupfer, Fäden etc.).',
];

function drawFooter(pdf: jsPDF, state: OfferState, y: number): void {
    hRule(pdf, y);
    y += 6;

    setFont(pdf, 'normal', 9, C.dim);

    const isOffer = state === 'OFFER';
    const isAB = state === 'ORDER_CONFIRMATION';
    const isPaymentDoc = state === 'PAYMENT_REMINDER' || state === 'FIRST_DUNNING_NOTICE' || state === 'SECOND_DUNNING_NOTICE';

    if (isOffer) {
        txt(pdf, 'Wir würden uns freuen, diesen Auftrag für Sie ausführen zu dürfen.', MM.left, y, {maxWidth: CONTENT_W});
        y += 5;
    } else if (!isPaymentDoc) {
        txt(pdf, 'Herzlichen Dank für Ihren Auftrag und das entgegengebrachte Vertrauen in unsere Manufaktur.', MM.left, y, {maxWidth: CONTENT_W});
        y += 5;
    }
    txt(pdf, 'Freundliche Grüsse, Flurina Vitali', MM.left, y);
    y += 9;

    const LBL = MM.left + 27;
    const condRow = (label: string, value: string) => {
        setFont(pdf, 'bold', 8.5, C.dim);
        txt(pdf, label, MM.left, y);
        setFont(pdf, 'normal', 8.5, C.dim);
        txt(pdf, value, LBL, y, {maxWidth: CONTENT_W - 27});
        y += 4.5;
    };

    if (isOffer) {
        condRow('Offertgültigkeit:', '14 Tage');
    }
    if (state === 'PAYMENT_REMINDER') {
        condRow('Zahlungsart:', 'Wir bitten Sie, den offenen Betrag innert 5 Tagen zu begleichen.');
    } else {
        condRow('Zahlungsart:', 'Rechnung bezahlbar innert 10 Tagen rein netto');
    }
    if (isOffer || isAB) {
        condRow('Lieferung:', 'ca. 10–12 Arbeitstage nach Auftragsbestätigung');
        condRow('Preise:', 'ink. MWST, inkl. Versandkosten');
        condRow('AGB:', 'https://portami.ch/diesunddas/agb/');
    } else {
        condRow('Lieferung:', 'inkl. Versand und Verpackung');
        condRow('AGB:', 'www.portami.ch/agb');
    }
    condRow('UID:', `${PORTAMI.uid} · Nicht mehrwertsteuerpflichtig`);

    if (isOffer) {
        y += 1;
        setFont(pdf, 'bold', 8.5, C.dim);
        txt(pdf, 'Haftung:', MM.left, y);
        setFont(pdf, 'normal', 8.5, C.dim);
        for (const line of HAFTUNG_LINES) {
            txt(pdf, line, LBL, y, {maxWidth: CONTENT_W - 27});
            y += 4;
        }
    }
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

const LOGO_W_MM = 32;
const LOGO_H_MM = LOGO_W_MM * (83 / 148); // preserve aspect ratio

async function addLogo(pdf: jsPDF): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const scale = 4;
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(148 * scale);
            canvas.height = Math.round(83 * scale);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas 2D context unavailable'));
                return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', MM.left, MM.top, LOGO_W_MM, LOGO_H_MM);
            resolve();
        };
        img.onerror = () => reject(new Error('Logo SVG render failed'));
        img.src = logoSvgUrl;
    });
}

// ─── QR bill ─────────────────────────────────────────────────────────────────

async function addQRBill(pdf: jsPDF, offer: OfferDto, total: number): Promise<void> {
    const {customer} = offer;
    const hasAddress = Boolean(customer.street && customer.city);

    const data = {
        currency: 'CHF' as const,
        amount: Math.round(Math.max(0, total) * 100) / 100,
        creditor: {
            name: PORTAMI.name,
            address: PORTAMI.street,
            zip: PORTAMI.zip,
            city: PORTAMI.city,
            country: PORTAMI.country,
            account: PORTAMI.iban,
        },
        ...(hasAddress && {
            debtor: {
                name: customer.name,
                address: customer.street,
                zip: customer.zip || '0000',
                city: customer.city || '-',
                country: customer.country?.length === 2 ? customer.country : 'CH',
            },
        }),
        message: `Rechnung ${offer.number}`.substring(0, 140),
    };

    const qrBill = new SwissQRBill(data, {language: 'DE'});
    const svgStr = qrBill.toString();

    await new Promise<void>((resolve, reject) => {
        const blob = new Blob([svgStr], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // 210 mm × 105 mm at ~300 dpi
            canvas.width = 2480;
            canvas.height = 1240;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('Canvas 2D context unavailable'));
                return;
            }
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, A4.h - 105, 210, 105);
            URL.revokeObjectURL(url);
            resolve();
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('QR bill SVG render failed'));
        };
        img.src = url;
    });
}

// ─── Main export ─────────────────────────────────────────────────────────────

const COMBINED_TAIL_H = 78; // mm — actual combined height of totals + footer

export async function generateOfferPdf(offer: OfferDto, options?: InvoiceOptions): Promise<void> {
    const pdf = createA4();
    await addLogo(pdf);
    const safeBottom = QR_STATES.includes(offer.state) ? SAFE_BOTTOM_QR : SAFE_BOTTOM_STD;

    let y = drawCompanyHeader(pdf);
    y = drawCustomerBlock(pdf, offer, y);
    y = drawDocTitle(pdf, offer, y);
    y = drawLineItemsTable(pdf, offer.lines, y, safeBottom);

    // Only page-break if totals + footer genuinely won't fit on this page
    if (y + COMBINED_TAIL_H > safeBottom) y = newPage(pdf);
    y = drawTotals(pdf, offer.lines, y, offer.state, options);
    drawFooter(pdf, offer.state, y);

    const {total} = computeTotal(offer.lines, offer.state, options);
    if (QR_STATES.includes(offer.state)) {
        await addQRBill(pdf, offer, total);
    }

    const docName = OFFER_STATE_META[offer.state].doc.replace('.pdf', '');
    const customerSlug = offer.customer.name.replace(/[^a-zA-Z0-9äöüÄÖÜ]+/g, '-').replace(/^-|-$/g, '');
    const dateStr = new Date().toISOString().slice(0, 10);
    pdf.save(`${docName}-${offer.number}-${customerSlug}-${dateStr}.pdf`);
}
