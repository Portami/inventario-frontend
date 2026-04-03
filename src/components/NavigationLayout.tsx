import AddIcon from '@mui/icons-material/Add';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {AppBar, Box, Button, Container, Drawer, IconButton, List, ListItem, Toolbar, Typography} from '@mui/material';
import {NavLink, Outlet} from 'react-router';

const navigationWidth = 240;

export default function NavigationLayout() {
    return (
        <Box sx={{display: 'flex'}}>
            <AppBar position={'fixed'} sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <Toolbar>
                    <Box component={NavLink} to={'/'} sx={{display: 'inline-flex', lineHeight: 0}}>
                        <Box component={'img'} src={'/src/assets/logo.png'} alt={'Logo'} sx={{height: (theme) => theme.mixins.toolbar.minHeight}} />
                    </Box>
                    <Box sx={{flexGrow: 1}} />
                    <IconButton size={'large'} color={'inherit'}>
                        <NotificationsNoneIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant={'permanent'}
                sx={{
                    width: navigationWidth,
                    [`& .MuiDrawer-paper`]: {width: navigationWidth, p: 4},
                }}
            >
                <Toolbar />
                <Button variant={'contained'} startIcon={<AddIcon />}>
                    Filter
                </Button>
                <Typography variant={'subtitle2'} sx={{mt: 4}}>
                    Shop
                </Typography>
                <List component={'nav'}>
                    <ListItem disableGutters>
                        <Button component={NavLink} to={'/rollen'} startIcon={<Inventory2OutlinedIcon />} sx={{justifyContent: 'flex-start'}}>
                            Rollen
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button component={NavLink} to={'/inventar'} startIcon={<ContentPasteOutlinedIcon />} sx={{justifyContent: 'flex-start'}}>
                            Inventar
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button component={NavLink} to={'/lager'} startIcon={<HomeOutlinedIcon />} sx={{justifyContent: 'flex-start'}}>
                            Lager
                        </Button>
                    </ListItem>
                    <ListItem disableGutters>
                        <Button component={NavLink} to={'/shopping'} startIcon={<ShoppingCartOutlinedIcon />} sx={{justifyContent: 'flex-start'}}>
                            Shopping
                        </Button>
                    </ListItem>
                </List>
                <Box sx={{flexGrow: 1}} />
                <Button startIcon={<SettingsIcon />} sx={{justifyContent: 'flex-start'}}>
                    Settings
                </Button>
                <Button startIcon={<LogoutIcon />} sx={{mt: 2, justifyContent: 'flex-start'}}>
                    Logout
                </Button>
            </Drawer>
            <Container>
                <Toolbar />
                <Outlet />
            </Container>
        </Box>
    );
}
