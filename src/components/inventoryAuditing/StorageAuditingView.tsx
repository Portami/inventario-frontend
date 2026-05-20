import DetailPage from '@/components/DetailPage.tsx';
import ItemAuditingList from '@/components/inventoryAuditing/ItemAuditingList.tsx';
import ListPage from '@/components/ListPage.tsx';
import {ItemAuditing, StorageAuditing} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function StorageAuditingView() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [storageAuditing, setStorageAuditing] = useState<StorageAuditing>();
    const [itemAuditings, setItemAuditings] = useState<ItemAuditing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                //setStorageAuditing()
                //setItemAuditings(await fetchProducts());
            } catch (err) {
                setError(toErrorMessage(err, 'Produkte konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    return (
        <DetailPage title={'storageAuditing?.storage.name'} isLoading={isLoading} error={error} onBack={() => navigate(-1)}>
            <ItemAuditingList items={itemAuditings} />
            <ItemAuditingList items={itemAuditings} />
            <ItemAuditingList items={itemAuditings} />
        </DetailPage>
    );
}
