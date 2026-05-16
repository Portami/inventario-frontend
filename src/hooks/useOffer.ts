import {useToast} from '@/components/ToastProvider';
import {CUT_SURCHARGE_DEFAULT, LINE_KIND, OFFER_STATE_META, RESERVATION_KIND} from '@/pages/constants/offerConstants';
import {
    addOfferLine,
    changeOfferState,
    deleteOfferLine,
    fetchFeltCatalog,
    fetchOffer,
    fetchProductCatalog,
    updateCustomer,
    updateOfferDueDate,
} from '@/services/backend';
import {CustomerDto, FeltCatalogItem, LineItemDto, OfferDto, OfferState, ProductCatalogItem} from '@/types/offerte';
import {toErrorMessage} from '@/utils/pageUtils';
import {useCallback, useEffect, useState} from 'react';

export interface UseOfferReturn {
    offer: OfferDto | null;
    feltCatalog: FeltCatalogItem[];
    productCatalog: ProductCatalogItem[];
    loading: boolean;
    error: string;
    patchLine: (lineId: string, changes: Partial<LineItemDto>) => void;
    deleteLine: (lineId: string) => void;
    addFeltLine: (felt: FeltCatalogItem) => Promise<void>;
    addProductLine: (p: ProductCatalogItem) => Promise<void>;
    changeState: (key: OfferState) => void;
    regenDoc: (doc: string) => void;
    editCustomer: (changes: Partial<CustomerDto>) => Promise<void>;
    editDueDate: (dueISO: string) => Promise<void>;
}

export function useOffer(id: string | undefined): UseOfferReturn {
    const showToast = useToast();
    const [offer, setOffer] = useState<OfferDto | null>(null);
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
                setFeltCatalog(feltData);
                setProductCatalog(productData);
                setError('');
            })
            .catch((err) => setError(toErrorMessage(err, 'Offerte konnte nicht geladen werden')))
            .finally(() => setLoading(false));
    }, [id]);

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
            setOffer((o) => (o ? {...o, state: key} : o));
            if (id) void changeOfferState(id, key);
            showToast(`Status auf »${OFFER_STATE_META[key].label}« gesetzt`, 'info');
        },
        [id, showToast],
    );

    const regenDoc = useCallback(
        (doc: string) => {
            showToast(`${doc} neu generiert`);
            // TODO: POST /offers/{id}/documents/regenerate
        },
        [showToast],
    );

    const editCustomer = useCallback(
        async (changes: Partial<CustomerDto>) => {
            if (!offer) return;
            const customerId = offer.customer.customerNumber;
            const updated = await updateCustomer(customerId, changes);
            setOffer((o) =>
                o
                    ? {
                          ...o,
                          customer: {
                              customerNumber: updated.customerNumber,
                              name: updated.name,
                              contactPerson: updated.contactPerson,
                              email: updated.email,
                              phone: updated.phone,
                              street: updated.street,
                              zip: updated.zip,
                              city: updated.city,
                              country: updated.country,
                              vatNumber: updated.vatNumber,
                          },
                      }
                    : o,
            );
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

    return {
        offer,
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
    };
}
