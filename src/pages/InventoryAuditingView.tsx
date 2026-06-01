import DetailPage from '@/components/DetailPage.tsx';
import StorageAuditingCard from '@/components/inventoryAuditing/StorageAuditingCard.tsx';
import StorageAuditingList from '@/components/inventoryAuditing/StorageAuditingList.tsx';
import {fetchStocktakeById} from '@/services/backend.ts';
import {FeltStocktakeDto} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function InventoryAuditingView() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();

    const [inventoryAuditing, setinventoryAuditing] = useState<FeltStocktakeDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                setinventoryAuditing(await fetchStocktakeById(id));
            } catch (err) {
                setError(toErrorMessage(err, 'Inventur konnte nicht geladen werden.'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const mainLoad =
        inventoryAuditing && inventoryAuditing.storageLists.length > 1 ? (
            <StorageAuditingList inventoryId={inventoryAuditing.id.toString()} storages={inventoryAuditing.storageLists} />
        ) : inventoryAuditing && inventoryAuditing.storageLists.length === 1 ? (
            <StorageAuditingCard inventoryId={inventoryAuditing.id.toString()} storage={inventoryAuditing.storageLists[0]} />
        ) : null;

    return (
        <DetailPage title={`Inventory Auditing ${inventoryAuditing?.createdAt.toString()}`} isLoading={isLoading} error={error} onBack={() => navigate(-1)}>
            {mainLoad}
        </DetailPage>
    );
}
