import CustomerCard from '@/components/offers/CustomerCard';
import EditCustomerDialog from '@/components/offers/EditCustomerDialog';
import FeltSearchDialog from '@/components/offers/FeltSearchDialog';
import HistoryPanel from '@/components/offers/HistoryPanel';
import LineItemsTable from '@/components/offers/LineItemsTable';
import OfferHeader from '@/components/offers/OfferHeader';
import ProductSearchDialog from '@/components/offers/ProductSearchDialog';
import ReservationPanel from '@/components/offers/ReservationPanel';
import TotalsCard from '@/components/offers/TotalsCard';
import {useOffer} from '@/hooks/useOffer';
import {OFFER_STATE} from '@/pages/constants/offerConstants';
import {FeltCatalogItem, ProductCatalogItem} from '@/types/offerte';
import {Box, CircularProgress, Typography} from '@mui/material';
import {useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function OfferDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [feltDlgOpen, setFeltDlgOpen] = useState(false);
    const [productDlgOpen, setProductDlgOpen] = useState(false);
    const [editCustomerOpen, setEditCustomerOpen] = useState(false);

    const {
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

    const editableStates = [OFFER_STATE.OFFER, OFFER_STATE.ORDER_CONFIRMATION, OFFER_STATE.INVOICE];
    const linesLocked = !editableStates.includes(offer.state);

    return (
        <Box sx={{py: 4}}>
            <OfferHeader offer={offer} onChangeState={changeState} onRegen={regenDoc} onBack={() => navigate('/offers')} onEditDueDate={editDueDate} />

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
                    <HistoryPanel history={offer.history} />
                </Box>
            </Box>

            <FeltSearchDialog open={feltDlgOpen} catalog={feltCatalog} onClose={() => setFeltDlgOpen(false)} onPick={handleAddFelt} />
            <ProductSearchDialog open={productDlgOpen} catalog={productCatalog} onClose={() => setProductDlgOpen(false)} onPick={handleAddProduct} />
            {offer && <EditCustomerDialog open={editCustomerOpen} customer={offer.customer} onClose={() => setEditCustomerOpen(false)} onSave={editCustomer} />}
        </Box>
    );
}
