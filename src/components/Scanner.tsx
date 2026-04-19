import {useBluetoothScanner} from '@/hooks/useBluetoothScanner';
import {lookupRollCode} from '@/services/backend';
import {getMockPresetCodes} from '@/services/mock/scannerMock.ts';
import {ScanResult} from '@/types/scanner';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import {Alert, Box, Button, Chip, CircularProgress, MenuItem, Modal, Paper, Select, Stack, TextField, Typography} from '@mui/material';
import React, {useState} from 'react';

type ScannerProps = {
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the callback signature
    onSuccess(result: ScanResult): void;
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the callback signature
    onError(message: string): void;
    isOpen: boolean;

    onClose(): void;
};

type ScannerMode = 'bluetooth' | 'manual' | 'simulation';

const ID_PATTERN = /^\d{5}$/;

/**
 * Scanner Component
 *
 * This component provides a modal interface for scanning roll/scrap codes using multiple methods:
 * - Bluetooth scanner: Connects to a Bluetooth device and listens for scanned codes.
 * - Manual entry: Allows users to type in the code manually with validation.
 * - Development simulation: Provides preset codes for testing during development.
 */
export default function Scanner({onSuccess, onError, isOpen, onClose}: Readonly<ScannerProps>) {
    const [mode, setMode] = useState<ScannerMode>('bluetooth');
    const [manualInput, setManualInput] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Bluetooth scanner hook
    const bluetoothScanner = useBluetoothScanner(mode === 'bluetooth' && isOpen, async (code: string) => {
        await handleCodeScanned(code);
    });

    // Validate 5-digit numeric ID format
    const validateIdFormat = (code: string): boolean => {
        return ID_PATTERN.test(code.trim());
    };

    const handleCodeScanned = async (code: string) => {
        const trimmedCode = code.trim();

        if (!validateIdFormat(trimmedCode)) {
            setError('Ungültiges Format: Der Code muss aus 5 Ziffern bestehen (z.B. 00001)');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await lookupRollCode(trimmedCode);
            onSuccess(result);
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Code nicht gefunden';
            setError(`Suche fehlgeschlagen: ${message}`);
            onError(message);
        } finally {
            setIsLoading(false);
            setManualInput('');
        }
    };

    const handleManualSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!manualInput.trim()) {
            setError('Bitte geben Sie einen Code ein');
            return;
        }

        await handleCodeScanned(manualInput);
    };

    const handleSimulationSelect = async (code: string) => {
        setManualInput(code);
        await handleCodeScanned(code);
    };

    const handleClose = () => {
        setError('');
        setManualInput('');
        setMode('bluetooth');
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={handleClose} sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Paper
                sx={{
                    width: {xs: '90%', sm: 500},
                    maxWidth: 500,
                    p: 3,
                    position: 'relative',
                }}
            >
                <Typography variant="h6" sx={{mb: 2}}>
                    Rollcode scannen
                </Typography>

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                <Stack spacing={2}>
                    {/* Mode selector */}
                    <Box>
                        <Typography variant="body2" sx={{mb: 1, fontWeight: 600}}>
                            Scan-Methode
                        </Typography>
                        <Select
                            value={mode}
                            onChange={(e) => {
                                setMode(e.target.value as ScannerMode);
                                setError('');
                            }}
                            fullWidth
                            disabled={isLoading}
                        >
                            <MenuItem value="bluetooth">
                                <BluetoothIcon sx={{mr: 1, fontSize: 18}} /> Bluetooth-Scanner
                            </MenuItem>
                            <MenuItem value="manual">Manuelle Eingabe</MenuItem>
                            {import.meta.env.DEV && <MenuItem value="simulation">Entwicklungs-Simulation</MenuItem>}
                        </Select>
                    </Box>
                    {mode === 'bluetooth' && (
                        <Box sx={{p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0'}}>
                            <Stack spacing={2}>
                                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                        Bluetooth-Scanner
                                    </Typography>
                                    <Chip
                                        icon={<BluetoothIcon />}
                                        label={bluetoothScanner.isConnected ? 'Bereit' : 'Warten...'}
                                        color={bluetoothScanner.isConnected ? 'success' : 'default'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Typography variant="caption" color="textSecondary" sx={{lineHeight: 1.6}}>
                                    Verbinden Sie Ihren Bluetooth-Scanner mit diesem Gerät und richten Sie den Scanner auf den Data Matrix-Code. Der Code wird
                                    automatisch gelesen.
                                </Typography>
                                {bluetoothScanner.scannedCode && (
                                    <Box
                                        sx={{
                                            p: 1,
                                            backgroundColor: '#fff',
                                            borderRadius: 0.5,
                                            border: '1px solid #1976d2',
                                        }}
                                    >
                                        <Typography variant="caption">
                                            Lese: <strong>{bluetoothScanner.scannedCode}</strong>
                                        </Typography>
                                    </Box>
                                )}
                                {isLoading && (
                                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1}}>
                                        <CircularProgress size={24} />
                                        <Typography variant="caption" sx={{ml: 1}}>
                                            Code wird nachgeschlagen...
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    )}

                    {/* Manual entry mode */}
                    {mode === 'manual' && (
                        <Box component="form" onSubmit={handleManualSubmit}>
                            <TextField
                                autoFocus
                                fullWidth
                                label="Code eingeben (5 Ziffern)"
                                value={manualInput}
                                onChange={(e) => {
                                    setManualInput(e.target.value.replaceAll(/\D/g, '').slice(0, 5));
                                    setError('');
                                }}
                                placeholder="00001"
                                disabled={isLoading}
                                slotProps={{htmlInput: {maxLength: 5, pattern: String.raw`\d{5}`}}}
                                sx={{mb: 1}}
                            />
                            <Button type="submit" variant="contained" fullWidth disabled={isLoading || !validateIdFormat(manualInput)}>
                                {isLoading ? <CircularProgress size={24} /> : 'Suchen'}
                            </Button>
                        </Box>
                    )}

                    {/* Development simulation mode */}
                    {mode === 'simulation' && import.meta.env.DEV && (
                        <Box>
                            <Typography variant="body2" sx={{mb: 1, fontWeight: 600}}>
                                Vordefinierte Codes
                            </Typography>
                            <Stack spacing={1}>
                                {getMockPresetCodes().map((code) => (
                                    <Button key={code} variant="outlined" fullWidth onClick={() => void handleSimulationSelect(code)} disabled={isLoading}>
                                        {isLoading ? <CircularProgress size={24} /> : `Test-Code: ${code}`}
                                    </Button>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>

                {/* Action buttons */}
                <Stack direction="row" spacing={1} sx={{mt: 3}}>
                    <Button onClick={handleClose} fullWidth variant="outlined" disabled={isLoading}>
                        Abbrechen
                    </Button>
                </Stack>
            </Paper>
        </Modal>
    );
}
