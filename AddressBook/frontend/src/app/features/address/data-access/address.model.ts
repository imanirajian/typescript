/**
 * Wire types for the AddressBookChallenge API (System.Text.Json => camelCase).
 *
 * NOTE: POST /address answers with a `UkAddress` (body + addressId) but
 * GET /address/{id} answers with a bare `UkAddressBody`. The id is therefore
 * merged in client-side from the route (see AddressDetail).
 */
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

/**
 * One entry of the array ASP.NET returns when FluentValidation fails
 * (`result.Errors`). `propertyName` is the C# property name, e.g. "Postcode".
 */
export interface ApiValidationError {
  propertyName: string;
  errorMessage: string;
}
