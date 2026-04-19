import {ProductId} from '@/types/product';
import {Roll} from '@/types/roll';
import {Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme} from '@mui/material';

// Re-export Roll as RollItem for backward compatibility
export type RollItem = Roll;

type RollListProps = {
    deletingIds: Set<ProductId>;
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the callback signature for consumers to know what ID was deleted
    onDelete(rollId: ProductId): Promise<void>;
    rolls: RollItem[];
};

export default function RollList({deletingIds, onDelete, rolls}: Readonly<RollListProps>) {
    const theme = useTheme();

    if (!rolls.length) {
        return <Typography variant="body1">Noch keine Rollen. Fügen Sie Ihre erste Rolle hinzu.</Typography>;
    }

    return (
        <TableContainer component={Paper} sx={{borderRadius: `${theme.shape.borderRadius}px`}}>
            <Table aria-label="rolls table">
                <TableHead>
                    <TableRow sx={{backgroundColor: theme.palette.primary.main}}>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>ID</TableCell>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>Name</TableCell>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>Artikelnummer</TableCell>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>Charge</TableCell>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>Menge</TableCell>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>Ort</TableCell>
                        <TableCell align="right" sx={{color: theme.palette.background.paper, fontWeight: 600}}>
                            Aktionen
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rolls.map((roll) => {
                        const isDeleting = deletingIds.has(roll.id);

                        return (
                            <TableRow key={roll.id} sx={{'&:hover': {backgroundColor: `rgba(0, 0, 0, 0.02)`}}}>
                                <TableCell>{String(roll.id)}</TableCell>
                                <TableCell>{roll.name || '-'}</TableCell>
                                <TableCell>{roll.articleNumber}</TableCell>
                                <TableCell>{roll.batch}</TableCell>
                                <TableCell>{roll.quantity}</TableCell>
                                <TableCell>{roll.location}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        disabled={isDeleting}
                                        onClick={() => void onDelete(roll.id)}
                                        aria-label={`delete roll ${roll.id}`}
                                    >
                                        {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
