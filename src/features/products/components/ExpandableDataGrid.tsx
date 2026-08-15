import {KeyboardArrowDown, KeyboardArrowRight} from '@mui/icons-material';
import {IconButton} from '@mui/material';
import {DataGrid, DataGridProps, GridColDef, GridRowId, GridRowParams, GridSortModel} from '@mui/x-data-grid';
import {useMemo, useState} from 'react';

export type ExpandableDataGridRow<TParent, TChild> =
    | {
          rowId: GridRowId;
          id: GridRowId;
          rowType: 'parent';
          parent: TParent;
          child?: never;
      }
    | {
          rowId: GridRowId;
          id: GridRowId;
          rowType: 'child';
          parent: TParent;
          child: TChild;
      };

type ExpandableDataGridProps<TParent, TChild> = Omit<DataGridProps<ExpandableDataGridRow<TParent, TChild>>, 'rows' | 'columns' | 'getRowId'> & {
    items: TParent[];
    columns: GridColDef<ExpandableDataGridRow<TParent, TChild>>[];
    getParentId: (...args: [TParent]) => GridRowId;
    getChildren: (...args: [TParent]) => TChild[];
    getChildId: (...args: [TChild, TParent]) => GridRowId;
    getParentSortValue?: (...args: [TParent, string]) => string | number | null | undefined;
    onParentRowClick?: (...args: [TParent]) => void;
    onChildRowClick?: (...args: [TChild, TParent]) => void;
    expandColumnWidth?: number;
};

export default function ExpandableDataGrid<TParent, TChild>({
    items,
    columns,
    getParentId,
    getChildren,
    getChildId,
    getParentSortValue,
    onParentRowClick,
    onChildRowClick,
    expandColumnWidth = 60,
    ...dataGridProps
}: ExpandableDataGridProps<TParent, TChild>) {
    const [expanded, setExpanded] = useState<Set<GridRowId>>(new Set());
    const [sortModel, setSortModel] = useState<GridSortModel>([]);

    const toggleExpanded = (id: GridRowId) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const sortedItems = useMemo(() => {
        if (sortModel.length === 0 || !getParentSortValue) {
            return items;
        }

        const [{field, sort}] = sortModel;

        if (!sort) {
            return items;
        }

        return [...items].sort((a, b) => {
            const aValue = getParentSortValue(a, field);
            const bValue = getParentSortValue(b, field);

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let result: number;

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                result = aValue - bValue;
            } else {
                result = String(aValue).localeCompare(String(bValue), undefined, {
                    numeric: true,
                    sensitivity: 'base',
                });
            }

            return sort === 'asc' ? result : -result;
        });
    }, [items, sortModel, getParentSortValue]);

    const rows = useMemo(() => {
        return sortedItems.flatMap((parent) => {
            const parentId = getParentId(parent);
            const children = getChildren(parent);

            const parentRow: ExpandableDataGridRow<TParent, TChild> = {
                rowId: `parent-${parentId}`,
                id: parentId,
                rowType: 'parent',
                parent,
            };

            if (!expanded.has(parentId)) {
                return [parentRow];
            }

            const childRows: ExpandableDataGridRow<TParent, TChild>[] = children.map((child) => {
                const childId = getChildId(child, parent);

                return {
                    rowId: `child-${parentId}-${childId}`,
                    id: childId,
                    rowType: 'child',
                    parent,
                    child,
                };
            });

            return [parentRow, ...childRows];
        });
    }, [sortedItems, expanded, getParentId, getChildren, getChildId]);

    const expandColumn: GridColDef<ExpandableDataGridRow<TParent, TChild>> = {
        field: 'expand',
        headerName: '',
        width: expandColumnWidth,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({row}) => {
            if (row.rowType === 'child') {
                return null;
            }

            const parentId = getParentId(row.parent);
            const children = getChildren(row.parent);

            if (children.length === 0) {
                return null;
            }

            return (
                <IconButton
                    size="small"
                    onClick={(event) => {
                        event.stopPropagation();
                        toggleExpanded(parentId);
                    }}
                >
                    {expanded.has(parentId) ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                </IconButton>
            );
        },
    };

    const handleRowClick = (params: GridRowParams<ExpandableDataGridRow<TParent, TChild>>) => {
        if (params.row.rowType === 'parent') {
            onParentRowClick?.(params.row.parent);
        } else {
            onChildRowClick?.(params.row.child, params.row.parent);
        }
    };

    return (
        <DataGrid
            rows={rows}
            columns={[expandColumn, ...columns]}
            getRowId={(row) => row.rowId}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            disableRowSelectionOnClick
            getRowClassName={(params) => (params.row.rowType === 'child' ? 'expandable-grid-child-row' : '')}
            onRowClick={handleRowClick}
            {...dataGridProps}
        />
    );
}
