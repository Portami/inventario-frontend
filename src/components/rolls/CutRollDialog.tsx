import {fetchStorages} from '@/services/backend';
import {CutFeltRollRequest, FeltRollDto} from '@/types/roll';
import AddIcon from '@mui/icons-material/Add';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {useEffect, useState} from 'react';

/** A scrap with any side below this (cm) is dropped by the backend; flagged red here as a heads-up. */
const SCRAP_MIN_SIDE_CM = 44;

const labelProps = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

type NamedOption = {id: number; name: string};

type ScrapRow = {
    key: number;
    length: string;
    width: string;
    storageId: string;
};

interface CutRollDialogProps {
    readonly open: boolean;
    readonly roll: FeltRollDto | null;
    readonly isCutting: boolean;
    readonly onClose: () => void;
    readonly onConfirm: (payload: CutFeltRollRequest) => void;
}

function isRowTooSmall(row: ScrapRow): boolean {
    const length = Number.parseFloat(row.length);
    const width = Number.parseFloat(row.width);
    if (Number.isNaN(length) || Number.isNaN(width)) return false;
    return length < SCRAP_MIN_SIDE_CM || width < SCRAP_MIN_SIDE_CM;
}

function isRowComplete(row: ScrapRow): boolean {
    const length = Number.parseFloat(row.length);
    const width = Number.parseFloat(row.width);
    return !Number.isNaN(length) && length > 0 && !Number.isNaN(width) && width > 0;
}

export default function CutRollDialog({open, roll, isCutting, onClose, onConfirm}: CutRollDialogProps) {
    const [cutLength, setCutLength] = useState('');
    const [rows, setRows] = useState<ScrapRow[]>([]);
    const [storageOptions, setStorageOptions] = useState<NamedOption[]>([]);
    const [nextKey, setNextKey] = useState(0);

    useEffect(() => {
        if (!open) return;
        setCutLength('');
        setRows([]);
        setNextKey(0);
        fetchStorages().then((all) => {
            setStorageOptions(all.map(({id, name}) => ({id, name})).sort((a, b) => a.name.localeCompare(b.name)));
        });
    }, [open]);

    const addRow = () => {
        setRows((prev) => [...prev, {key: nextKey, length: '', width: '', storageId: ''}]);
        setNextKey((k) => k + 1);
    };

    const removeRow = (key: number) => setRows((prev) => prev.filter((r) => r.key !== key));

    const updateRow = (key: number, field: 'length' | 'width' | 'storageId', value: string) =>
        setRows((prev) => prev.map((r) => (r.key === key ? {...r, [field]: value} : r)));

    const cutLengthNum = Number.parseFloat(cutLength);
    const remainingLength = roll && !Number.isNaN(cutLengthNum) && cutLengthNum > 0 ? roll.length - cutLengthNum : null;
    const hasValidCut = remainingLength !== null && remainingLength > 0;
    const currentDimensions = `${roll?.length ?? ''} × ${roll?.width ?? ''} cm`;
    const decimals = remainingLength !== null && remainingLength % 1 === 0 ? 0 : 1;
    const remainingDimensions = hasValidCut ? `${remainingLength.toFixed(decimals)} × ${roll?.width ?? ''} cm` : `– × ${roll?.width ?? ''} cm`;

    const handleConfirm = () => {
        if (!hasValidCut) return;
        const scraps = rows.filter(isRowComplete).map((r) => ({
            length: Number.parseFloat(r.length),
            width: Number.parseFloat(r.width),
            ...(r.storageId && {storageId: Number.parseInt(r.storageId, 10)}),
        }));
        onConfirm({cutLength: cutLengthNum, scraps});
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                    <ContentCutIcon sx={{color: 'text.secondary'}} />
                    <Box>
                        <Typography variant="h6" sx={{lineHeight: 1.2}}>
                            Rolle abschneiden
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Länge wird reduziert · Reststücke können erfasst werden
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{pt: 1}}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        mb: 2.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                    }}
                >
                    <Box sx={{flex: 1}}>
                        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.25}}>
                            Aktuelle Rolle
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 700}}>
                            {currentDimensions}
                        </Typography>
                    </Box>
                    <ContentCutIcon sx={{color: 'text.disabled', fontSize: 18, flexShrink: 0}} />
                    <Box sx={{flex: 1, textAlign: 'right'}}>
                        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.25}}>
                            Verbleibend
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 700, ...(!hasValidCut && {color: 'text.disabled'})}}>
                            {remainingDimensions}
                        </Typography>
                    </Box>
                </Box>

                <TextField
                    label="Abzuschneidende Länge (cm)"
                    value={cutLength}
                    onChange={(e) => setCutLength(e.target.value)}
                    type="number"
                    variant="outlined"
                    size="small"
                    fullWidth
                    autoFocus
                    slotProps={{htmlInput: {min: 0.01, step: 0.1}, inputLabel: labelProps}}
                />

                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, mb: 1}}>
                    <Typography variant="overline" color="textSecondary">
                        Reststücke
                    </Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={addRow}>
                        Reststück
                    </Button>
                </Box>

                {rows.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Keine Reststücke. Füge welche hinzu, die du behalten möchtest.
                    </Typography>
                )}

                <Stack spacing={1.5}>
                    {rows.map((row) => {
                        const tooSmall = isRowTooSmall(row);
                        return (
                            <Box key={row.key} sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                                <TextField
                                    label="Länge (cm)"
                                    value={row.length}
                                    onChange={(e) => updateRow(row.key, 'length', e.target.value)}
                                    type="number"
                                    size="small"
                                    error={tooSmall}
                                    helperText={tooSmall ? 'Zu klein – wird nicht gespeichert' : ' '}
                                    slotProps={{htmlInput: {min: 0.01, step: 0.1}, inputLabel: labelProps}}
                                    sx={{flex: 1}}
                                />
                                <TextField
                                    label="Breite (cm)"
                                    value={row.width}
                                    onChange={(e) => updateRow(row.key, 'width', e.target.value)}
                                    type="number"
                                    size="small"
                                    error={tooSmall}
                                    helperText=" "
                                    slotProps={{htmlInput: {min: 0.01, step: 0.1}, inputLabel: labelProps}}
                                    sx={{flex: 1}}
                                />
                                <TextField
                                    select
                                    label="Lagerort"
                                    value={row.storageId}
                                    onChange={(e) => updateRow(row.key, 'storageId', e.target.value)}
                                    size="small"
                                    helperText=" "
                                    slotProps={{inputLabel: labelProps, select: {displayEmpty: true}}}
                                    sx={{flex: 1.2}}
                                >
                                    <MenuItem value="">Wie Rolle</MenuItem>
                                    {storageOptions.map((o) => (
                                        <MenuItem key={o.id} value={String(o.id)}>
                                            {o.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <IconButton aria-label="Reststück entfernen" onClick={() => removeRow(row.key)} sx={{mt: 0.5}}>
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        );
                    })}
                </Stack>
            </DialogContent>
            <DialogActions sx={{px: 3, pb: 2.5}}>
                <Button onClick={onClose} disabled={isCutting}>
                    Abbrechen
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={isCutting || !hasValidCut}
                    startIcon={isCutting ? <CircularProgress size={16} color="inherit" /> : <ContentCutIcon />}
                >
                    Abschneiden
                </Button>
            </DialogActions>
        </Dialog>
    );
}
