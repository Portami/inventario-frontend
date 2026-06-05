import {FeltStocktakeItemDto, ITEM_STATE, ITEM_STATE_LABELS, ItemState, PROBLEM_STATE_COLORS} from '@/types/inventoryAuditing.ts';
import {Box, Stack, Typography} from '@mui/material';

type ProblemStateCountsProps = {
    items: FeltStocktakeItemDto[];
};

function getProblemStateCounts(items: FeltStocktakeItemDto[]) {
    return items.reduce<Partial<Record<ItemState, number>>>((counts, item) => {
        const status = item.status ?? ITEM_STATE.UNKNOWN;

        if (status === ITEM_STATE.OK || status === ITEM_STATE.INITIAL) {
            return counts;
        }

        counts[status] = (counts[status] ?? 0) + 1;
        return counts;
    }, {});
}

export default function ProblemStateCounts({items}: ProblemStateCountsProps) {
    const faultyItems = items.filter((item) => !item.resolution);
    const problemCounts = getProblemStateCounts(faultyItems);

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
                        <Typography variant="body2" sx={{fontWeight: 500}}>
                            {count} {ITEM_STATE_LABELS[state]}
                        </Typography>
                    </Box>
                );
            })}
        </Stack>
    );
}
