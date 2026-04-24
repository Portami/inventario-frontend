import ConstructionIcon from '@mui/icons-material/Construction';
import {Box, Card, CardContent, Stack, Typography, useTheme} from '@mui/material';

type PageUnderConstructionProps = {
    title: string;
};

export default function PageUnderConstruction({title}: Readonly<PageUnderConstructionProps>) {
    const theme = useTheme();

    return (
        <Box sx={{p: 3, maxWidth: 800, mx: 'auto'}}>
            <Card>
                <CardContent>
                    <Stack spacing={3} sx={{alignItems: 'center', textAlign: 'center'}}>
                        <ConstructionIcon sx={{fontSize: 64, color: theme.palette.primary.main}} />

                        <Typography variant="h3" component="h1">
                            {title}
                        </Typography>

                        <Typography variant="body1" color="textSecondary">
                            Diese Seite wird noch erstellt. Kommt bald...
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
