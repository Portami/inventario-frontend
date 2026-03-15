import {fetchHelloWorld} from '@/services/backend';
import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

export default function Demo() {
    const [text, setText] = useState<string>(''); // State to hold the text

    const handleFetchText = async () => {
        try {
            const fetchedText = await fetchHelloWorld();
            setText(fetchedText);
        } catch (error) {
            setText('Failed to fetch text from API' + (error instanceof Error ? `: ${error.message}` : ''));
        }
    };

    return (
        <div className="demo-page">
            <header className="demo-header">
                <Typography variant="h4">Hello React</Typography>
            </header>

            <main className="demo-content">
                <Box className="demo-box">
                    <Typography variant="body1">If you can see this page, React, MUI, SCSS and the theme are working.</Typography>

                    <Button variant="contained" onClick={handleFetchText}>
                        Fetch Text
                    </Button>

                    <Typography variant="body1" sx={{marginTop: 2}}>
                        {text || 'Click the button to fetch text from the backend.'}
                    </Typography>
                </Box>
            </main>

            <footer className="demo-footer">
                <Typography variant="body2">Demo page</Typography>
            </footer>
        </div>
    );
}
