import {Box, Button, Typography} from '@mui/material';

export default function Demo() {
    return (
        <div className="demo-page">
            <header className="demo-header">
                <Typography variant="h4">Hello React</Typography>
            </header>

            <main className="demo-content">
                <Box className="demo-box">
                    <Typography variant="body1">If you can see this page, React, MUI, SCSS and the theme are working.</Typography>

                    <Button variant="contained">Test Button</Button>
                </Box>
            </main>

            <footer className="demo-footer">
                <Typography variant="body2">Demo page</Typography>
            </footer>
        </div>
    );
}
