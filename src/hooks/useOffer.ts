import {useToast} from '@/components/ToastProvider';
import {CUT_SURCHARGE_DEFAULT, LINE_KIND, OFFER_STATE_META, RESERVATION_KIND} from '@/pages/constants/offerConstants';
import {
    addOfferLine,
    changeOfferState,
    deleteOfferLine,
    fetchFeltCatalog,
    fetchOffer,
    fetchProductCatalog,
    markOfferSent,
    updateCustomer,
    updateOfferDueDate,
} from '@/services/backend';
import {generateOfferPdf, InvoiceOptions} from '@/services/invoicePdfService';
import {CustomerDto, FeltCatalogItem, LineItemDto, OfferDto, OfferState, ProductCatalogItem} from '@/types/offerte';
import {toErrorMessage} from '@/utils/pageUtils';
import {useCallback, useEffect, useState} from 'react';

/** All state and actions exposed by the useOffer hook for the offer detail page. */
export interface UseOfferReturn {
    /** The current offer, with path kept in sync with navigation history, or null while loading. */
    offer: OfferDto | null;
    /** The state immediately before the current one, used to render a "go back" button. */
    prevState: OfferState | null;
    feltCatalog: FeltCatalogItem[];
    productCatalog: ProductCatalogItem[];
    loading: boolean;
    error: string;
    /** Optimistically updates a line item by deleting and re-adding it via the API. Rolls back on failure. */
    patchLine: (lineId: string, changes: Partial<LineItemDto>) => void;
    deleteLine: (lineId: string) => void;
    addFeltLine: (felt: FeltCatalogItem) => Promise<void>;
    addProductLine: (p: ProductCatalogItem) => Promise<void>;
    /** Advances or rewinds the state, updates the local path history, and persists the change to the backend. */
    changeState: (key: OfferState) => void;
    /** Triggers PDF generation for the current offer state and document type. */
    regenDoc: (doc: string, options?: InvoiceOptions) => void;
    editCustomer: (changes: Partial<CustomerDto>) => Promise<void>;
    editDueDate: (dueISO: string) => Promise<void>;
    toggleSent: () => void;
}

/**
 * Manages all data and mutations for the offer detail view.
 * Loads the offer, felt catalog, and product catalog in parallel on mount.
 * Keeps a local state path so the stepper reflects the actual navigation taken, not just the current state.
 */
export function useOffer(id: string | undefined): UseOfferReturn {
    const showToast = useToast();
    const [offer, setOffer] = useState<OfferDto | null>(null);
    const [statePath, setStatePath] = useState<OfferState[]>([]);
    const [feltCatalog, setFeltCatalog] = useState<FeltCatalogItem[]>([]);
    const [productCatalog, setProductCatalog] = useState<ProductCatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([fetchOffer(id), fetchFeltCatalog(), fetchProductCatalog()])
            .then(([offerData, feltData, productData]) => {
                setOffer(offerData);
                setStatePath(offerData.path); // path = computeInitialPath(state)
                setFeltCatalog(feltData);
                setProductCatalog(productData);
                setError('');
            })
            .catch((err) => setError(toErrorMessage(err, 'Offerte konnte nicht geladen werden')))
            .finally(() => setLoading(false));
    }, [id]);

    const prevState = statePath.length > 1 ? statePath[statePath.length - 2] : null;

    const patchLine = useCallback(
        (lineId: string, changes: Partial<LineItemDto>) => {
            if (!id) return;
            const originalLine = offer?.lines.find((l) => l.id === lineId);
            if (!originalLine?.variantId) return;

            setOffer((o) => (o ? {...o, lines: o.lines.map((l) => (l.id === lineId ? {...l, ...changes} : l))} : o));

            const variantId = originalLine.variantId;
            const updated: Omit<LineItemDto, 'id'> = {...originalLine, ...changes};

            void (async () => {
                try {
                    await deleteOfferLine(id, lineId);
                    const newLine = await addOfferLine(id, variantId, updated);
                    setOffer((o) => (o ? {...o, lines: o.lines.map((l) => (l.id === lineId ? newLine : l))} : o));
                } catch {
                    setOffer((o) => (o ? {...o, lines: o.lines.map((l) => (l.id === lineId ? originalLine : l))} : o));
                    showToast('Position konnte nicht aktualisiert werden', 'error');
                }
            })();
        },
        [id, offer, showToast],
    );

    const deleteLine = useCallback(
        (lineId: string) => {
            setOffer((o) => (o ? {...o, lines: o.lines.filter((l) => l.id !== lineId)} : o));
            if (id) void deleteOfferLine(id, lineId);
        },
        [id],
    );

    const addFeltLine = useCallback(
        async (felt: FeltCatalogItem) => {
            if (!id) return;
            const line: Omit<LineItemDto, 'id'> = {
                kind: LINE_KIND.ROLLE,
                articleNumber: felt.articleNumber,
                feltTypeName: felt.feltTypeName,
                color: felt.color,
                description: `Zuschnitt aus Rolle · 1.00 × 1.00 m · ${felt.thickness} mm`,
                quantity: 1,
                unit: 'Stk.',
                pricePerUnit: felt.pricePerSqm,
                cutSurcharge: CUT_SURCHARGE_DEFAULT,
                extras: 0,
                discount: 0,
                reservation: {kind: RESERVATION_KIND.TAGGED, sourceLabel: 'Rolle (auto)'},
            };
            try {
                const newLine = await addOfferLine(id, felt.id, line);
                setOffer((o) => (o ? {...o, lines: [...o.lines, newLine]} : o));
                showToast(`${felt.feltTypeName} · ${felt.color} hinzugefügt`);
            } catch {
                showToast('Position konnte nicht hinzugefügt werden', 'error');
            }
        },
        [id, showToast],
    );

    const addProductLine = useCallback(
        async (p: ProductCatalogItem) => {
            if (!id) return;
            const line: Omit<LineItemDto, 'id'> = {
                kind: LINE_KIND.PRODUKT,
                articleNumber: p.articleNumber,
                feltTypeName: p.name,
                color: null,
                description: p.name,
                quantity: 1,
                unit: 'Stk.',
                pricePerUnit: p.price,
                cutSurcharge: 0,
                extras: 0,
                discount: 0,
                reservation: null,
            };
            try {
                const newLine = await addOfferLine(id, p.id, line);
                setOffer((o) => (o ? {...o, lines: [...o.lines, newLine]} : o));
                showToast(`${p.name} hinzugefügt`);
            } catch {
                showToast('Position konnte nicht hinzugefügt werden', 'error');
            }
        },
        [id, showToast],
    );

    const changeState = useCallback(
        (key: OfferState) => {
            setStatePath((prev) => {
                // Going back: truncate to the target state
                const existingIdx = prev.indexOf(key);
                if (existingIdx >= 0) return prev.slice(0, existingIdx + 1);
                // Going forward: append
                return [...prev, key];
            });
            setOffer((o) => (o ? {...o, state: key, offerSent: false} : o));
            if (id) void changeOfferState(id, key);
            showToast(`Status auf »${OFFER_STATE_META[key].label}« gesetzt`, 'info');
        },
        [id, showToast],
    );

    const regenDoc = useCallback(
        (doc: string, options?: InvoiceOptions) => {
            if (!offer) return;
            void generateOfferPdf(offer, options).catch((err: unknown) => {
                console.error('[PDF] generation failed:', err);
                showToast(`${doc} konnte nicht generiert werden`, 'error');
            });
        },
        [offer, showToast],
    );

    const editCustomer = useCallback(
        async (changes: Partial<CustomerDto>) => {
            if (!offer) return;
            const updated = await updateCustomer(offer.customer.customerNumber, changes);
            setOffer((o) => (o ? {...o, customer: updated} : o));
            showToast('Kundendaten gespeichert');
        },
        [offer, showToast],
    );

    const editDueDate = useCallback(
        async (dueISO: string) => {
            if (!id) return;
            const prev = offer?.dueISO;
            setOffer((o) => (o ? {...o, dueISO} : o));
            try {
                await updateOfferDueDate(id, dueISO);
            } catch {
                setOffer((o) => (o ? {...o, dueISO: prev} : o));
                showToast('Fälligkeitsdatum konnte nicht gespeichert werden', 'error');
            }
        },
        [id, offer, showToast],
    );

    const toggleSent = useCallback(() => {
        if (!id || !offer) return;
        const next = !offer.offerSent;
        setOffer((o) => (o ? {...o, offerSent: next} : o));
        void markOfferSent(id, next).catch(() => {
            setOffer((o) => (o ? {...o, offerSent: !next} : o));
            showToast('Konnte nicht gespeichert werden', 'error');
        });
    }, [id, offer, showToast]);

    // Keep offer.path in sync with statePath so the stepper shows the actual path taken
    const offerWithPath = offer ? {...offer, path: statePath} : null;

    return {
        offer: offerWithPath,
        prevState,
        feltCatalog,
        productCatalog,
        loading,
        error,
        patchLine,
        deleteLine,
        addFeltLine,
        addProductLine,
        changeState,
        regenDoc,
        editCustomer,
        editDueDate,
        toggleSent,
    };
}
