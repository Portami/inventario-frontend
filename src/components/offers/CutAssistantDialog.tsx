import {useToast} from '@/components/ToastProvider';
import {acceptCutProposal, fetchFeltTypes, requestCutProposals} from '@/services/backend';
import {CutProposalDto, RequestCutProposalsDto} from '@/types/cutAssistant';
import {FeltTypeDto} from '@/types/felt';
import CloseIcon from '@mui/icons-material/Close';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import {
    Box,
    Button,
    Card,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';
import React, {useEffect, useState} from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onAccepted: () => void;
    offerId?: string; // Optional because we might start it before an offer is created
}

export default function CutAssistantDialog({open, onClose, onAccepted, offerId}: Props) {
    const showToast = useToast();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Inputs
    const [feltTypes, setFeltTypes] = useState<FeltTypeDto[]>([]);
    const [selectedFeltType, setSelectedFeltType] = useState<string>('');
    const [pieces, setPieces] = useState([{width: 100, height: 100, quantity: 1}]);

    // Results
    const [proposals, setProposals] = useState<CutProposalDto[]>([]);
    const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

    useEffect(() => {
        if (open && feltTypes.length === 0) {
            setLoading(true);
            fetchFeltTypes()
                .then(setFeltTypes)
                .catch(() => showToast('Fehler beim Laden der Filzarten', 'error'))
                .finally(() => setLoading(false));
        }
    }, [open, feltTypes.length, showToast]);

    const handleAddPiece = () => {
        setPieces([...pieces, {width: 100, height: 100, quantity: 1}]);
    };

    const handlePieceChange = (index: number, field: 'width' | 'height' | 'quantity', value: number) => {
        const newPieces = [...pieces];
        newPieces[index][field] = value;
        setPieces(newPieces);
    };

    const handleRemovePiece = (index: number) => {
        setPieces(pieces.filter((_, i) => i !== index));
    };

    const handleRequestProposals = async () => {
        if (!selectedFeltType || pieces.length === 0) return;
        
        setLoading(true);
        try {
            const request: RequestCutProposalsDto = {
                feltType: selectedFeltType,
                requestedPieces: pieces,
            };
            const result = await requestCutProposals(request);
            if (result && result.length > 0) {
                setProposals(result);
                setSelectedProposal(result[0].proposalId); // Select first by default
                setStep(1);
            } else {
                showToast('Keine passenden Schnittvorschläge gefunden.', 'info');
            }
        } catch (_error) {
            showToast('Fehler beim Berechnen der Vorschläge', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptProposal = async () => {
        if (!selectedProposal || !offerId) {
            showToast('Bitte wählen Sie einen Vorschlag und stellen Sie sicher, dass die Offerte gespeichert ist.', 'error');
            return;
        }

        setLoading(true);
        try {
            await acceptCutProposal(offerId, selectedProposal);
            showToast('Schnittvorschlag erfolgreich in die Offerte übernommen', 'success');
            onAccepted();
        } catch (_error) {
            showToast('Fehler beim Übernehmen des Vorschlags', 'error');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(0);
        setProposals([]);
        setSelectedProposal(null);
        setSelectedFeltType('');
        setPieces([{width: 100, height: 100, quantity: 1}]);
    };

    return (
        <Dialog open={open} onClose={() => { reset(); onClose(); }} maxWidth="md" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <ContentCutIcon color="primary" />
                    <Typography variant="h6">Schnittassistant</Typography>
                </Box>
                <IconButton onClick={() => { reset(); onClose(); }} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box sx={{px: 3, pb: 2}}>
                <Stepper activeStep={step}>
                    <Step><StepLabel>Bedarf definieren</StepLabel></Step>
                    <Step><StepLabel>Vorschlag wählen</StepLabel></Step>
                </Stepper>
            </Box>
            <Divider />

            <DialogContent sx={{minHeight: 400}}>
                {loading && <Box sx={{display: 'flex', justifyContent: 'center', pt: 4}}><CircularProgress /></Box>}

                {!loading && step === 0 && (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <TextField
                            select
                            label="Filzart"
                            value={selectedFeltType}
                            onChange={(e) => setSelectedFeltType(e.target.value)}
                            fullWidth
                            size="small"
                        >
                            {Array.isArray(feltTypes) && feltTypes.map((type) => (
                                <MenuItem key={type.name} value={type.name}>{type.name}</MenuItem>
                            ))}
                        </TextField>

                        <Typography variant="subtitle2" sx={{mt: 1}}>Benötigte Stücke</Typography>
                        {pieces.map((piece, index) => (
                            <Box key={index} sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                                <TextField
                                    label="Breite (cm)"
                                    type="number"
                                    size="small"
                                    value={piece.width}
                                    onChange={(e) => handlePieceChange(index, 'width', Number(e.target.value))}
                                />
                                <Typography>x</Typography>
                                <TextField
                                    label="Länge (cm)"
                                    type="number"
                                    size="small"
                                    value={piece.height}
                                    onChange={(e) => handlePieceChange(index, 'height', Number(e.target.value))}
                                />
                                <TextField
                                    label="Anzahl"
                                    type="number"
                                    size="small"
                                    value={piece.quantity}
                                    onChange={(e) => handlePieceChange(index, 'quantity', Number(e.target.value))}
                                    sx={{width: 100}}
                                />
                                <Button size="small" color="error" onClick={() => handleRemovePiece(index)}>Entfernen</Button>
                            </Box>
                        ))}
                        <Button variant="outlined" onClick={handleAddPiece} sx={{alignSelf: 'flex-start'}}>
                            + Weiteres Stück
                        </Button>
                    </Box>
                )}

                {!loading && step === 1 && (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <Typography variant="subtitle1">Berechnete Vorschläge</Typography>
                        {proposals.map((proposal) => (
                            <Card 
                                key={proposal.proposalId} 
                                variant="outlined"
                                sx={{
                                    p: 2, 
                                    cursor: 'pointer',
                                    border: selectedProposal === proposal.proposalId ? '2px solid primary.main' : '1px solid #ccc',
                                    bgcolor: selectedProposal === proposal.proposalId ? 'action.selected' : 'background.paper',
                                }}
                                onClick={() => setSelectedProposal(proposal.proposalId)}
                            >
                                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="subtitle2">Option {proposal.proposalId.substring(0, 8)}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Verschnitt: {proposal.totalWaste} cm²
                                    </Typography>
                                </Box>
                                <Divider sx={{my: 1}} />
                                <Typography variant="body2" sx={{mb: 1}}>Zuschnitte aus Lagerbestand:</Typography>
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                    {proposal.proposedCuts.map((cut, idx) => (
                                        <Box key={idx} sx={{bgcolor: 'grey.100', p: 1, borderRadius: 1, border: '1px solid grey.300'}}>
                                            <Typography variant="caption" sx={{ display: 'block' }}>Aus: {cut.sourceStockId.substring(0,6)}</Typography>
                                            <Typography variant="body2">{cut.width}x{cut.height} cm</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Card>
                        ))}
                    </Box>
                )}
            </DialogContent>

            <Divider />
            <Box sx={{p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2}}>
                <Button onClick={() => { reset(); onClose(); }} disabled={loading}>Abbrechen</Button>
                {step === 0 ? (
                    <Button 
                        variant="contained" 
                        onClick={handleRequestProposals} 
                        disabled={loading || !selectedFeltType || pieces.length === 0}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        Vorschläge berechnen
                    </Button>
                ) : (
                    <Button 
                        variant="contained" 
                        onClick={handleAcceptProposal}
                        disabled={loading || !selectedProposal || !offerId}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        In Offerte übernehmen
                    </Button>
                )}
            </Box>
        </Dialog>
    );
}
