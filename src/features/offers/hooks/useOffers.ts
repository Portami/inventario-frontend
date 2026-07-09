import {fetchOffers} from '@/features/offers/api';
import {OfferSummaryDto} from '@/features/offers/types';
import {toErrorMessage} from '@/shared/utils/pageUtils';
import {useCallback, useEffect, useState} from 'react';

/** State returned by the useOffers hook for the offers list page. */
export interface UseOffersReturn {
    offers: OfferSummaryDto[];
    loading: boolean;
    error: string;
    /** Reloads all offers from the backend. */
    refetch: () => Promise<void>;
}

/** Fetches the full list of offer summaries, exposing a refetch action for post-mutation updates. */
export function useOffers(): UseOffersReturn {
    const [offers, setOffers] = useState<OfferSummaryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchOffers();
            setOffers(data);
            setError('');
        } catch (err) {
            setError(toErrorMessage(err, 'Offerten konnten nicht geladen werden'));
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async () => {
        await load();
    }, [load]);

    useEffect(() => {
        void load();
    }, [load]);

    return {offers, loading, error, refetch};
}
