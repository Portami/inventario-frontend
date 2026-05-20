import DetailPage from '@/components/DetailPage.tsx';
import StorageAuditingList from '@/components/inventoryAuditing/StorageAuditingList.tsx';
import {InventoryAuditing, ItemAuditing, StorageAuditing} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function InventoryAuditingView() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [inventoryAuditing, setinventoryAuditing] = useState<InventoryAuditing | null>(null);
    const [storageAuditings, setStorageAuditings] = useState<StorageAuditing[]>([]);
    const [itemAuditings, setItemAuditings] = useState<ItemAuditing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                //setinventoryAuditing()
                //setStorageAuditing()
            } catch (err) {
                setError(toErrorMessage(err, 'Produkte konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    return (
        <DetailPage title={'Inventory Auditing ' + inventoryAuditing?.date.toString()} isLoading={isLoading} error={error} onBack={() => navigate(-1)}>
            <StorageAuditingList storages={storageAuditings} items={itemAuditings} />
        </DetailPage>
    );
}
