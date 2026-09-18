export interface UkAddressBody {
    addressee: string;
    street1: string;
    street2?: string | null;
    town: string;
    county?: string | null;
    postcode: string;
}

export interface UkAddress extends UkAddressBody {
    addressId: string;
}

/** Raw shape returned by ASP.NET Core when FluentValidation fails (camelCase). */
export interface ApiValidationError {
    propertyName: string;
    errorMessage: string;
}

export type AddressApiErrorKind = 'validation' | 'not-found' | 'network' | 'unknown';

export interface AddressApiError {
    kind: AddressApiErrorKind;
    message: string;
    /** Keyed by form-control name (camelCase), only present when kind === 'validation'. */
    fieldErrors?: Record<string, string>;
}