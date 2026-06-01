import logo from '@/assets/logo.svg';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PrintIcon from '@mui/icons-material/Print';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import {AppBar, Box, Button, Container, Drawer, IconButton, List, ListItem, Toolbar, Tooltip, Typography, useTheme} from '@mui/material';
import React, {useState} from 'react';
import {NavLink, Outlet, useLocation} from 'react-router';

const NAV_EXPANDED = 240;
const NAV_COLLAPSED = 64;

interface NavBtnProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
}

function NavBtn({to, icon, label, collapsed}: NavBtnProps) {
    const theme = useTheme();
    const btn = (
        <Button
            component={NavLink}
            to={to}
            startIcon={icon}
            sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
                minWidth: 0,
                px: collapsed ? 1 : 1.5,
                color: theme.palette.text.primary,
                '& .MuiButton-startIcon': {margin: collapsed ? 0 : undefined},
                '&.active': {color: theme.palette.primary.main, fontWeight: 600},
            }}
        >
            {!collapsed && label}
        </Button>
    );
    return collapsed ? (
        <Tooltip title={label} placement="right">
            {btn}
        </Tooltip>
    ) : (
        btn
    );
}

export default function NavigationLayout() {
    const theme = useTheme();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const navWidth = collapsed ? NAV_COLLAPSED : NAV_EXPANDED;

    return (
        <Box sx={{display: 'flex'}}>
            <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: theme.palette.primary.main}}>
                <Toolbar>
                    <Box component={NavLink} to="/" sx={{display: 'inline-flex', lineHeight: 0}}>
                        <Box component="img" src={logo} alt="Logo" sx={{height: (theme) => theme.mixins.toolbar.minHeight}} />
                    </Box>
                    <Box sx={{flexGrow: 1}} />
                    <IconButton size="large" sx={{color: theme.palette.background.paper}}>
                        <NotificationsNoneIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: navWidth,
                    flexShrink: 0,
                    transition: 'width 0.2s ease',
                    [`& .MuiDrawer-paper`]: {
                        width: navWidth,
                        overflow: 'hidden',
                        transition: 'width 0.2s ease',
                        backgroundColor: theme.palette.background.default,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 0,
                    },
                }}
            >
                <Toolbar />

                {/* Collapse toggle */}
                <Box sx={{display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', px: 1, pt: 1}}>
                    <IconButton size="small" onClick={() => setCollapsed((c) => !c)} sx={{color: theme.palette.text.secondary}}>
                        {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                    </IconButton>
                </Box>

                {/* Section heading */}
                {!collapsed && (
                    <Typography variant="h4" sx={{px: 4, mt: 2, mb: 1}}>
                        Inventar
                    </Typography>
                )}

                <List component="nav" sx={{px: collapsed ? 1 : 3, flex: 1}}>
                    <ListItem disableGutters>
                        <NavBtn to="/products" icon={<CategoryOutlinedIcon />} label="Produkte" collapsed={collapsed} />
                    </ListItem>
                    <ListItem disableGutters>
                        <NavBtn to="/scan" icon={<QrCodeIcon />} label="Scannen" collapsed={collapsed} />
                    </ListItem>
                    <ListItem disableGutters>
                        <NavBtn to="/labels" icon={<PrintIcon />} label="Etiketten" collapsed={collapsed} />
                    </ListItem>

                    {/* Filze with sub-items */}
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <ListItem disableGutters>
                            <NavBtn to="/felts" icon={<LayersOutlinedIcon />} label="Filze" collapsed={collapsed} />
                        </ListItem>
                        {!collapsed && (
                            <List component="div" disablePadding sx={{width: '100%'}}>
                                <ListItem
                                    disableGutters
                                    sx={{
                                        ml: 1.5,
                                        pl: 2,
                                        borderLeft:
                                            location.pathname === '/felts' ? `3px solid ${theme.palette.primary.main}` : `3px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Button
                                        component={NavLink}
                                        to="/felts"
                                        sx={{
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            color: theme.palette.text.primary,
                                            '&.active': {
                                                color: location.pathname === '/felts' ? theme.palette.primary.main : theme.palette.text.primary,
                                                fontWeight: 600,
                                            },
                                        }}
                                    >
                                        Übersicht
                                    </Button>
                                </ListItem>
                                <ListItem
                                    disableGutters
                                    sx={{
                                        ml: 1.5,
                                        pl: 2,
                                        borderLeft:
                                            location.pathname === '/felts/reorder'
                                                ? `3px solid ${theme.palette.primary.main}`
                                                : `3px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Button
                                        component={NavLink}
                                        to="/felts/reorder"
                                        sx={{
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            color: theme.palette.text.primary,
                                            '&.active': {
                                                color: location.pathname === '/felts/reorder' ? theme.palette.primary.main : theme.palette.text.primary,
                                                fontWeight: 600,
                                            },
                                        }}
                                    >
                                        Nachbestellen
                                    </Button>
                                </ListItem>
                            </List>
                        )}
                    </Box>
                    <ListItem disableGutters>
                        <NavBtn to="/inventory" icon={<AssessmentIcon />} label="Inventur" collapsed={collapsed} />
                    </ListItem>
                    <ListItem disableGutters>
                        <NavBtn to="/offers" icon={<ReceiptLongOutlinedIcon />} label="Offerten" collapsed={collapsed} />
                    </ListItem>
                    <ListItem disableGutters>
                        <NavBtn to="/customers" icon={<PeopleOutlinedIcon />} label="Kunden" collapsed={collapsed} />
                    </ListItem>
                </List>

                {/* Logout */}
                <Box sx={{px: collapsed ? 1 : 3, pb: 2}}>
                    <Tooltip title={collapsed ? 'Abmelden' : ''} placement="right">
                        <Button
                            startIcon={<LogoutIcon />}
                            sx={{
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                width: '100%',
                                minWidth: 0,
                                px: collapsed ? 1 : 1.5,
                                color: theme.palette.text.primary,
                                '& .MuiButton-startIcon': {margin: collapsed ? 0 : undefined},
                            }}
                        >
                            {!collapsed && 'Abmelden'}
                        </Button>
                    </Tooltip>
                </Box>
            </Drawer>

            <Container>
                <Toolbar />
                <Outlet />
            </Container>
        </Box>
    );
}
