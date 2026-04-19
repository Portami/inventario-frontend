import DetailPage from '@/components/DetailPage';
import {fetchRollDetails} from '@/services/backend';
import {colorLabels, typeLabels} from '@/types/felt';
import {Card, CardContent, Stack, Typography} from '@mui/material';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function RollDetail() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [rollName, setRollName] = useState('');
    const [rollColor, setRollColor] = useState('');
    const [rollType, setRollType] = useState('');
    const [articleNumber, setArticleNumber] = useState('');

    useEffect(() => {
        const loadRollDetails = async () => {
            if (!id) return;

            setIsLoading(true);
            setError('');
            try {
                const roll = await fetchRollDetails(id);
                setRollName(roll.name || 'N/A');
                setArticleNumber(roll.articleNumber);
                setRollColor(roll.felt?.color ? colorLabels[roll.felt.color] : '-');
                setRollType(roll.felt?.type ? typeLabels[roll.felt.type] : '-');
            } catch (err) {
                const message = err instanceof Error ? `Error: ${err.message}` : 'Failed to load roll details';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadRollDetails();
    }, [id]);

    return (
        <DetailPage title={rollName || 'Rollendetails'} isLoading={isLoading} error={error} onBack={() => navigate(-1)} onErrorClose={() => setError('')}>
            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <div>
                            <Typography variant="body2" color="textSecondary">
                                Artikelnummer
                            </Typography>
                            <Typography variant="body1">{articleNumber}</Typography>
                        </div>
                        <div>
                            <Typography variant="body2" color="textSecondary">
                                Farbe
                            </Typography>
                            <Typography variant="body1">{rollColor}</Typography>
                        </div>
                        <div>
                            <Typography variant="body2" color="textSecondary">
                                Typ
                            </Typography>
                            <Typography variant="body1">{rollType}</Typography>
                        </div>
                    </Stack>
                </CardContent>
            </Card>
        </DetailPage>
    );
}
