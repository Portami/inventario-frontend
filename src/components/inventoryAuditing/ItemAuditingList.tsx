import {AuditingResolveDialog} from '@/components/inventoryAuditing/AuditingResolveDialog.tsx';
import {FeltStocktakeItemDto, ITEM_STATE_LABELS, ItemState, PROBLEM_STATE_COLORS, RESOLUTION_TYPES_LABELS} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import AddTaskIcon from '@mui/icons-material/AddTask';
import {Alert, Box, CircularProgress, IconButton, SxProps} from '@mui/material';
import {Theme} from '@mui/material/styles';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';

type ItemListProps = {
    inventoryId: string;
    items: FeltStocktakeItemDto[];
    hideStatus?: boolean;
    hideResolutions?: boolean;
    onResolve: () => void;
    sx?: SxProps<Theme>;
};

type ItemAuditing = {
    id: string;
    item: FeltStocktakeItemDto;
};

export default function ItemAuditingList({inventoryId, items, onResolve, hideStatus, hideResolutions, sx}: Readonly<ItemListProps>) {
    const [itemToResolve, setItemToResolve] = useState<FeltStocktakeItemDto | null>(null);
    const [itemAuditings, setItemAuditings] = useState<ItemAuditing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                setItemAuditings(
                    items.map((item) => {
                        const itemMap: ItemAuditing = {
                            id: item.itemId.toString(),
                            item: item,
                        };
                        return itemMap;
                    }),
                );
            } catch (err) {
                setError(toErrorMessage(err, 'Inventur konnte nicht geladen werden.'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const columns: GridColDef<ItemAuditing>[] = [
        {
            field: 'status',
            headerName: 'Status',
            flex: 2,
            valueGetter: (value, row) => {
                return ITEM_STATE_LABELS[row.item.status];
            },
            cellClassName: 'bold-cell',
        },
        {
            field: 'articleNumber',
            headerName: 'Artikelnr.',
            flex: 2,
            valueGetter: (value, row) => {
                return !row.item.rollOrScrap ? '' : row.item.rollOrScrap.articleNumber;
            },
        },
        {
            field: 'length',
            headerName: 'Länge (cm)',
            flex: 2,
            valueGetter: (value, row) => {
                return !row.item.rollOrScrap ? '' : row.item.rollOrScrap.length;
            },
        },
        {
            field: 'width',
            headerName: 'Breite (cm)',
            flex: 2,
            valueGetter: (value, row) => {
                return !row.item.rollOrScrap ? '' : row.item.rollOrScrap.width;
            },
        },
        {
            field: 'color',
            headerName: 'Farbe',
            flex: 2,
            valueGetter: (value, row) => {
                return !row.item.rollOrScrap ? '' : row.item.rollOrScrap.color;
            },
        },
        {
            field: 'resolve',
            headerName: 'Lösen',
            flex: 2,
            align: 'right',
            headerAlign: 'right',
            renderCell: ({row}) =>
                row.item.resolution === null ? (
                    <IconButton
                        size="small"
                        color="info"
                        aria-label="delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            setItemToResolve(row.item);
                        }}
                    >
                        <AddTaskIcon fontSize="medium" />
                    </IconButton>
                ) : (
                    RESOLUTION_TYPES_LABELS[row.item.resolution.resolution]
                ),
        },
    ];

    return (
        <Box sx={sx}>
            {error && (
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {isLoading && (
                <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                    <CircularProgress />
                </Box>
            )}

            {!isLoading && (
                <DataGrid
                    rows={itemAuditings}
                    columns={columns}
                    columnVisibilityModel={{
                        status: !hideStatus,
                        resolve: !hideResolutions,
                    }}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                    localeText={{noRowsLabel: 'Keine Elemente.'}}
                    getRowClassName={(params) => {
                        if (params.row.item.resolution) {
                            return 'row-resolved';
                        }

                        const hasProblemColor = PROBLEM_STATE_COLORS[params.row.item.status as ItemState];

                        if (hasProblemColor) {
                            return `row-state-${params.row.item.status}`;
                        }

                        return '';
                    }}
                    sx={{
                        '& .MuiDataGrid-row': {
                            cursor: 'pointer',
                        },
                        '& .bold-cell': {
                            fontWeight: 700,
                        },
                        '& .row-resolved': {
                            backgroundColor: '#e8f5e9',
                        },
                        '& .row-resolved:hover': {
                            backgroundColor: '#e8f5e9',
                        },

                        ...Object.entries(PROBLEM_STATE_COLORS).reduce(
                            (styles, [state, colors]) => ({
                                ...styles,
                                [`& .row-state-${state}`]: {
                                    backgroundColor: colors.backgroundColor,
                                    color: colors.color,
                                },
                                [`& .row-state-${state}:hover`]: {
                                    backgroundColor: colors.backgroundColor,
                                },
                            }),
                            {},
                        ),
                    }}
                />
            )}

            <AuditingResolveDialog
                item={itemToResolve}
                inventoryId={inventoryId}
                open={itemToResolve != null}
                onClose={() => setItemToResolve(null)}
                onResolve={onResolve}
            />
        </Box>
    );
}
