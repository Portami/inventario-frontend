import {PORTAMI} from '@/constants/companyConstants';
import {fmtCHF, fmtDate, fmtNum, lineSubtotal, OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {LineItemDto, OfferDto, OfferState} from '@/types/offerte';

export interface InvoiceOptions {
    shippingFee?: number;
    vatRate?: number;
}
import {A4, C, CONTENT_W, createA4, fitText, hRule, MM, setFont, txt} from './pdfFactory';
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

function drawLineItemsTable(pdf: jsPDF, lines: LineItemDto[], y: number): number {
    const ROW_H = 11; // mm per data row
    const HDR_H = 8; // mm for header row
    const bgGray: [number, number, number] = [245, 245, 245];

    // Header background
    pdf.setFillColor(...bgGray);
    pdf.rect(MM.left, y, CONTENT_W, HDR_H, 'F');
    hRule(pdf, y, MM.left, RIGHT, [185, 185, 185]);
    hRule(pdf, y + HDR_H, MM.left, RIGHT, [185, 185, 185]);

    // Header labels
    setFont(pdf, 'bold', 7.5, C.dim);
    const hy = y + 5.5;
    txt(pdf, '#', COL.num.x, hy);
    txt(pdf, 'ARTIKEL', COL.art.x, hy);
    txt(pdf, 'MENGE', COL.qty.x + COL.qty.w, hy, {align: 'right'});
    txt(pdf, 'PREIS / EINH.', COL.price.x + COL.price.w, hy, {align: 'right'});
    txt(pdf, 'ZUSCHNITT', COL.cut.x + COL.cut.w, hy, {align: 'right'});
    txt(pdf, 'GESAMT', COL.total.x + COL.total.w, hy, {align: 'right'});

    y += HDR_H;

    if (lines.length === 0) {
        setFont(pdf, 'normal', 9, C.muted);
        txt(pdf, 'Keine Positionen vorhanden.', MM.left, y + 7);
        return y + 14;
    }

    lines.forEach((line, i) => {
        const ry = y + i * ROW_H;
        const b1 = ry + 4.5; // primary text baseline
        const b2 = ry + 8.5; // secondary text baseline

        if (i % 2 === 1) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(MM.left, ry, CONTENT_W, ROW_H, 'F');
        }
        hRule(pdf, ry + ROW_H, MM.left, RIGHT, [228, 228, 228]);

        // #
        setFont(pdf, 'normal', 8, C.muted);
        txt(pdf, String(i + 1), COL.num.x, b1);

        // Artikel — primary line (truncate to column width, no wrap)
        setFont(pdf, 'bold', 9, C.ink);
        const nameText = line.feltTypeName + (line.color ? ` · ${line.color}` : '');
        txt(pdf, fitText(pdf, nameText, COL.art.w), COL.art.x, b1);

        // Artikel — secondary line (skip description when it duplicates the primary name)
        setFont(pdf, 'normal', 7.5, C.dim);
        const descPart = line.description !== line.feltTypeName ? line.description : null;
        const secondary = [line.articleNumber, descPart].filter(Boolean).join(' · ');
        if (secondary) txt(pdf, fitText(pdf, secondary, COL.art.w), COL.art.x, b2);

        // Menge
        setFont(pdf, 'normal', 9, C.ink);
        txt(pdf, `${line.quantity} ${line.unit}`, COL.qty.x + COL.qty.w, b1, {align: 'right'});

        // Preis/Einh.
        txt(pdf, fmtCHF(line.pricePerUnit), COL.price.x + COL.price.w, b1, {align: 'right'});

        // Zuschnitt
        txt(pdf, line.cutSurcharge > 0 ? fmtCHF(line.cutSurcharge) : '—', COL.cut.x + COL.cut.w, b1, {align: 'right'});

        // Gesamt
        setFont(pdf, 'bold', 9, C.ink);
        txt(pdf, fmtCHF(lineSubtotal(line)), COL.total.x + COL.total.w, b1, {align: 'right'});
    });

    return y + lines.length * ROW_H + 3;
}

function drawTotals(pdf: jsPDF, lines: LineItemDto[], y: number, state: OfferState, options?: InvoiceOptions): number {
    const subtotal = lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const shippingFee = options?.shippingFee ?? 0;
    const vatRate = options?.vatRate ?? 0;
    const dunningFee = state === 'SECOND_DUNNING_NOTICE' ? 30 : 0;
    const vatBase = subtotal + shippingFee;
    const vatAmount = vatBase * vatRate;
    const total = vatBase + vatAmount + dunningFee;
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

export async function generateOfferPdf(offer: OfferDto, options?: InvoiceOptions): Promise<void> {
    const pdf = createA4();
    let y = drawCompanyHeader(pdf);
    y = drawCustomerBlock(pdf, offer, y);
    y = drawDocTitle(pdf, offer, y);
    y = drawLineItemsTable(pdf, offer.lines, y);
    y = drawTotals(pdf, offer.lines, y, offer.state, options);
    drawFooter(pdf, offer.state, y);

    const shippingFee = options?.shippingFee ?? 0;
    const vatRate = options?.vatRate ?? 0;
    const subtotal = offer.lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const vatAmount = (subtotal + shippingFee) * vatRate;
    const total = subtotal + shippingFee + vatAmount + (offer.state === 'SECOND_DUNNING_NOTICE' ? 30 : 0);
    if (QR_STATES.includes(offer.state)) {
        await addQRBill(pdf, offer, total);
    }

    const docName = OFFER_STATE_META[offer.state].doc.replace('.pdf', '');
    const customerSlug = offer.customer.name.replace(/[^a-zA-Z0-9äöüÄÖÜ]+/g, '-').replace(/^-|-$/g, '');
    const dateStr = new Date().toISOString().slice(0, 10);
    pdf.save(`${docName}-${offer.number}-${customerSlug}-${dateStr}.pdf`);
}
