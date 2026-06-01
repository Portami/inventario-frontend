import {FeltStocktakeItemDto, ITEM_STATE, ItemState} from '@/types/inventoryAuditing.ts';
import {Box, Stack, Typography} from '@mui/material';

type ProblemStateCountsProps = {
    items: FeltStocktakeItemDto[];
};

const PROBLEM_STATE_LABELS: Record<ItemState, string> = {
    [ITEM_STATE.Initial]: 'Initial',
    [ITEM_STATE.Ok]: 'Ok',
    [ITEM_STATE.Missing]: 'Missing',
    [ITEM_STATE.WrongStorage]: 'Wrong Storage',
    [ITEM_STATE.RescanRequired]: 'Rescan Required',
    [ITEM_STATE.DuplicateScan]: 'Duplicate Scan',
    [ITEM_STATE.NotInAuditing]: 'Not In Auditing',
    [ITEM_STATE.UnknownStorage]: 'Unknown',
};

const PROBLEM_STATE_COLORS: Partial<Record<ItemState, {backgroundColor: string; color: string}>> = {
    [ITEM_STATE.Missing]: {
        backgroundColor: '#ffebee',
        color: '#b71c1c',
    },
    [ITEM_STATE.WrongStorage]: {
        backgroundColor: '#fff3e0',
        color: '#e65100',
    },
    [ITEM_STATE.RescanRequired]: {
        backgroundColor: '#e3f2fd',
        color: '#0d47a1',
    },
    [ITEM_STATE.DuplicateScan]: {
        backgroundColor: '#f3e5f5',
        color: '#4a148c',
    },
    [ITEM_STATE.NotInAuditing]: {
        backgroundColor: '#eeeeee',
        color: '#212121',
    },
    [ITEM_STATE.UnknownStorage]: {
        backgroundColor: '#eceff1',
        color: '#263238',
    },
};

function getProblemStateCounts(items: FeltStocktakeItemDto[]) {
    return items.reduce<Partial<Record<ItemState, number>>>((counts, item) => {
        if (item.status === ITEM_STATE.Ok || item.status === ITEM_STATE.Initial) {
            return counts;
        }

        counts[item.status] = (counts[item.status] ?? 0) + 1;
        return counts;
    }, {});
}

export default function ProblemStateCounts({items}: ProblemStateCountsProps) {
    const problemCounts = getProblemStateCounts(items);

    const entries = Object.entries(problemCounts) as [ItemState, number][];

    if (entries.length === 0) {
        return null;
    }

    return (
        <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap'}} useFlexGap>
            {entries.map(([state, count]) => {
                const colors = PROBLEM_STATE_COLORS[state] ?? {
                    backgroundColor: '#eeeeee',
                    color: '#212121',
                };

                return (
                    <Box
                        key={state}
                        sx={{
                            backgroundColor: colors.backgroundColor,
                            color: colors.color,
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 1,
                            minWidth: 90,
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="body2" sx={{fontWeight: 600}}>
                            {count} {PROBLEM_STATE_LABELS[state]}
                        </Typography>
                    </Box>
                );
            })}
        </Stack>
    );
}
