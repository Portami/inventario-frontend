import {NavChild, NAVIGATION} from './navigation';
import logo from '@/assets/logo.svg';
import {lookupRollCode, useHidScanner} from '@/features/scanning';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CropFreeIcon from '@mui/icons-material/CropFree';
import {
    Alert,
    AppBar,
    Box,
    Button,
    CircularProgress,
    Container,
    Drawer,
    IconButton,
    List,
    ListItem,
    Snackbar,
    Toolbar,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import React, {Suspense, useState} from 'react';
import {NavLink, Outlet, useLocation, useNavigate} from 'react-router';

const NAV_EXPANDED = 240;
const NAV_COLLAPSED = 64;

interface NavBtnProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
}

function NavBtn({to, icon, label, collapsed}: Readonly<NavBtnProps>) {
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

/** Indented sub-entry below a section; highlights fully only on an exact path match. */
function SubNavBtn({child}: Readonly<{child: NavChild}>) {
    const theme = useTheme();
    const location = useLocation();
    const exact = location.pathname === child.path;
    return (
        <ListItem
            disableGutters
            sx={{
                ml: 1.5,
                pl: 2,
                borderLeft: exact ? `3px solid ${theme.palette.primary.main}` : `3px solid ${theme.palette.divider}`,
            }}
        >
            <Button
                component={NavLink}
                to={child.path}
                end={child.end}
                sx={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    color: theme.palette.text.primary,
                    '&.active': {
                        color: exact ? theme.palette.primary.main : theme.palette.text.primary,
                        fontWeight: 600,
                    },
                }}
            >
                {child.label}
            </Button>
        </ListItem>
    );
}

export default function NavigationLayout() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const navWidth = collapsed ? NAV_COLLAPSED : NAV_EXPANDED;
    const [globalScanActive, setGlobalScanActive] = useState(false);
    const [showScanNotice, setShowScanNotice] = useState(false);
    const [scanError, setScanError] = useState('');

    useHidScanner(globalScanActive, async (code: string) => {
        const trimmed = code.trim();
        const padded = /^\d+$/.test(trimmed) ? trimmed.padStart(5, '0') : trimmed;
        try {
            const result = await lookupRollCode(padded);
            navigate(result.type === 'roll' ? `/roll/${result.id}` : `/scrap/${result.id}`);
        } catch {
            setScanError(`Code nicht gefunden: ${padded}`);
        }
    });

    return (
        <Box sx={{display: 'flex'}}>
            <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: theme.palette.primary.main}}>
                <Toolbar>
                    <Box component={NavLink} to="/" sx={{display: 'inline-flex', lineHeight: 0}}>
                        <Box component="img" src={logo} alt="Logo" sx={{height: (theme) => theme.mixins.toolbar.minHeight, filter: 'invert(1)'}} />
                    </Box>
                    <Box sx={{flexGrow: 1}} />
                    <Tooltip title={globalScanActive ? 'Scanner aktiv – klicken zum Deaktivieren' : 'Globalen Scanner aktivieren'}>
                        <IconButton
                            size="large"
                            onClick={() =>
                                setGlobalScanActive((s) => {
                                    if (!s) setShowScanNotice(true);
                                    return !s;
                                })
                            }
                            sx={{
                                color: globalScanActive ? '#66bb6a' : theme.palette.background.paper,
                                backgroundColor: globalScanActive ? 'rgba(102, 187, 106, 0.15)' : undefined,
                                '&:hover': {backgroundColor: globalScanActive ? 'rgba(102, 187, 106, 0.25)' : undefined},
                            }}
                        >
                            <CropFreeIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Snackbar
                open={showScanNotice}
                autoHideDuration={6000}
                onClose={() => setShowScanNotice(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert severity="info" onClose={() => setShowScanNotice(false)}>
                    Scanner aktiv – Tastatureingaben werden blockiert. Zum Tippen Scanner oben rechts wieder deaktivieren.
                </Alert>
            </Snackbar>

            <Snackbar open={!!scanError} autoHideDuration={4000} onClose={() => setScanError('')} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
                <Alert severity="error" onClose={() => setScanError('')}>
                    {scanError}
                </Alert>
            </Snackbar>

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
                    {NAVIGATION.map((entry) => (
                        <Box key={entry.path} sx={{display: 'flex', flexDirection: 'column'}}>
                            <ListItem disableGutters>
                                <NavBtn to={entry.path} icon={<entry.icon />} label={entry.label} collapsed={collapsed} />
                            </ListItem>
                            {!collapsed && entry.children && (
                                <List component="div" disablePadding sx={{width: '100%'}}>
                                    {entry.children.map((child) => (
                                        <SubNavBtn key={child.path} child={child} />
                                    ))}
                                </List>
                            )}
                        </Box>
                    ))}
                </List>
            </Drawer>

            <Container>
                <Toolbar />
                <Suspense
                    fallback={
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 8}}>
                            <CircularProgress />
                        </Box>
                    }
                >
                    <Outlet />
                </Suspense>
            </Container>
        </Box>
    );
}
