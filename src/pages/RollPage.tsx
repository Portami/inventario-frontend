import ListPage from '@/components/ListPage';
import RollList, {RollItem} from '@/components/RollList';
import {getMockRolls} from '@/services/mock/rollMock';
import {createDeleteHandler} from '@/utils/pageUtils';
import {useState} from 'react';

export default function RollPage() {
    const [rolls, setRolls] = useState<RollItem[]>(getMockRolls());
    const [deletingIds, setDeletingIds] = useState<Set<number | string>>(new Set());
    const [error, setError] = useState('');

    const handleDeleteRoll = createDeleteHandler(setRolls, setDeletingIds, setError);

    return (
        <ListPage
            title="Rollen"
            description="Ansicht und Verwaltung aller Rollenbestände."
            isLoading={false}
            isEmpty={rolls.length === 0}
            emptyMessage="Keine Rollen gefunden."
            error={error}
            onErrorClose={() => setError('')}
        >
            <RollList rolls={rolls} onDelete={handleDeleteRoll} deletingIds={deletingIds} />
        </ListPage>
    );
}
