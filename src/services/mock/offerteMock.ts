import {OFFER_PATH_A, OFFER_STATE} from '@/pages/constants/offerConstants';
import {CustomerDto, CustomerWithIdDto, FeltCatalogItem, LineItemDto, OfferDto, OfferSummaryDto, ProductCatalogItem} from '@/types/offerte';

// cSpell:disable
const SAMPLE_CUSTOMER: CustomerDto = {
    customerNumber: 'K-1042',
    name: 'Atelier Lindenhof GmbH',
    contactPerson: 'Sabine Brunner',
    email: 'sabine.brunner@atelier-lindenhof.ch',
    phone: '+41 44 312 88 04',
    street: 'Lindenhofstrasse 27',
    zip: '8001',
    city: 'Zürich',
    country: 'Schweiz',
    vatNumber: 'CHE-114.927.331 MWST',
};

const FELT_CATALOG: FeltCatalogItem[] = [
    {
        id: 1,
        articleNumber: 'F-MERINO-100-ANTHRAZIT',
        feltTypeName: 'Merino 100',
        color: 'Anthrazit',
        thickness: 3,
        density: 800,
        pricePerSqm: 84.5,
        supplierName: 'WoolFelt AG',
    },
    {
        id: 2,
        articleNumber: 'F-MERINO-100-NATUR',
        feltTypeName: 'Merino 100',
        color: 'Natur',
        thickness: 3,
        density: 800,
        pricePerSqm: 72.0,
        supplierName: 'WoolFelt AG',
    },
    {
        id: 3,
        articleNumber: 'F-MERINO-100-OLIV',
        feltTypeName: 'Merino 100',
        color: 'Oliv',
        thickness: 3,
        density: 800,
        pricePerSqm: 84.5,
        supplierName: 'WoolFelt AG',
    },
    {
        id: 4,
        articleNumber: 'F-DESIGN-3-NACHTBLAU',
        feltTypeName: 'Design 3',
        color: 'Nachtblau',
        thickness: 5,
        density: 1200,
        pricePerSqm: 36.0,
        supplierName: 'Filzmanufaktur Bern',
    },
    {
        id: 5,
        articleNumber: 'F-DESIGN-3-BORDEAUX',
        feltTypeName: 'Design 3',
        color: 'Bordeaux',
        thickness: 5,
        density: 1200,
        pricePerSqm: 36.0,
        supplierName: 'Filzmanufaktur Bern',
    },
    {
        id: 6,
        articleNumber: 'F-AKUSTIK-9-HELLGRAU',
        feltTypeName: 'Akustik 9',
        color: 'Hellgrau',
        thickness: 9,
        density: 1600,
        pricePerSqm: 58.0,
        supplierName: 'AcoustiFilz',
    },
    {
        id: 7,
        articleNumber: 'F-AKUSTIK-9-SCHWARZ',
        feltTypeName: 'Akustik 9',
        color: 'Schwarz',
        thickness: 9,
        density: 1600,
        pricePerSqm: 58.0,
        supplierName: 'AcoustiFilz',
    },
    {
        id: 8,
        articleNumber: 'F-INDUSTRIE-5-GRAU',
        feltTypeName: 'Industrie 5',
        color: 'Grau',
        thickness: 5,
        density: 600,
        pricePerSqm: 22.0,
        supplierName: 'Industrievlies GmbH',
    },
];

const PRODUCT_CATALOG: ProductCatalogItem[] = [
    {id: 101, articleNumber: 'P-VERSAND-CH-S', name: 'Versand Schweiz · Paket S', price: 9.0},
    {id: 102, articleNumber: 'P-VERSAND-CH-M', name: 'Versand Schweiz · Paket M', price: 14.0},
    {id: 103, articleNumber: 'P-VERSAND-CH-L', name: 'Versand Schweiz · Paket L', price: 22.0},
    {id: 104, articleNumber: 'P-VERPACKUNG-A', name: 'Verpackung · Karton A', price: 4.5},
    {id: 105, articleNumber: 'P-VERPACKUNG-B', name: 'Verpackung · Karton B', price: 6.2},
    {id: 106, articleNumber: 'P-MUSTERSET', name: 'Musterset Filzfarben', price: 12.0},
];

const MOCK_CUSTOMERS: CustomerWithIdDto[] = [
    {
        id: 'C-001',
        customerNumber: 'K-1042',
        name: 'Atelier Lindenhof GmbH',
        contactPerson: 'Sabine Brunner',
        email: 'sabine.brunner@atelier-lindenhof.ch',
        phone: '+41 44 312 88 04',
        street: 'Lindenhofstrasse 27',
        zip: '8001',
        city: 'Zürich',
        country: 'Schweiz',
        vatNumber: 'CHE-114.927.331 MWST',
    },
    {
        id: 'C-002',
        customerNumber: 'K-1089',
        name: 'Möbel & Design Steiner',
        contactPerson: 'Thomas Steiner',
        email: 't.steiner@steinermoebeldesign.ch',
        phone: '+41 31 445 22 10',
        street: 'Bundesgasse 12',
        zip: '3011',
        city: 'Bern',
        country: 'Schweiz',
        vatNumber: 'CHE-287.441.602 MWST',
    },
    {
        id: 'C-003',
        customerNumber: 'K-1103',
        name: 'Studio Formgebung AG',
        contactPerson: 'Katrin Wolf',
        email: 'k.wolf@studio-formgebung.ch',
        phone: '+41 61 908 77 33',
        street: 'Gerbergasse 18',
        zip: '4001',
        city: 'Basel',
        country: 'Schweiz',
        vatNumber: 'CHE-399.812.044 MWST',
    },
];

export const getMockCustomers = (): CustomerWithIdDto[] => MOCK_CUSTOMERS;

export const getMockCreatedOffer = (id: string): OfferDto => ({
    id,
    number: id,
    createdISO: new Date().toISOString().slice(0, 10),
    state: OFFER_STATE.OFFERTE,
    path: OFFER_PATH_A,
    customer: SAMPLE_CUSTOMER,
    lines: [],
    history: [{ts: new Date().toISOString(), who: 'System', what: 'Offerte erstellt'}],
});

export const getMockOffers = (): OfferSummaryDto[] => [];

export const getMockFeltCatalog = (): FeltCatalogItem[] => FELT_CATALOG;

export const getMockProductCatalog = (): ProductCatalogItem[] => PRODUCT_CATALOG;

export const getMockAddedLine = (line: Omit<LineItemDto, 'id'>): LineItemDto => ({
    ...line,
    id: 'L' + Date.now(),
});
