import {FeltRollDto, ScrapPieceDto} from '@/types/roll';
import {Box, Card, CardContent, Divider, MenuItem, Stack, TextField, Typography} from '@mui/material';
import {ChangeEvent} from 'react';

/** A felt roll and a scrap piece share the same data shape, so one detail card serves both. */
export type FeltPiece = FeltRollDto | ScrapPieceDto;

export type PieceFormState = {
    length: string;
    width: string;
    batchId: string;
    storageId: string;
};

export type NamedOption = {id: number; name: string};

export const labelProps = {
    shrink: true,
    sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600},
};

export function Field({label, value}: {readonly label: string; readonly value: string | number | null | undefined}) {
    return (
        <div>
            <Typography variant="body2" color="textSecondary" sx={{fontWeight: 500, mb: 0.25}}>
                {label}
            </Typography>
            <Typography variant="body1">{value ?? '–'}</Typography>
        </div>
    );
}

interface PieceDetailCardProps {
    readonly piece: FeltPiece;
    readonly isEditing: boolean;
    readonly form: PieceFormState;
    readonly onField: (field: keyof PieceFormState) => (e: ChangeEvent<HTMLInputElement>) => void;
    readonly storageOptions: readonly NamedOption[];
    readonly batchOptions: readonly NamedOption[];
}

/**
 * Read-only / editable detail card shared by the roll and scrap-piece detail pages. Renders the
 * Identifikation, Masse &amp; Eigenschaften, and Lagerung sections; all physical dimensions are in cm.
 */
export default function PieceDetailCard({piece, isEditing, form, onField, storageOptions, batchOptions}: PieceDetailCardProps) {
    return (
        <Card>
            <CardContent>
                <Stack spacing={3}>
                    <div>
                        <Typography variant="overline" color="textSecondary">
                            Identifikation
                        </Typography>
                        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
                            <Field label="Artikelnummer" value={piece.articleNumber} />
                            <Field label="ID" value={piece.id} />
                            <Field label="Filztyp" value={piece.feltTypeName} />
                            <Field label="Farbe" value={piece.color} />
                            <Field label="Lieferant" value={piece.supplierName} />
                            <Field label="Lieferantenfarbe" value={piece.supplierColor} />
                        </Box>
                    </div>

                    <Divider />

                    <div>
                        <Typography variant="overline" color="textSecondary">
                            Masse & Eigenschaften
                        </Typography>
                        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
                            {isEditing ? (
                                <TextField
                                    label="Länge (cm)"
                                    value={form.length}
                                    onChange={onField('length')}
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    required
                                    slotProps={{htmlInput: {min: 1, step: 1}, inputLabel: labelProps}}
                                />
                            ) : (
                                <Field label="Länge (cm)" value={piece.length} />
                            )}
                            {isEditing ? (
                                <TextField
                                    label="Breite (cm)"
                                    value={form.width}
                                    onChange={onField('width')}
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    required
                                    slotProps={{htmlInput: {min: 1, step: 1}, inputLabel: labelProps}}
                                />
                            ) : (
                                <Field label="Breite (cm)" value={piece.width} />
                            )}
                            <Field label="Dicke (mm)" value={piece.thickness} />
                            <Field label="Dichte (g/m²)" value={piece.density} />
                            <Field label="Preis (CHF)" value={piece.price == null ? null : `CHF ${piece.price.toFixed(2)}`} />
                        </Box>
                    </div>

                    <Divider />

                    <div>
                        <Typography variant="overline" color="textSecondary">
                            Lagerung
                        </Typography>
                        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
                            {isEditing ? (
                                <TextField
                                    select
                                    label="Charge"
                                    value={form.batchId}
                                    onChange={onField('batchId')}
                                    variant="outlined"
                                    size="small"
                                    disabled
                                    slotProps={{inputLabel: labelProps, select: {displayEmpty: true}}}
                                >
                                    <MenuItem value="">&ndash;</MenuItem>
                                    {batchOptions.map((o) => (
                                        <MenuItem key={o.id} value={String(o.id)}>
                                            {o.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            ) : (
                                <Field label="Charge" value={piece.batchName} />
                            )}
                            {isEditing ? (
                                <TextField
                                    select
                                    label="Lagerort"
                                    value={form.storageId}
                                    onChange={onField('storageId')}
                                    variant="outlined"
                                    size="small"
                                    slotProps={{inputLabel: labelProps, select: {displayEmpty: true}}}
                                >
                                    <MenuItem value="">&ndash;</MenuItem>
                                    {storageOptions.map((o) => (
                                        <MenuItem key={o.id} value={String(o.id)}>
                                            {o.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            ) : (
                                <Field label="Lagerort" value={piece.storageName} />
                            )}
                        </Box>
                    </div>
                </Stack>
            </CardContent>
        </Card>
    );
}
