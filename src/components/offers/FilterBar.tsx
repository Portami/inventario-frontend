import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {Box, Card, CardContent, IconButton, InputAdornment, MenuItem, TextField, ToggleButton, ToggleButtonGroup} from '@mui/material';

export type SortOption = 'created_desc' | 'created_asc' | 'due_asc' | 'total_desc' | 'customer';
export type DateRange = 'all' | '10d' | '30d' | 'overdue';

interface FilterBarProps {
    q: string;
    setQ: (v: string) => void;
    sort: SortOption;
    setSort: (v: SortOption) => void;
    dateRange: DateRange;
    setDateRange: (v: DateRange) => void;
}

export default function FilterBar({q, setQ, sort, setSort, dateRange, setDateRange}: FilterBarProps) {
    return (
        <Card variant="outlined" sx={{borderColor: 'rgba(0,0,0,0.08)', mb: 3}}>
            <CardContent sx={{p: 2, '&:last-child': {pb: 2}}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                    <TextField
                        placeholder="Offerte, Kunde, Stadt …"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        size="small"
                        sx={{flex: 1, maxWidth: 480}}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{fontSize: 18, color: 'rgba(0,0,0,0.45)'}} />
                                    </InputAdornment>
                                ),
                                endAdornment: q ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setQ('')}>
                                            <CloseIcon sx={{fontSize: 16}} />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined,
                            },
                        }}
                    />
                    <ToggleButtonGroup value={dateRange} exclusive onChange={(_, v: DateRange) => v && setDateRange(v)} size="small">
                        <ToggleButton value="all" sx={{textTransform: 'none', fontSize: 12.5, px: 1.5}}>
                            Alle
                        </ToggleButton>
                        <ToggleButton value="7d" sx={{textTransform: 'none', fontSize: 12.5, px: 1.5}}>
                            7 Tage
                        </ToggleButton>
                        <ToggleButton value="30d" sx={{textTransform: 'none', fontSize: 12.5, px: 1.5}}>
                            30 Tage
                        </ToggleButton>
                        <ToggleButton value="overdue" sx={{textTransform: 'none', fontSize: 12.5, px: 1.5}}>
                            <ErrorOutlinedIcon sx={{fontSize: 15, mr: 0.5}} />
                            Überfällig
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Box sx={{flex: 1}} />
                    <TextField
                        select
                        label="Sortierung"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortOption)}
                        size="small"
                        sx={{minWidth: 200}}
                        slotProps={{inputLabel: {shrink: true}}}
                    >
                        <MenuItem value="created_desc">Neuste zuerst</MenuItem>
                        <MenuItem value="created_asc">Älteste zuerst</MenuItem>
                        <MenuItem value="due_asc">Fälligkeit ↑</MenuItem>
                        <MenuItem value="total_desc">Betrag ↓</MenuItem>
                        <MenuItem value="customer">Kunde A–Z</MenuItem>
                    </TextField>
                </Box>
            </CardContent>
        </Card>
    );
}
