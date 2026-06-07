import {AuditingDuplicateScanList} from '@/components/inventoryAuditing/AuditingDuplicateScanList.tsx';
import {useToast} from '@/components/ToastProvider.tsx';
import {resolveStocktakeItem, voidStocktakeScan} from '@/services/backend.ts';
import {FeltStocktakeItemDto, ITEM_STATE, ItemState, RESOLUTION_TYPE, RESOLUTION_TYPES_LABELS, ResolutionType} from '@/types/inventoryAuditing.ts';
import CloseIcon from '@mui/icons-material/Close';
import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField} from '@mui/material';
import {ChangeEvent, useEffect, useMemo, useState} from 'react';

interface AuditingResolveDialogProps {
    item: FeltStocktakeItemDto | null;
    inventoryId: string;
    open: boolean;
    onClose: () => void;
    onResolve: () => void;
}

type FormState = {
    resolutionType: ResolutionType;
    comment: string;
};

const emptyForm: FormState = {
    resolutionType: 'ACKNOWLEDGE',
    comment: '',
};

const RESOLUTION_TYPES_BY_STATE: Record<ItemState, ResolutionType[]> = {
    INITIAL: [],
    OK: [],
    MISSING: ['IGNORE_MISSING', 'REMOVE_MISSING'],
    WRONG_STORAGE: ['ADJUST_STORAGE', 'MOVE_PHYSICALLY'],
    RESCAN_REQUIRED: [],
    DUPLICATE_SCAN: [],
    NOT_IN_STOCKTAKE: ['ACKNOWLEDGE'],
    UNKNOWN: ['ACKNOWLEDGE'],
};

const labelProps = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

export function AuditingResolveDialog({open, onClose, onResolve, item, inventoryId}: AuditingResolveDialogProps) {
    const showToast = useToast();
    const [form, setForm] = useState<FormState>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedScanIds, setSelectedScanIds] = useState<number[]>([]);
    const setField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({...prev, [field]: e.target.value}));

    const getDefaultResolutionType = (item: FeltStocktakeItemDto | null): ResolutionType => {
        if (!item) return 'ACKNOWLEDGE';

        return RESOLUTION_TYPES_BY_STATE[item.status]?.[0] ?? 'ACKNOWLEDGE';
    };

    const selectableScans = useMemo(() => {
        if (!item) return [];

        return item.scans.filter((scan) => !scan.isVoided && !scan.isCorrected);
    }, [item]);

    useEffect(() => {
        if (!open) return;
        setForm({
            resolutionType: getDefaultResolutionType(item),
            comment: '',
        });
        setSelectedScanIds([]);
    }, [open]);

    const handleSave = async () => {
        try {
            if (!item) return;
            setIsSaving(true);

            let resolved = false;

            if (item.status === ITEM_STATE.DUPLICATE_SCAN) resolved = await handleDuplicateScans();
            else {
                await resolveStocktakeItem(inventoryId, item.itemId.toString(), {
                    resolution: form.resolutionType,
                    comment: form.comment,
                });
                resolved = true;
            }

            if (!resolved) return;

            onResolve();
            showToast('Lösung erfolgreich vorgenommen.', 'success');
            onClose();
        } catch {
            showToast('Lösung konnte nicht vorgenommen werden.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDuplicateScans = async (): Promise<boolean> => {
        if (!item) return false;
        if (item.status !== ITEM_STATE.DUPLICATE_SCAN) return false;

        if (selectedScanIds.length !== selectableScans.length - 1) {
            showToast('Es darf nur noch ein Scan verbleiben', 'error');
            return false;
        }

        await Promise.all(selectedScanIds.map((scanId) => voidStocktakeScan(inventoryId, scanId.toString())));
        return true;
    };

    const allowedResolutionTypes = RESOLUTION_TYPES_BY_STATE[item?.status as ItemState] ?? [];
    const resolutionTypeField = (
        <TextField
            select
            label="Lösungsart"
            value={form.resolutionType}
            onChange={setField('resolutionType')}
            variant="outlined"
            size="small"
            fullWidth
            slotProps={{inputLabel: labelProps}}
        >
            {Object.entries(RESOLUTION_TYPE)
                .filter(([id]) => allowedResolutionTypes.includes(id as ResolutionType))
                .map(([id]) => (
                    <MenuItem key={id} value={id}>
                        {RESOLUTION_TYPES_LABELS[id as ResolutionType]}
                    </MenuItem>
                ))}
        </TextField>
    );

    const mainLoad =
        item && item.status === ITEM_STATE.DUPLICATE_SCAN ? (
            <AuditingDuplicateScanList scans={selectableScans} selectedScanIds={selectedScanIds} onSelectedScanIdsChange={setSelectedScanIds} />
        ) : (
            resolutionTypeField
        );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                Problem lösen
                <IconButton onClick={onClose} size="small" aria-label="close" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 3}}>
                <Box sx={{p: 2}}>{mainLoad}</Box>
                <Box sx={{p: 2}}>
                    <TextField
                        label="Bemerkung"
                        value={form.comment}
                        onChange={setField('comment')}
                        variant="outlined"
                        size="small"
                        fullWidth
                        slotProps={{inputLabel: labelProps}}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{px: 4, pb: 3}}>
                <Button variant="outlined" onClick={onClose} disabled={isSaving}>
                    Abbrechen
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Übernehmen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
