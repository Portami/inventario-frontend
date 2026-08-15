/** Customer contact and address data as used within the frontend domain model. */
export interface CustomerDto {
    customerNumber: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    street: string;
    zip: string;
    city: string;
    country: string;
    vatNumber: string;
}

export interface CustomerWithIdDto extends CustomerDto {
    id: string;
}

/** Customer as returned by the /customers endpoints. */
export interface BackendFullCustomerDto {
    id: number;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    street: string;
    zip: string;
    city: string;
    country: string;
    vatNumber: string;
}
