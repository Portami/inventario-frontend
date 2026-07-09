import {fmtNum} from '@/pages/constants/offerConstants';
import {Box, InputBase, Typography} from '@mui/material';
import {useCallback, useEffect, useRef, useState} from 'react';

interface EditableProps {
    value: number;
    onChange: (v: number) => void;
    suffix?: string;
    width?: number;
    step?: number;
}

export default function Editable({value, onChange, suffix, width = 80, step = 0.01}: Readonly<EditableProps>) {
    const [editing, setEditing] = useState(false);
    const [raw, setRaw] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setRaw(String(value));
    }, [value]);

    const commit = useCallback(() => {
        setEditing(false);
        const n = Number.parseFloat(raw.replace(',', '.'));
        if (Number.isNaN(n)) {
            setRaw(String(value));
        } else {
            onChange(n);
        }
    }, [raw, value, onChange]);

    if (editing) {
        return (
            <InputBase
                inputRef={inputRef}
                autoFocus
                value={raw}
                type="number"
                onChange={(e) => setRaw(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') {
                        setEditing(false);
                        setRaw(String(value));
                    }
                }}
                inputProps={{step, style: {textAlign: 'right', padding: '2px 6px'}}}
                sx={{
                    width,
                    fontSize: 13,
                    fontVariantNumeric: 'tabular-nums',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    bgcolor: '#fff',
                }}
            />
        );
    }

    return (
        <Box
            onClick={() => setEditing(true)}
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
                minWidth: width,
                py: '2px',
                px: '6px',
                borderRadius: 1,
                cursor: 'text',
                fontSize: 13,
                fontVariantNumeric: 'tabular-nums',
                '&:hover': {bgcolor: 'rgba(0,0,0,0.04)', outline: '1px dashed rgba(0,0,0,0.2)'},
            }}
        >
            {fmtNum(value, step >= 1 ? 0 : 2)}
            {suffix && (
                <Typography component="span" variant="caption" color="text.secondary">
                    {suffix}
                </Typography>
            )}
        </Box>
    );
}
