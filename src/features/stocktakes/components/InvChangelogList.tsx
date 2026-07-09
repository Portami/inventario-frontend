import ListPage from '@/components/ListPage.tsx';
import {fetchStocktakeItems} from '@/services/backend.ts';
import {FeltStocktakeItemDto, ITEM_STATE_LABELS, ItemState, PROBLEM_STATE_COLORS, RESOLUTION_TYPES_LABELS} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';

interface InvChangelogListProps {
    inventoryId: string;
}

type ItemAuditing = {
    id: string;
    item: FeltStocktakeItemDto;
};

export function InvChangelogList({inventoryId}: InvChangelogListProps) {
    const [itemAuditings, setItemAuditings] = useState<ItemAuditing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const items = await fetchStocktakeItems(inventoryId, '');
                setItemAuditings(
                    items.map((item) => {
                        const itemAuditing: ItemAuditing = {
                            id: item.itemId.toString(),
                            item: item,
                        };
                        return itemAuditing;
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
            flex: 1,
            valueGetter: (value, row) => {
                return ITEM_STATE_LABELS[row.item.status];
            },
            cellClassName: 'bold-cell',
        },
        {
            field: 'resolutionType',
            headerName: 'Lösungsart',
            flex: 2,
            valueGetter: (value, row) => {
                return !row.item.resolution ? '' : RESOLUTION_TYPES_LABELS[row.item.resolution.resolution];
            },
        },
        {
            field: 'comment',
            headerName: 'Bemerkung',
            flex: 2,
            valueGetter: (value, row) => {
                return !row.item.resolution ? '' : row.item.resolution.comment;
            },
        },
        {
            field: 'expectedStorage',
            headerName: 'Erwartetes Lager',
            flex: 2,
            valueGetter: (value, row) => {
                return row.item.expectedStorageName;
            },
        },
        {
            field: 'newStorage',
            headerName: 'Neues Lager',
            flex: 2,
            valueGetter: (value, row) => {
                return !row.item.resolution ? '' : row.item.resolution.newStorageName;
            },
        },
    ];

    return (
        <ListPage title={'Lösungsprotokoll'} isLoading={isLoading} isEmpty={false} error={error} onErrorClose={() => setError('')}>
            <DataGrid
                rows={itemAuditings}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Keine Elemente.'}}
                getRowClassName={(params) => {
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
        </ListPage>
    );
}
