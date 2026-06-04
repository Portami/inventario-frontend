import type {BackendOfferState, LineItemDto, LineItemKind, OfferState} from '@/types/offerte';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import type {SvgIconProps} from '@mui/material';
import type {ComponentType} from 'react';

export interface OfferStateMeta {
    label: string;
    doc: string;
    color: string;
    bg: string;
    Icon: ComponentType<SvgIconProps>;
}

export const OFFER_STATE_META: Record<OfferState, OfferStateMeta> = {
    OFFER: {label: 'Offerte', doc: 'Offerte.pdf', color: '#7a4ec9', bg: '#7a4ec914', Icon: DescriptionOutlinedIcon},
    ORDER_CONFIRMATION: {
        label: 'Auftragsbestätigung',
        doc: 'Auftragsbestätigung.pdf',
        color: '#0288d1',
        bg: '#0288d114',
        Icon: AssignmentTurnedInOutlinedIcon,
    },
    INVOICE: {label: 'Rechnung', doc: 'Rechnung.pdf', color: '#1565c0', bg: '#1565c014', Icon: ReceiptLongOutlinedIcon},
    PAYMENT_REMINDER: {label: 'Zahlungserinnerung', doc: 'Zahlungserinnerung.pdf', color: '#f57c00', bg: '#f57c0014', Icon: MailOutlinedIcon},
    FIRST_DUNNING_NOTICE: {label: 'Mahnung 1', doc: 'Mahnung 1.pdf', color: '#e64a19', bg: '#e64a1914', Icon: WarningAmberOutlinedIcon},
    SECOND_DUNNING_NOTICE: {label: 'Mahnung 2', doc: 'Mahnung 2.pdf', color: '#c62828', bg: '#c6282814', Icon: ReportProblemOutlinedIcon},
    COMPLETED: {label: 'Bezahlt', doc: 'Rechnung.pdf', color: '#2e7d32', bg: '#2e7d3214', Icon: CheckCircleOutlinedIcon},
    CANCELLED: {label: 'Absage', doc: 'Offerte.pdf', color: '#9E9E9E', bg: '#9E9E9E14', Icon: CancelOutlinedIcon},
    NO_RESPONSE: {label: 'Keine Rückmeldung', doc: 'Offerte.pdf', color: '#EF6C00', bg: '#EF6C0014', Icon: HelpOutlineIcon},
};

export const OFFER_STATE = {
    OFFER: 'OFFER',
    ORDER_CONFIRMATION: 'ORDER_CONFIRMATION',
    INVOICE: 'INVOICE',
    PAYMENT_REMINDER: 'PAYMENT_REMINDER',
    FIRST_DUNNING_NOTICE: 'FIRST_DUNNING_NOTICE',
    SECOND_DUNNING_NOTICE: 'SECOND_DUNNING_NOTICE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_RESPONSE: 'NO_RESPONSE',
} as const;

/** Terminal "close" states reachable from OFFER only — not part of the standard forward flow. */
export const OFFER_CLOSE_STATES: OfferState[] = ['CANCELLED', 'NO_RESPONSE'];

export const LINE_KIND = {
    RESTSTUECK: 'RESTSTUECK',
    ROLLE: 'ROLLE',
    PRODUKT: 'PRODUKT',
} as const;

export const RESERVATION_KIND = {
    RESERVED: 'RESERVED',
    TAGGED: 'TAGGED',
} as const;

export const OFFER_PATH_A: OfferState[] = [
    OFFER_STATE.OFFER,
    OFFER_STATE.ORDER_CONFIRMATION,
    OFFER_STATE.INVOICE,
    OFFER_STATE.PAYMENT_REMINDER,
    OFFER_STATE.FIRST_DUNNING_NOTICE,
    OFFER_STATE.SECOND_DUNNING_NOTICE,
    OFFER_STATE.COMPLETED,
];

export const OFFER_PATH_B: OfferState[] = [
    OFFER_STATE.OFFER,
    OFFER_STATE.INVOICE,
    OFFER_STATE.PAYMENT_REMINDER,
    OFFER_STATE.FIRST_DUNNING_NOTICE,
    OFFER_STATE.SECOND_DUNNING_NOTICE,
    OFFER_STATE.COMPLETED,
];

/** Valid forward transitions from each state. */
export const OFFER_TRANSITIONS: Record<OfferState, OfferState[]> = {
    OFFER: ['ORDER_CONFIRMATION', 'INVOICE'],
    ORDER_CONFIRMATION: ['INVOICE'],
    INVOICE: ['PAYMENT_REMINDER', 'COMPLETED'],
    PAYMENT_REMINDER: ['FIRST_DUNNING_NOTICE', 'COMPLETED'],
    FIRST_DUNNING_NOTICE: ['SECOND_DUNNING_NOTICE', 'COMPLETED'],
    SECOND_DUNNING_NOTICE: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
    NO_RESPONSE: [],
};

/**
 * Compute the most likely path taken to reach `state`, using the short canonical
 * path (skipping ORDER_CONFIRMATION). Used as initial value on fresh page load.
 */
export function computeInitialPath(state: OfferState): OfferState[] {
    const short: OfferState[] = ['OFFER', 'INVOICE', 'PAYMENT_REMINDER', 'FIRST_DUNNING_NOTICE', 'SECOND_DUNNING_NOTICE', 'COMPLETED'];
    const idx = short.indexOf(state);
    if (idx >= 0) return short.slice(0, idx + 1);
    if (state === 'ORDER_CONFIRMATION') return ['OFFER', 'ORDER_CONFIRMATION'];
    if (state === 'CANCELLED') return ['OFFER', 'CANCELLED'];
    if (state === 'NO_RESPONSE') return ['OFFER', 'NO_RESPONSE'];
    return [state];
}

export const VAT_RATE = 0.081;
export const CUT_SURCHARGE_DEFAULT = 12;
export const RESERVATION_DAYS = 10;
export const PAGE_SIZE = 10;

export const KIND_CHIP_STYLES: Record<LineItemKind, {label: string; color: string; bg: string}> = {
    RESTSTUECK: {label: 'Reststück', color: '#7a4ec9', bg: '#7a4ec914'},
    ROLLE: {label: 'Rolle', color: '#1565c0', bg: '#1565c014'},
    PRODUKT: {label: 'Produkt', color: '#2e7d32', bg: '#2e7d3214'},
};

export const ALL_BACKEND_STATES: BackendOfferState[] = [
    'OFFER',
    'ORDER_CONFIRMATION',
    'INVOICE',
    'PAYMENT_REMINDER',
    'FIRST_DUNNING_NOTICE',
    'SECOND_DUNNING_NOTICE',
    'COMPLETED',
    'CANCELLED',
    'NO_RESPONSE',
];

/** Formats a number as a Swiss franc currency string (e.g. "CHF 1'234.50"). */
export const fmtCHF = (n: number): string => new Intl.NumberFormat('de-CH', {style: 'currency', currency: 'CHF', minimumFractionDigits: 2}).format(n);

/** Formats a number with Swiss locale grouping and a configurable number of decimal places. */
export const fmtNum = (n: number, d = 2): string => new Intl.NumberFormat('de-CH', {minimumFractionDigits: d, maximumFractionDigits: d}).format(n);

/** Formats an ISO date string (YYYY-MM-DD) as a Swiss locale date (DD.MM.YYYY). */
export const fmtDate = (iso: string): string => new Date(iso + 'T00:00:00').toLocaleDateString('de-CH', {year: 'numeric', month: '2-digit', day: '2-digit'});

/** Returns the number of days between an ISO date and today. Negative means the date is in the past. */
export const daysFromNow = (iso: string): number => Math.round((new Date(iso + 'T00:00:00').getTime() - Date.now()) / 86400000);

/** Computes the net subtotal for a single line item: (price + cut surcharge) × quantity + extras - discount. */
export const lineSubtotal = (l: LineItemDto): number => l.pricePerUnit * l.quantity + l.cutSurcharge * l.quantity + l.extras - l.discount;
