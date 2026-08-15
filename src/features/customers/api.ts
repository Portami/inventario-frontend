import {BackendFullCustomerDto, CustomerWithIdDto} from './types';
import {get, patch, post} from '@/shared/api/http';

function mapBackendCustomer(raw: BackendFullCustomerDto): CustomerWithIdDto {
    return {
        id: String(raw.id),
        customerNumber: String(raw.id),
        name: raw.name,
        contactPerson: raw.contactPerson ?? '',
        email: raw.email ?? '',
        phone: raw.phone ?? '',
        street: raw.street ?? '',
        zip: raw.zip ?? '',
        city: raw.city ?? '',
        country: raw.country ?? '',
        vatNumber: raw.vatNumber ?? '',
    };
}

export interface CustomerPayload {
    name?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    street?: string;
    zip?: string;
    city?: string;
    country?: string;
    vatNumber?: string;
}

export const fetchCustomers = async (): Promise<CustomerWithIdDto[]> => (await get<BackendFullCustomerDto[]>('/customers')).map(mapBackendCustomer);

export const createCustomer = async (dto: CustomerPayload & {name: string}): Promise<CustomerWithIdDto> =>
    mapBackendCustomer(await post<BackendFullCustomerDto>('/customers', dto));

export const updateCustomer = async (id: string, dto: CustomerPayload): Promise<CustomerWithIdDto> =>
    mapBackendCustomer(await patch<BackendFullCustomerDto>(`/customers/${encodeURIComponent(id)}`, dto));
