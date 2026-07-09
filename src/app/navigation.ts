import type {SvgIconComponent} from '@mui/icons-material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PrintIcon from '@mui/icons-material/Print';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

export interface NavChild {
    label: string;
    path: string;
    /** Match the route exactly (react-router NavLink `end`), for children that duplicate the parent path. */
    end?: boolean;
}

export interface NavEntry {
    label: string;
    path: string;
    icon: SvgIconComponent;
    children?: NavChild[];
}

/** The sidebar navigation tree. Add a page here instead of editing NavigationLayout. */
export const NAVIGATION: NavEntry[] = [
    {
        label: 'Produkte',
        path: '/products',
        icon: CategoryOutlinedIcon,
        children: [
            {label: 'Übersicht', path: '/products', end: true},
            {label: 'Kategorien', path: '/products/categories'},
        ],
    },
    {label: 'Scannen', path: '/scan', icon: QrCodeIcon},
    {label: 'Etiketten', path: '/labels', icon: PrintIcon},
    {
        label: 'Filze',
        path: '/felts',
        icon: LayersOutlinedIcon,
        children: [
            {label: 'Übersicht', path: '/felts'},
            {label: 'Nachbestellen', path: '/felts/reorder'},
        ],
    },
    {
        label: 'Inventur',
        path: '/inventory',
        icon: AssessmentIcon,
        children: [
            {label: 'Übersicht', path: '/inventory'},
            {label: 'Archiv', path: '/inventory/archive'},
        ],
    },
    {label: 'Offerten', path: '/offers', icon: ReceiptLongOutlinedIcon},
    {label: 'Kunden', path: '/customers', icon: PeopleOutlinedIcon},
    {label: 'Statistiken', path: '/statistics', icon: BarChartOutlinedIcon},
];
