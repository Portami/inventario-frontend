import {Product} from '@/types/product';
import {Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme} from '@mui/material';

type ProductSelectionTableProps = {
    readonly products: Product[];
    readonly selectedIds: Set<string>;
    readonly onSelectAll: () => void;
    // eslint-disable-next-line no-unused-vars -- Parameter required for callback signature even if not used in type definition
    readonly onSelectProduct: (productId: string) => void;
};

export default function ProductSelectionTable({products, selectedIds, onSelectAll, onSelectProduct}: ProductSelectionTableProps) {
    const theme = useTheme();

    return (
        <TableContainer component={Paper} sx={{borderRadius: `${theme.shape.borderRadius}px`}}>
            <Table>
                <TableHead>
                    <TableRow sx={{backgroundColor: theme.palette.primary.main}}>
                        <TableCell padding="checkbox" sx={{color: theme.palette.background.paper, fontWeight: 600}}>
                            <Checkbox
                                checked={selectedIds.size === products.length && products.length > 0}
                                indeterminate={selectedIds.size > 0 && selectedIds.size < products.length}
                                onChange={onSelectAll}
                                sx={{color: theme.palette.background.paper}}
                            />
                        </TableCell>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>Name</TableCell>
                        <TableCell
                            sx={{
                                color: theme.palette.background.paper,
                                fontWeight: 600,
                            }}
                        >
                            Artikelnummer
                        </TableCell>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>Farbe</TableCell>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>Dicke</TableCell>
                        <TableCell sx={{color: theme.palette.background.paper, fontWeight: 600}}>ID</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                        <TableRow
                            key={product.id}
                            hover
                            sx={{
                                backgroundColor: selectedIds.has(String(product.id)) ? `rgba(139, 92, 246, 0.08)` : 'inherit',
                                '&:hover': {backgroundColor: `rgba(0, 0, 0, 0.02)`},
                            }}
                        >
                            <TableCell padding="checkbox">
                                <Checkbox checked={selectedIds.has(String(product.id))} onChange={() => onSelectProduct(String(product.id))} />
                            </TableCell>
                            <TableCell>{product.name || 'N/A'}</TableCell>
                            <TableCell>{product.articleNumber}</TableCell>
                            <TableCell>{product.felt?.color || '-'}</TableCell>
                            <TableCell>{product.felt?.type || '-'}</TableCell>
                            <TableCell sx={{fontFamily: 'monospace'}}>{product.id}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
