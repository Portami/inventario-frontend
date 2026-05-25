import CustomerCard from '@/components/offers/CustomerCard';
import CustomerCompactCard from '@/components/offers/CustomerCompactCard';
import CutAssistantDialog from '@/components/offers/CutAssistantDialog';
import DunningDocumentPreview from '@/components/offers/DunningDocumentPreview';
import DunningSidebarCard from '@/components/offers/DunningSidebarCard';
import EditCustomerDialog from '@/components/offers/EditCustomerDialog';
import FeltSearchDialog from '@/components/offers/FeltSearchDialog';
import InvoiceDocumentPreview from '@/components/offers/InvoiceDocumentPreview';
import InvoicePreviewCard from '@/components/offers/InvoicePreviewCard';
import LineItemsTable from '@/components/offers/LineItemsTable';
import OfferHeader from '@/components/offers/OfferHeader';
import OrderConfirmationSummaryCard from '@/components/offers/OrderConfirmationSummaryCard';
import PaymentSummaryCard from '@/components/offers/PaymentSummaryCard';
import ProductSearchDialog from '@/components/offers/ProductSearchDialog';
import ReservationPanel from '@/components/offers/ReservationPanel';
import TotalsCard from '@/components/offers/TotalsCard';
import {useOffer} from '@/hooks/useOffer';
import {OFFER_STATE, OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {FeltCatalogItem, ProductCatalogItem} from '@/types/offerte';
import {Box, CircularProgress, Typography} from '@mui/material';
import {ReactNode, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

/**
 * Detail view for a single offer. Renders a state-specific layout:
 * editable line items for the OFFER state, document previews for INVOICE and dunning states,
 * and summary cards for ORDER_CONFIRMATION and COMPLETED.
 */
export default function OfferDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [feltDlgOpen, setFeltDlgOpen] = useState(false);
    const [productDlgOpen, setProductDlgOpen] = useState(false);
    const [cutAssistantOpen, setCutAssistantOpen] = useState(false);
    const [editCustomerOpen, setEditCustomerOpen] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);
    const [vatPct, setVatPct] = useState(0);

    const {
        offer,
        prevState,
        feltCatalog,
        productCatalog,
        loading,
        error,
        refetch,
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
    const isOrderConfirmation = offer.state === OFFER_STATE.ORDER_CONFIRMATION;
    const isDunning =
        offer.state === OFFER_STATE.PAYMENT_REMINDER || offer.state === OFFER_STATE.FIRST_DUNNING_NOTICE || offer.state === OFFER_STATE.SECOND_DUNNING_NOTICE;
    const isCompleted = offer.state === OFFER_STATE.COMPLETED;

    const SIDEBAR_GRID = {display: 'grid', gridTemplateColumns: '1fr 360px', gap: 3, alignItems: 'start'} as const;
    const SIDEBAR_COL = {display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 88} as const;

    let mainLayout: ReactNode;

    if (isInvoice) {
        mainLayout = (
            <Box sx={SIDEBAR_GRID}>
                <InvoiceDocumentPreview offer={offer} shippingFee={shippingFee} vatRate={vatPct / 100} />
                <Box sx={SIDEBAR_COL}>
                    <CustomerCompactCard customer={offer.customer} onEdit={() => setEditCustomerOpen(true)} />
                    <InvoicePreviewCard
                        lines={offer.lines}
                        shippingFee={shippingFee}
                        vatPct={vatPct}
                        onShippingFeeChange={setShippingFee}
                        onVatPctChange={setVatPct}
                        onGeneratePdf={() => regenDoc(OFFER_STATE_META.INVOICE.doc, {shippingFee, vatRate: vatPct / 100})}
                    />
                    <ReservationPanel lines={offer.lines} />
                </Box>
            </Box>
        );
    } else if (isOrderConfirmation) {
        mainLayout = (
            <Box sx={SIDEBAR_GRID}>
                <OrderConfirmationSummaryCard offer={offer} />
                <Box sx={SIDEBAR_COL}>
                    <CustomerCompactCard customer={offer.customer} onEdit={() => setEditCustomerOpen(true)} />
                    <TotalsCard lines={offer.lines} />
                    <ReservationPanel lines={offer.lines} />
                </Box>
            </Box>
        );
    } else if (isDunning) {
        const dunningState = offer.state as 'PAYMENT_REMINDER' | 'FIRST_DUNNING_NOTICE' | 'SECOND_DUNNING_NOTICE';
        mainLayout = (
            <Box sx={SIDEBAR_GRID}>
                <DunningDocumentPreview offer={offer} state={dunningState} />
                <Box sx={SIDEBAR_COL}>
                    <CustomerCompactCard customer={offer.customer} onEdit={() => setEditCustomerOpen(true)} />
                    <DunningSidebarCard offer={offer} state={dunningState} onGeneratePdf={() => regenDoc(OFFER_STATE_META[dunningState].doc)} />
                    <ReservationPanel lines={offer.lines} />
                </Box>
            </Box>
        );
    } else if (isCompleted) {
        mainLayout = (
            <Box sx={SIDEBAR_GRID}>
                <PaymentSummaryCard offer={offer} />
                <Box sx={SIDEBAR_COL}>
                    <CustomerCompactCard customer={offer.customer} onEdit={() => setEditCustomerOpen(true)} />
                    <TotalsCard lines={offer.lines} />
                    <ReservationPanel lines={offer.lines} />
                </Box>
            </Box>
        );
    } else {
        /* OFFER state: editable standard layout */
        mainLayout = (
            <Box sx={SIDEBAR_GRID}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0}}>
                    <CustomerCard customer={offer.customer} onEdit={() => setEditCustomerOpen(true)} />
                    <LineItemsTable
                        lines={offer.lines}
                        onPatch={patchLine}
                        onDelete={deleteLine}
                        onAddFelt={() => setFeltDlgOpen(true)}
                        onAddProduct={() => setProductDlgOpen(true)}
                        onOpenCutAssistant={() => setCutAssistantOpen(true)}
                        locked={false}
                    />
                </Box>
                <Box sx={SIDEBAR_COL}>
                    <TotalsCard lines={offer.lines} />
                    <ReservationPanel lines={offer.lines} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{py: 4}}>
            <OfferHeader
                offer={offer}
                prevState={prevState}
                onChangeState={changeState}
                onRegen={isInvoice || isDunning ? undefined : regenDoc}
                onBack={() => navigate('/offers')}
                onEditDueDate={editDueDate}
                onToggleSent={toggleSent}
            />

            {mainLayout}

            <FeltSearchDialog open={feltDlgOpen} catalog={feltCatalog} onClose={() => setFeltDlgOpen(false)} onPick={handleAddFelt} />
            <ProductSearchDialog open={productDlgOpen} catalog={productCatalog} onClose={() => setProductDlgOpen(false)} onPick={handleAddProduct} />
            <CutAssistantDialog 
                open={cutAssistantOpen} 
                onClose={() => setCutAssistantOpen(false)} 
                offerId={offer.id} 
                onAccepted={() => {
                    setCutAssistantOpen(false);
                    refetch();
                }}
            />
            {offer && <EditCustomerDialog open={editCustomerOpen} customer={offer.customer} onClose={() => setEditCustomerOpen(false)} onSave={editCustomer} />}
        </Box>
    );
}
