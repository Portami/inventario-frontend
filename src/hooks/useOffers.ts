import {fetchOffers} from '@/services/backend';
import {OfferSummaryDto} from '@/types/offerte';
import {toErrorMessage} from '@/utils/pageUtils';
import {useEffect, useState} from 'react';

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

    const load = async () => {
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
    };

    useEffect(() => {
        void load();
    }, []);

    return {offers, loading, error, refetch: load};
}
