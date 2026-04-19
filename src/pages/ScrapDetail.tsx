import DetailPage from '@/components/DetailPage';
import {fetchScrapDetails} from '@/services/backend';
import {Card, CardContent, Stack, Typography} from '@mui/material';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function ScrapDetail() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [scrapName, setScrapName] = useState('');
    const [articleNumber, setArticleNumber] = useState('');
    const [length, setLength] = useState(0);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const loadScrapDetails = async () => {
            if (!id) return;

            setIsLoading(true);
            setError('');
            try {
                const scrap = await fetchScrapDetails(id);
                setScrapName(scrap.name || 'N/A');
                setArticleNumber(scrap.articleNumber);
                setLength(scrap.length || 0);
                setWidth(scrap.width || 0);
            } catch (err) {
                const message = err instanceof Error ? `Error: ${err.message}` : 'Failed to load scrap details';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadScrapDetails();
    }, [id]);

    return (
        <DetailPage title={scrapName || 'Abfalldetails'} isLoading={isLoading} error={error} onBack={() => navigate(-1)} onErrorClose={() => setError('')}>
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
                                Länge (mm)
                            </Typography>
                            <Typography variant="body1">{length || '-'}</Typography>
                        </div>
                        <div>
                            <Typography variant="body2" color="textSecondary">
                                Breite (mm)
                            </Typography>
                            <Typography variant="body1">{width || '-'}</Typography>
                        </div>
                    </Stack>
                </CardContent>
            </Card>
        </DetailPage>
    );
}
