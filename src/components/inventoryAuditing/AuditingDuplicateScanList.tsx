import {FeltStocktakeScanDto} from '@/types/inventoryAuditing.ts';
import {formatDateTime} from '@/utils/pageUtils.ts';
import {Box, Checkbox, Typography} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';

interface AuditingScanListProps {
    scans: FeltStocktakeScanDto[] | null;
    selectedScanIds: number[];
    onSelectedScanIdsChange: (scanIds: number[]) => void;
}

type AuditingScan = {
    id: string;
    scan: FeltStocktakeScanDto;
};

export function AuditingDuplicateScanList({scans, selectedScanIds, onSelectedScanIdsChange}: AuditingScanListProps) {
    if (!scans) return null;

    const auditingScans: AuditingScan[] = scans.map((scan) => ({
        id: scan.scanId.toString(),
        scan,
    }));

    const toggleScan = (scanId: number, checked: boolean) => {
        if (checked) {
            onSelectedScanIdsChange([...selectedScanIds, scanId]);
            return;
        }

        onSelectedScanIdsChange(selectedScanIds.filter((selectedScanId) => selectedScanId !== scanId));
    };

    const columns: GridColDef<AuditingScan>[] = [
        {
            field: 'selected',
            headerName: '',
            width: 56,
            renderCell: ({row}) => (
                <Checkbox checked={selectedScanIds.includes(row.scan.scanId)} onChange={(event) => toggleScan(row.scan.scanId, event.target.checked)} />
            ),
        },
        {
            field: 'scannedAt',
            headerName: 'Gescannt am',
            flex: 2,
            valueGetter: (value, row) => {
                return formatDateTime(row.scan.scannedAt);
            },
        },
    ];

    return (
        <Box sx={{}}>
            <Typography sx={{fontWeight: 500}}>Scans</Typography>
            <DataGrid
                rows={auditingScans}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Keine Elemente.'}}
                sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}}}
            />
        </Box>
    );
}
