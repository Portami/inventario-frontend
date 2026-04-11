import {Color, colorLabels, CreateProductRequest, Product, PRODUCT_COLOR_OPTIONS, PRODUCT_TYPE_OPTIONS, Type, typeLabels} from '@/types/product';
import {Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField} from '@mui/material';
import {SelectChangeEvent} from '@mui/material/Select';
import React, {useMemo, useRef, useState} from 'react';

type ProductCreateFormProps = {
    isSubmitting: boolean;
    existingProducts: Product[];
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the callback signature for consumers to know what data to submit
    onSubmit(payload: CreateProductRequest): Promise<boolean>;
};

type FormErrors = {
    name?: string;
    articleNumber?: string;
    type?: string;
    color?: string;
};

export default function ProductCreateForm({isSubmitting, existingProducts, onSubmit}: ProductCreateFormProps) {
    const [name, setName] = useState('');
    const [articleNumber, setArticleNumber] = useState('');
    const [type, setType] = useState<Type | ''>('');
    const [color, setColor] = useState<Color | ''>('');
    const [validationError, setValidationError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState('');
    const successRef = useRef<HTMLDivElement>(null);

    const resetForm = () => {
        setName('');
        setArticleNumber('');
        setType('');
        setColor('');
        setValidationError('');
        setFieldErrors({});
        setSuccessMessage('');
    };

    const validateFields = (): FormErrors => {
        const errors: FormErrors = {};

        if (articleNumber.trim().length === 0) {
            errors.articleNumber = 'Article number is required';
        } else if (articleNumber.trim().length < 2) {
            errors.articleNumber = 'Article number must be at least 2 characters';
        } else if (existingProducts.some((p) => p.articleNumber === articleNumber.trim())) {
            errors.articleNumber = 'Article number already exists';
        }

        if (type === '') {
            errors.type = 'Type is required';
        }

        if (color === '') {
            errors.color = 'Color is required';
        }

        return errors;
    };

    const handleTypeChange = (event: SelectChangeEvent) => {
        setType(event.target.value as Type | '');
        setFieldErrors((prev) => ({...prev, type: ''}));
    };

    const handleColorChange = (event: SelectChangeEvent) => {
        setColor(event.target.value as Color | '');
        setFieldErrors((prev) => ({...prev, color: ''}));
    };

    const handleArticleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArticleNumber(e.target.value);
        setFieldErrors((prev) => ({...prev, articleNumber: ''}));
    };

    const isSubmitDisabled = useMemo(() => {
        return isSubmitting || articleNumber.trim().length === 0 || type === '' || color === '';
    }, [articleNumber, color, isSubmitting, type]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setValidationError('You have an error in your form');
            return;
        }

        setValidationError('');
        setFieldErrors({});

        const normalizedName = name.trim();
        const normalizedArticleNumber = articleNumber.trim();

        // Type assertion is safe here because validateFields ensures type and color are not empty strings
        const didCreate = await onSubmit({
            articleNumber: normalizedArticleNumber,
            name: normalizedName || undefined,
            type: type as Type,
            color: color as Color,
        });

        if (didCreate) {
            setSuccessMessage('Product added successfully!');
            resetForm();
            // Focus on success message for accessibility
            successRef.current?.focus();
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {successMessage && (
                <Alert ref={successRef} severity="success" sx={{mb: 2}} role="status" aria-live="polite" tabIndex={-1}>
                    {successMessage}
                </Alert>
            )}

            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                <TextField
                    label="Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    fullWidth
                    disabled={isSubmitting}
                    aria-label="Product name (optional)"
                />
                <TextField
                    label="Article number"
                    value={articleNumber}
                    onChange={handleArticleNumberChange}
                    fullWidth
                    required
                    disabled={isSubmitting}
                    error={!!fieldErrors.articleNumber}
                    helperText={fieldErrors.articleNumber}
                    slotProps={{htmlInput: {minLength: 2, maxLength: 20}}}
                    aria-required="true"
                    aria-label="Product article number"
                    aria-describedby={fieldErrors.articleNumber ? 'articleNumber-error' : undefined}
                />
                <FormControl fullWidth required disabled={isSubmitting} error={!!fieldErrors.type}>
                    <InputLabel id="type-label" aria-label="Select product type">
                        Type
                    </InputLabel>
                    <Select
                        labelId="type-label"
                        id="type"
                        label="Type"
                        value={type}
                        onChange={handleTypeChange}
                        aria-required="true"
                        aria-describedby={fieldErrors.type ? 'type-error' : undefined}
                    >
                        <MenuItem value="">
                            <em>Select type</em>
                        </MenuItem>
                        {PRODUCT_TYPE_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {typeLabels[option]}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth required disabled={isSubmitting} error={!!fieldErrors.color}>
                    <InputLabel id="color-label" aria-label="Select product color">
                        Color
                    </InputLabel>
                    <Select
                        labelId="color-label"
                        id="color"
                        label="Color"
                        value={color}
                        onChange={handleColorChange}
                        aria-required="true"
                        aria-describedby={fieldErrors.color ? 'color-error' : undefined}
                    >
                        <MenuItem value="">
                            <em>Select color</em>
                        </MenuItem>
                        {PRODUCT_COLOR_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {colorLabels[option]}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
                    {isSubmitting ? 'Adding...' : 'Add Product'}
                </Button>
            </Stack>
            {validationError ? (
                <Alert severity="warning" sx={{mt: 2}} role="alert">
                    {validationError}
                </Alert>
            ) : null}
        </Box>
    );
}
