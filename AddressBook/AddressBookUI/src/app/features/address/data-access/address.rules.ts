import type { UkAddressBody } from './address.model';

/** Max length documented on every text line of UkAddressBody. */
export const MAX_LINE_LENGTH = 50;

/**
 * The form model. Optional fields are empty strings (never null) so every
 * field can be bound to a plain text input; `toRequest` maps blanks to null.
 */
export interface AddressFormModel {
  addressee: string;
  street1: string;
  street2: string;
  town: string;
  county: string;
  postcode: string;
}

export function emptyAddressForm(): AddressFormModel {
  return { addressee: '', street1: '', street2: '', town: '', county: '', postcode: '' };
}

/** Documented rule: 5-8 characters, letters and numbers only. */
const POSTCODE_PATTERN = /^[A-Z0-9]{5,8}$/;

export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/** People type "SW1A 1AA"; the API wants letters/numbers only, so drop spaces. */
export function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

export function isValidPostcode(raw: string): boolean {
  return POSTCODE_PATTERN.test(normalizePostcode(raw));
}

/** Display only: the inward code is always the last three characters. */
export function formatPostcode(stored: string): string {
  const compact = stored.toUpperCase();
  return POSTCODE_PATTERN.test(compact)
    ? `${compact.slice(0, -3)} ${compact.slice(-3)}`
    : stored;
}

/**
 * Form model -> request body. Trims text, and omits blank optional lines
 * (the API documents them as "optional, not empty").
 */
export function toRequest(model: AddressFormModel): UkAddressBody {
  const optional = (value: string): string | null => value.trim() || null;
  return {
    addressee: model.addressee.trim(),
    street1: model.street1.trim(),
    street2: optional(model.street2),
    town: model.town.trim(),
    county: optional(model.county),
    postcode: normalizePostcode(model.postcode),
  };
}
