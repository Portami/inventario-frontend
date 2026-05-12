import FeltSearchDialog from '@/components/offers/FeltSearchDialog';
import KindChip from '@/components/offers/KindChip';
import ProductSearchDialog from '@/components/offers/ProductSearchDialog';
import {useToast} from '@/components/ToastProvider';
import {CUT_SURCHARGE_DEFAULT, LINE_KIND, RESERVATION_KIND} from '@/pages/constants/offerConstants';
import {createOffer, fetchCustomers, fetchFeltCatalog, fetchProductCatalog} from '@/services/backend';
import {BackendCreateOfferItemDto, CustomerWithIdDto, FeltCatalogItem, LineItemDto, ProductCatalogItem} from '@/types/offerte';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Step,
    StepLabel,
    Stepper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: (offerId: string) => void;
}

type CustomerMode = 'existing' | 'new';
type StagedLine = Omit<LineItemDto, 'id'> & {productVariantId: number; stageKey: string};

type NewCustomerForm = {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    street: string;
    zip: string;
    city: string;
    country: string;
    vatNumber: string;
};

const emptyCustomer: NewCustomerForm = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    street: '',
    zip: '',
    city: '',
    country: 'Schweiz',
    vatNumber: '',
};

const labelSx = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

interface CustomerInputProps {
    mode: CustomerMode;
    customers: CustomerWithIdDto[];
    selected: CustomerWithIdDto | null;
    onSelect: (c: CustomerWithIdDto | null) => void;
    form: NewCustomerForm;
    setField: (f: keyof NewCustomerForm) => (e: ChangeEvent<HTMLInputElement>) => void;
}

function CustomerInput({mode, customers, selected, onSelect, form, setField}: CustomerInputProps) {
    if (mode === 'existing') {
        return (
            <Autocomplete
                options={customers}
                getOptionLabel={(c) => `${c.name} · ${c.customerNumber}`}
                value={selected}
                onChange={(_, v) => onSelect(v)}
                renderInput={(params) => (
                    <TextField {...params} label="Kunde suchen" size="small" placeholder="Name oder Kundennummer …" slotProps={{inputLabel: {shrink: true}}} />
                )}
            />
        );
    }
    return (
        <Grid container spacing={2.5}>
            <Grid size={6}>
                <TextField label="Firmenname" value={form.name} onChange={setField('name')} size="small" fullWidth required slotProps={{inputLabel: labelSx}} />
            </Grid>
            <Grid size={6}>
                <TextField label="Ansprechperson" value={form.contactPerson} onChange={setField('contactPerson')} size="small" fullWidth required slotProps={{inputLabel: labelSx}} />
            </Grid>
            <Grid size={6}>
                <TextField label="E-Mail" value={form.email} onChange={setField('email')} type="email" size="small" fullWidth required slotProps={{inputLabel: labelSx}} />
            </Grid>
            <Grid size={6}>
                <TextField label="Telefon" value={form.phone} onChange={setField('phone')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
            </Grid>
            <Grid size={8}>
                <TextField label="Strasse" value={form.street} onChange={setField('street')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
            </Grid>
            <Grid size={4}>
                <TextField label="PLZ" value={form.zip} onChange={setField('zip')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
            </Grid>
            <Grid size={6}>
                <TextField label="Ort" value={form.city} onChange={setField('city')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
            </Grid>
            <Grid size={6}>
                <TextField label="Land" value={form.country} onChange={setField('country')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
            </Grid>
            <Grid size={6}>
                <TextField label="MWST-Nr." value={form.vatNumber} onChange={setField('vatNumber')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
            </Grid>
        </Grid>
    );
}

export default function CreateOfferDialog({open, onClose, onCreated}: Props) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const showToast = useToast();

    const [step, setStep] = useState(0);
    const [customerMode, setCustomerMode] = useState<CustomerMode>('existing');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithIdDto | null>(null);
    const [newCustomer, setNewCustomer] = useState<NewCustomerForm>(emptyCustomer);
    const [path, setPath] = useState<'A' | 'B'>('A');

    const [stagedLines, setStagedLines] = useState<StagedLine[]>([]);
    const [feltDlgOpen, setFeltDlgOpen] = useState(false);
    const [productDlgOpen, setProductDlgOpen] = useState(false);

    const [customers, setCustomers] = useState<CustomerWithIdDto[]>([]);
    const [feltCatalog, setFeltCatalog] = useState<FeltCatalogItem[]>([]);
    const [productCatalog, setProductCatalog] = useState<ProductCatalogItem[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setStep(0);
        setCustomerMode('existing');
        setSelectedCustomer(null);
        setNewCustomer(emptyCustomer);
        setPath('A');
        setStagedLines([]);

        setLoadingData(true);
        Promise.all([fetchCustomers(), fetchFeltCatalog(), fetchProductCatalog()])
            .then(([c, f, p]) => {
                setCustomers(c);
                setFeltCatalog(f);
                setProductCatalog(p);
            })
            .catch(() => showToast('Daten konnten nicht geladen werden', 'error'))
            .finally(() => setLoadingData(false));
    }, [open, showToast]);

    const canProceed =
        customerMode === 'existing'
            ? selectedCustomer !== null
            : newCustomer.name.trim() !== '' && newCustomer.contactPerson.trim() !== '' && newCustomer.email.trim() !== '';

    const setField = (f: keyof NewCustomerForm) => (e: ChangeEvent<HTMLInputElement>) => setNewCustomer((prev) => ({...prev, [f]: e.target.value}));

    const handleAddFelt = (felt: FeltCatalogItem) => {
        setStagedLines((prev) => [
            ...prev,
            {
                stageKey: crypto.randomUUID(),
                productVariantId: felt.id,
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
            },
        ]);
        setFeltDlgOpen(false);
        showToast(`${felt.feltTypeName} · ${felt.color} hinzugefügt`);
    };

    const handleAddProduct = (p: ProductCatalogItem) => {
        setStagedLines((prev) => [
            ...prev,
            {
                stageKey: crypto.randomUUID(),
                productVariantId: p.id,
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
            },
        ]);
        setProductDlgOpen(false);
        showToast(`${p.name} hinzugefügt`);
    };

    const handleRemoveLine = (stageKey: string) => {
        setStagedLines((prev) => prev.filter((s) => s.stageKey !== stageKey));
    };

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            const customerName = customerMode === 'existing' ? selectedCustomer!.name : newCustomer.name.trim();
            const backendItems: BackendCreateOfferItemDto[] = stagedLines.map((line) => ({
                productVariantId: line.productVariantId,
                description: line.description || undefined,
                quantity: line.quantity,
                unitPrice: line.pricePerUnit,
            }));
            const offer = await createOffer(customerName, backendItems);
            showToast('Offerte erstellt', 'success');
            onCreated(offer.id);
        } catch {
            showToast('Offerte konnte nicht erstellt werden', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3, pb: 2}}>
                    <Typography variant="h6" sx={{fontWeight: 600}}>
                        Neue Offerte erstellen
                    </Typography>
                    <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Box sx={{px: 4, pb: 2}}>
                    <Stepper activeStep={step} sx={{'& .MuiStepLabel-label': {fontSize: 13}}}>
                        <Step>
                            <StepLabel>Kunde</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Positionen</StepLabel>
                        </Step>
                    </Stepper>
                </Box>

                <Divider />

                <DialogContent sx={{px: 4, py: 3, minHeight: 340}}>
                    {loadingData && (
                        <Box sx={{display: 'flex', justifyContent: 'center', py: 6}}>
                            <CircularProgress size={32} />
                        </Box>
                    )}
                    {!loadingData && step === 0 && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            <Box>
                                <Typography variant="caption" sx={{display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'text.secondary'}}>
                                    Kunde
                                </Typography>
                                <ToggleButtonGroup value={customerMode} exclusive onChange={(_, v: CustomerMode) => v && setCustomerMode(v)} size="small" sx={{mb: 2}}>
                                    <ToggleButton value="existing" sx={{textTransform: 'none', gap: 0.5, px: 2}}>
                                        <BusinessOutlinedIcon sx={{fontSize: 16}} />
                                        Bestehender Kunde
                                    </ToggleButton>
                                    <ToggleButton value="new" sx={{textTransform: 'none', gap: 0.5, px: 2}}>
                                        <PersonAddOutlinedIcon sx={{fontSize: 16}} />
                                        Neuer Kunde
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                <CustomerInput
                                    mode={customerMode}
                                    customers={customers}
                                    selected={selectedCustomer}
                                    onSelect={setSelectedCustomer}
                                    form={newCustomer}
                                    setField={setField}
                                />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'text.secondary'}}>
                                    Offerten-Pfad
                                </Typography>
                                <Box sx={{display: 'flex', gap: 2}}>
                                    {(['A', 'B'] as const).map((p) => (
                                        <Box
                                            key={p}
                                            onClick={() => setPath(p)}
                                            sx={{
                                                flex: 1,
                                                p: 2,
                                                borderRadius: 1.5,
                                                border: `1.5px solid ${path === p ? primary : 'rgba(0,0,0,0.12)'}`,
                                                bgcolor: path === p ? `${primary}08` : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'border-color 0.15s, background-color 0.15s',
                                            }}
                                        >
                                            <Typography sx={{fontWeight: 600, fontSize: 13.5, mb: 0.25}}>Pfad {p}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {p === 'A' ? 'Offerte → Auftragsbestätigung → Rechnung → Bezahlt' : 'Offerte → Rechnung → Bezahlt'}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}
                    {!loadingData && step === 1 && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
                                <Button size="small" variant="outlined" startIcon={<SearchIcon sx={{fontSize: 16}} />} onClick={() => setFeltDlgOpen(true)} sx={{textTransform: 'none'}}>
                                    Filz suchen
                                </Button>
                                <Button size="small" variant="outlined" onClick={() => setProductDlgOpen(true)} sx={{textTransform: 'none'}}>
                                    Produkt
                                </Button>
                                {stagedLines.length === 0 && (
                                    <Typography variant="caption" color="error" sx={{ml: 0.5}}>
                                        Mindestens eine Position erforderlich.
                                    </Typography>
                                )}
                            </Box>
                            {stagedLines.length > 0 && (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                    {stagedLines.map((l) => (
                                        <Box
                                            key={l.stageKey}
                                            sx={{display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderRadius: 1, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'rgba(0,0,0,0.015)'}}
                                        >
                                            <KindChip kind={l.kind} />
                                            <Box sx={{flex: 1, minWidth: 0}}>
                                                <Typography sx={{fontSize: 13, fontWeight: 500}}>
                                                    {l.feltTypeName}
                                                    {l.color ? ` · ${l.color}` : ''}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{fontFamily: "'JetBrains Mono', monospace"}}>
                                                    {l.articleNumber}
                                                </Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => handleRemoveLine(l.stageKey)} sx={{color: 'rgba(0,0,0,0.35)'}}>
                                                <DeleteOutlinedIcon sx={{fontSize: 18}} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <Divider />
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4, py: 2}}>
                    {step === 0 ? (
                        <>
                            <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{textTransform: 'none'}}>
                                Abbrechen
                            </Button>
                            <Button
                                variant="contained"
                                disabled={!canProceed}
                                onClick={() => setStep(1)}
                                sx={{textTransform: 'none', boxShadow: 'none', '&:hover': {boxShadow: 'none'}}}
                            >
                                Weiter
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outlined" onClick={() => setStep(0)} disabled={isSubmitting} sx={{textTransform: 'none'}}>
                                Zurück
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleCreate}
                                disabled={isSubmitting || stagedLines.length === 0}
                                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                                sx={{textTransform: 'none', boxShadow: 'none', '&:hover': {boxShadow: 'none'}}}
                            >
                                Offerte erstellen
                            </Button>
                        </>
                    )}
                </Box>
            </Dialog>

            <FeltSearchDialog open={feltDlgOpen} catalog={feltCatalog} onClose={() => setFeltDlgOpen(false)} onPick={handleAddFelt} />
            <ProductSearchDialog open={productDlgOpen} catalog={productCatalog} onClose={() => setProductDlgOpen(false)} onPick={handleAddProduct} />
        </>
    );
}
