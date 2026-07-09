import {fetchOffers, offerKeys} from '@/features/offers/api';
import {OfferSummaryDto} from '@/features/offers/types';
import {toErrorMessage} from '@/shared/utils/pageUtils';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

/** State returned by the useOffers hook for the offers list page. */
export interface UseOffersReturn {
    offers: OfferSummaryDto[];
    loading: boolean;
    error: string;
    /** Invalidates the query cache and reloads all offers from the backend. */
    refetch: () => Promise<void>;
}

/** Fetches the full list of offer summaries, exposing a refetch action for post-mutation updates. */
export function useOffers(): UseOffersReturn {
    const queryClient = useQueryClient();
    const query = useQuery({queryKey: offerKeys.list, queryFn: fetchOffers});

    const refetch = useCallback(async () => {
        await queryClient.invalidateQueries({queryKey: offerKeys.list});
    }, [queryClient]);

    return {
        offers: query.data ?? [],
        loading: query.isPending,
        error: query.error ? toErrorMessage(query.error, 'Offerten konnten nicht geladen werden') : '',
        refetch,
    };
}
