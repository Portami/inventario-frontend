import CustomerCard from '@/components/offers/CustomerCard';
import EditCustomerDialog from '@/components/offers/EditCustomerDialog';
import FeltSearchDialog from '@/components/offers/FeltSearchDialog';
import InvoiceDocumentPreview from '@/components/offers/InvoiceDocumentPreview';
import InvoicePreviewCard from '@/components/offers/InvoicePreviewCard';
import LineItemsTable from '@/components/offers/LineItemsTable';
import OfferHeader from '@/components/offers/OfferHeader';
import ProductSearchDialog from '@/components/offers/ProductSearchDialog';
import ReservationPanel from '@/components/offers/ReservationPanel';
import TotalsCard from '@/components/offers/TotalsCard';
import {useOffer} from '@/hooks/useOffer';
import {OFFER_STATE, OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {FeltCatalogItem, OfferState, ProductCatalogItem} from '@/types/offerte';
import {Box, CircularProgress, Typography} from '@mui/material';
import {useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function OfferDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [feltDlgOpen, setFeltDlgOpen] = useState(false);
    const [productDlgOpen, setProductDlgOpen] = useState(false);
    const [editCustomerOpen, setEditCustomerOpen] = useState(false);
    const [liefergebuehren, setLiefergebuehren] = useState(0);
    const [vatPct, setVatPct] = useState(0);

    const {
        offer,
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
    } = useOffer(id);

    const handleAddFelt = async (felt: FeltCatalogItem) => {
        await addFeltLine(felt);
        setFeltDlgOpen(false);
    };

    const handleAddProduct = async (p: ProductCatalogItem) => {
        await addProductLine(p);
        setProductDlgOpen(false);
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12}}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{py: 8, textAlign: 'center'}}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!offer) return null;

    const isInvoice = offer.state === OFFER_STATE.INVOICE;
    const editableStates: OfferState[] = [OFFER_STATE.OFFER, OFFER_STATE.ORDER_CONFIRMATION, OFFER_STATE.INVOICE];
    const linesLocked = !editableStates.includes(offer.state);

    return (
        <Box sx={{py: 4}}>
            <OfferHeader
                offer={offer}
                prevState={prevState}
                onChangeState={changeState}
                onRegen={isInvoice ? undefined : regenDoc}
                onBack={() => navigate('/offers')}
                onEditDueDate={editDueDate}
                onToggleSent={toggleSent}
            />

            {isInvoice ? (
                /* Invoice state: document preview as main content */
                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 360px', gap: 3, alignItems: 'start'}}>
                    <InvoiceDocumentPreview offer={offer} liefergebuehren={liefergebuehren} vatRate={vatPct / 100} />
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 88}}>
                        <InvoicePreviewCard
                            lines={offer.lines}
                            liefergebuehren={liefergebuehren}
                            vatPct={vatPct}
                            onLiefergebuehrenChange={setLiefergebuehren}
                            onVatPctChange={setVatPct}
                            onGeneratePdf={() => regenDoc(OFFER_STATE_META.INVOICE.doc, {liefergebuehren, vatRate: vatPct / 100})}
                        />
                        <ReservationPanel lines={offer.lines} />
                    </Box>
                </Box>
            ) : (
                /* All other states: normal layout */
                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 360px', gap: 3, alignItems: 'start'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0}}>
                        <CustomerCard customer={offer.customer} onEdit={() => setEditCustomerOpen(true)} />
                        <LineItemsTable
                            lines={offer.lines}
                            onPatch={patchLine}
                            onDelete={deleteLine}
                            onAddFelt={() => setFeltDlgOpen(true)}
                            onAddProduct={() => setProductDlgOpen(true)}
                            locked={linesLocked}
                        />
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 88}}>
                        <TotalsCard lines={offer.lines} />
                        <ReservationPanel lines={offer.lines} />
                    </Box>
                </Box>
            )}

            <FeltSearchDialog open={feltDlgOpen} catalog={feltCatalog} onClose={() => setFeltDlgOpen(false)} onPick={handleAddFelt} />
            <ProductSearchDialog open={productDlgOpen} catalog={productCatalog} onClose={() => setProductDlgOpen(false)} onPick={handleAddProduct} />
            {offer && <EditCustomerDialog open={editCustomerOpen} customer={offer.customer} onClose={() => setEditCustomerOpen(false)} onSave={editCustomer} />}
        </Box>
    );
}
