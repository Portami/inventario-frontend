import {createRoll, updateRoll} from '../api';
import {fetchBatchesByFelt} from '@/features/felts';
import {FeltDto} from '@/features/felts/types';
import {FeltRollDto} from '@/features/rolls/types';
import {fetchStorages} from '@/features/storage';
import FormDialog from '@/shared/components/FormDialog';
import FormTextField from '@/shared/components/FormTextField';
import {useToast} from '@/shared/components/ToastProvider';
import {Grid, MenuItem} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

type RollDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: (roll: FeltRollDto) => void;
    readonly roll?: FeltRollDto | null;
    readonly felts: FeltDto[];
    readonly defaultFeltId?: number;
};

type FormState = {
    feltId: string;
    length: string;
    width: string;
    batchId: string;
    storageId: string;
};

type NamedOption = {id: number; name: string};

const emptyForm: FormState = {feltId: '', length: '', width: '', batchId: '', storageId: ''};

const labelProps = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

export default function RollDialog({open, onClose, onSaved, roll, felts, defaultFeltId}: RollDialogProps) {
    const showToast = useToast();
    const [form, setForm] = useState<FormState>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [storageOptions, setStorageOptions] = useState<NamedOption[]>([]);
    const [batchOptions, setBatchOptions] = useState<NamedOption[]>([]);

    const isEdit = roll != null;

    useEffect(() => {
        if (!open) return;
        if (roll) {
            setForm({
                feltId: String(roll.feltId),
                length: String(roll.length),
                width: String(roll.width),
                batchId: roll.batchId == null ? '' : String(roll.batchId),
                storageId: roll.storageId == null ? '' : String(roll.storageId),
            });
        } else {
            setForm(defaultFeltId == null ? emptyForm : {...emptyForm, feltId: String(defaultFeltId)});
        }
    }, [open, roll, defaultFeltId]);

    useEffect(() => {
        if (!open) return;
        void fetchStorages().then((allStorages) => {
            setStorageOptions(allStorages.map(({id, name}) => ({id, name})).sort((a, b) => a.name.localeCompare(b.name)));
        });
        if (defaultFeltId != undefined) {
            void fetchBatchesByFelt(defaultFeltId).then((relevantBatches) => {
                setBatchOptions(relevantBatches.map(({id, name}) => ({id, name})).sort((a, b) => a.name.localeCompare(b.name)));
            });
        }
    }, [open]);

    const setField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({...prev, [field]: e.target.value}));

    const handleSave = async () => {
        const length = Number.parseFloat(form.length);
        const width = Number.parseFloat(form.width);
        if (Number.isNaN(length) || length <= 0 || Number.isNaN(width) || width <= 0) return;
        setIsSaving(true);
        try {
            let savedRoll: FeltRollDto;
            if (roll == null) {
                const feltId = Number.parseInt(form.feltId, 10);
                if (Number.isNaN(feltId)) {
                    setIsSaving(false);
                    return;
                }
                savedRoll = await createRoll({
                    feltId,
                    length,
                    width,
                    ...(form.batchId && {batchId: Number.parseInt(form.batchId, 10)}),
                    ...(form.storageId && {storageId: Number.parseInt(form.storageId, 10)}),
                });
                showToast('Rolle erfolgreich erstellt.');
            } else {
                savedRoll = await updateRoll(roll.id, {
                    length,
                    width,
                    ...(form.batchId && {batchId: Number.parseInt(form.batchId, 10)}),
                    ...(form.storageId && {storageId: Number.parseInt(form.storageId, 10)}),
                });
                showToast('Rolle erfolgreich gespeichert.');
            }
            onSaved(savedRoll);
        } catch {
            showToast(roll == null ? 'Rolle konnte nicht erstellt werden.' : 'Rolle konnte nicht gespeichert werden.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FormDialog
            open={open}
            onClose={onClose}
            title={isEdit ? `${roll.feltTypeName} – ${roll.color}` : 'Neue Rolle'}
            onSubmit={() => void handleSave()}
            submitLabel="Speichern"
            busy={isSaving}
            maxWidth="md"
        >
            <Grid size={6}>
                {isEdit ? (
                    <FormTextField label="Filztyp" value={roll.feltTypeName} slotProps={{input: {readOnly: true}, inputLabel: labelProps}} />
                ) : (
                    <FormTextField select label="Filz" value={form.feltId} onChange={setField('feltId')} required slotProps={{inputLabel: labelProps}}>
                        {felts.map((f) => (
                            <MenuItem key={f.id} value={String(f.id)}>
                                {`${f.feltTypeName} – ${f.color} (${f.articleNumber})`}
                            </MenuItem>
                        ))}
                    </FormTextField>
                )}
            </Grid>
            <Grid size={6}>
                {isEdit ? (
                    <FormTextField label="Farbe" value={roll.color} slotProps={{input: {readOnly: true}, inputLabel: labelProps}} />
                ) : (
                    <FormTextField
                        label="Lieferant"
                        value={felts.find((f) => String(f.id) === form.feltId)?.supplierName ?? ''}
                        slotProps={{input: {readOnly: true}, inputLabel: labelProps}}
                    />
                )}
            </Grid>
            <Grid size={6}>
                <FormTextField
                    label="Länge (cm)"
                    value={form.length}
                    onChange={setField('length')}
                    type="number"
                    required
                    slotProps={{htmlInput: {min: 1, step: 1}, inputLabel: labelProps}}
                />
            </Grid>
            <Grid size={6}>
                <FormTextField
                    label="Breite (cm)"
                    value={form.width}
                    onChange={setField('width')}
                    type="number"
                    required
                    slotProps={{htmlInput: {min: 1, step: 1}, inputLabel: labelProps}}
                />
            </Grid>
            <Grid size={6}>
                <FormTextField
                    select
                    label="Charge"
                    value={form.batchId}
                    onChange={setField('batchId')}
                    slotProps={{inputLabel: labelProps, select: {displayEmpty: true}}}
                >
                    <MenuItem value="">–</MenuItem>
                    {batchOptions.map((o) => (
                        <MenuItem key={o.id} value={String(o.id)}>
                            {o.name}
                        </MenuItem>
                    ))}
                </FormTextField>
            </Grid>
            <Grid size={6}>
                <FormTextField
                    select
                    label="Lagerort"
                    value={form.storageId}
                    onChange={setField('storageId')}
                    slotProps={{inputLabel: labelProps, select: {displayEmpty: true}}}
                >
                    <MenuItem value="">–</MenuItem>
                    {storageOptions.map((o) => (
                        <MenuItem key={o.id} value={String(o.id)}>
                            {o.name}
                        </MenuItem>
                    ))}
                </FormTextField>
            </Grid>
        </FormDialog>
    );
}
