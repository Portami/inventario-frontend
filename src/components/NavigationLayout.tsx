import logo from '@/assets/logo.svg';
import AddIcon from '@mui/icons-material/Add';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PrintIcon from '@mui/icons-material/Print';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {AppBar, Box, Button, Container, Drawer, IconButton, List, ListItem, Toolbar, Typography, useTheme} from '@mui/material';
import {NavLink, Outlet} from 'react-router';

const navigationWidth = 240;

export default function NavigationLayout() {
    const theme = useTheme();

    return (
        <Box sx={{display: 'flex'}}>
            <AppBar position={'fixed'} sx={{zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: theme.palette.primary.main}}>
                <Toolbar>
                    <Box component={NavLink} to={'/'} sx={{display: 'inline-flex', lineHeight: 0}}>
                        <Box component={'img'} src={logo} alt={'Logo'} sx={{height: (theme) => theme.mixins.toolbar.minHeight}} />
                    </Box>
                    <Box sx={{flexGrow: 1}} />
                    <IconButton size={'large'} sx={{color: theme.palette.background.paper}}>
                        <NotificationsNoneIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant={'permanent'}
                sx={{
                    width: navigationWidth,
                    [`& .MuiDrawer-paper`]: {
                        width: navigationWidth,
                        p: 4,
                        backgroundColor: theme.palette.background.default,
                        borderRight: `1px solid ${theme.palette.divider}`,
                    },
                }}
            >
                <Toolbar />
                <Button variant={'contained'} startIcon={<AddIcon />} sx={{textTransform: 'none'}}>
                    Filter
                </Button>
                <Typography variant={'h4'} sx={{mt: 4, mb: 2}}>
                    Inventar
                </Typography>
                <List component={'nav'}>
                    <ListItem disableGutters>
                        <Button
                            component={NavLink}
                            to={'/products'}
                            startIcon={<CategoryOutlinedIcon />}
                            sx={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                color: theme.palette.text.primary,
                                '&.active': {
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                },
                            }}
                        >
                            Produkte
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button
                            component={NavLink}
                            to={'/scan'}
                            startIcon={<QrCodeIcon />}
                            sx={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                color: theme.palette.text.primary,
                                '&.active': {
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                },
                            }}
                        >
                            Scannen
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button
                            component={NavLink}
                            to={'/labels'}
                            startIcon={<PrintIcon />}
                            sx={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                color: theme.palette.text.primary,
                                '&.active': {
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                },
                            }}
                        >
                            Etiketten
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button
                            component={NavLink}
                            to={'/felts'}
                            startIcon={<LayersOutlinedIcon />}
                            sx={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                color: theme.palette.text.primary,
                                '&.active': {
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                },
                            }}
                        >
                            Filze
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button
                            component={NavLink}
                            to={'/rolls'}
                            startIcon={<Inventory2OutlinedIcon />}
                            sx={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                color: theme.palette.text.primary,
                                '&.active': {
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                },
                            }}
                        >
                            Rollen
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button
                            component={NavLink}
                            to={'/inventory'}
                            startIcon={<ContentPasteOutlinedIcon />}
                            sx={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                color: theme.palette.text.primary,
                                '&.active': {
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                },
                            }}
                        >
                            Bestandsverwaltung
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button
                            component={NavLink}
                            to={'/storage'}
                            startIcon={<HomeOutlinedIcon />}
                            sx={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                color: theme.palette.text.primary,
                                '&.active': {
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                },
                            }}
                        >
                            Lagerung
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button
                            component={NavLink}
                            to={'/shopping'}
                            startIcon={<ShoppingCartOutlinedIcon />}
                            sx={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                color: theme.palette.text.primary,
                                '&.active': {
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                },
                            }}
                        >
                            Einkaufen
                        </Button>
                    </ListItem>
                </List>
                <Box sx={{flexGrow: 1}} />
                <Button
                    startIcon={<SettingsIcon />}
                    sx={{
                        justifyContent: 'flex-start',
                        width: '100%',
                        color: theme.palette.text.primary,
                    }}
                >
                    Einstellungen
                </Button>
                <Button
                    startIcon={<LogoutIcon />}
                    sx={{
                        mt: 2,
                        justifyContent: 'flex-start',
                        width: '100%',
                        color: theme.palette.text.primary,
                    }}
                >
                    Abmelden
                </Button>
            </Drawer>
            <Container>
                <Toolbar />
                <Outlet />
            </Container>
        </Box>
    );
}
