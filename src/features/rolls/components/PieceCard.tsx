import {FeltRollDto, ScrapPieceDto} from '@/types/roll';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {Box, Card, CardContent, Chip, IconButton, Typography} from '@mui/material';

type FeltPiece = FeltRollDto | ScrapPieceDto;

function pieceWidthCategory(width: number): '1.8m' | '1m' | null {
    if (width === 180) return '1.8m';
    if (width === 100) return '1m';
    return null;
}

const WIDTH_STYLES = {
    '1.8m': {bg: 'rgba(255,143,0,0.08)', border: '#FF8F00', badge: '#FF8F00'},
    '1m': {bg: 'rgba(2,119,189,0.08)', border: '#0277BD', badge: '#0277BD'},
} as const;

interface PieceCardProps {
    readonly piece: FeltPiece;
    readonly onOpen: () => void;
    readonly onDelete?: () => void;
}

/**
 * Compact clickable card used in the lists of rolls and scrap pieces on the felt detail page. Shows
 * the dimensions, storage and batch, an optional width-category badge, and an optional delete button.
 */
export default function PieceCard({piece, onOpen, onDelete}: PieceCardProps) {
    const category = pieceWidthCategory(piece.width);
    const styles = category ? WIDTH_STYLES[category] : null;

    return (
        <Card
            variant="outlined"
            onClick={onOpen}
            sx={{
                cursor: 'pointer',
                position: 'relative',
                bgcolor: styles?.bg ?? 'background.paper',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                '&:hover': {
                    borderColor: styles?.border ?? 'primary.main',
                    boxShadow: (theme) => `0 0 0 1px ${styles?.border ?? theme.palette.primary.main}`,
                },
            }}
        >
            <CardContent sx={{p: 2, '&:last-child': {pb: 2}}}>
                {category && (
                    <Chip
                        label={category}
                        size="small"
                        sx={{
                            mb: 0.75,
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor: styles?.badge,
                            color: '#fff',
                            '& .MuiChip-label': {px: 0.75},
                        }}
                    />
                )}
                <Typography sx={{fontSize: '1rem', fontWeight: 700, mb: 0.5, pr: 7, lineHeight: 1.3}}>
                    {piece.length} × {piece.width} cm
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
                    {piece.storageName ?? '–'}
                </Typography>
                {piece.batchName && (
                    <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
                        Charge: {piece.batchName}
                    </Typography>
                )}
                {onDelete && (
                    <Box sx={{position: 'absolute', top: 6, right: 6, display: 'flex', gap: 0.25}}>
                        <IconButton
                            size="small"
                            color="error"
                            aria-label="delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
