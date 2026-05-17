import {fetchOffers} from '@/services/backend';
import {cacheInvalidate} from '@/services/cache';
import {OfferSummaryDto} from '@/types/offerte';
import {toErrorMessage} from '@/utils/pageUtils';
import {useCallback, useEffect, useState} from 'react';

export interface UseOffersReturn {
    offers: OfferSummaryDto[];
    loading: boolean;
    error: string;
    refetch: () => Promise<void>;
}

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
        cacheInvalidate('offers');
        await load();
    }, [load]);

    useEffect(() => {
        void load();
    }, [load]);

    return {offers, loading, error, refetch};
}
