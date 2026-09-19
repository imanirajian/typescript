import type { ApiValidationError, UkAddressBody } from './address.model';

export type AddressApiErrorKind = 'validation' | 'not-found' | 'network' | 'server';

export interface FieldError {
  readonly field: keyof UkAddressBody;
  readonly message: string;
}

/** Application-level error: components never inspect raw HTTP responses. */
export interface AddressApiError {
  readonly kind: AddressApiErrorKind;
  /** Safe to show to the user. */
  readonly message: string;
  /** Only populated for `validation`. */
  readonly fieldErrors: readonly FieldError[];
}

const FIELDS: readonly (keyof UkAddressBody)[] = [
  'addressee',
  'street1',
  'street2',
  'town',
  'county',
  'postcode',
];

const NETWORK: AddressApiError = {
  kind: 'network',
  message: "We can't reach the address service. Check your connection and try again.",
  fieldErrors: [],
};
const NOT_FOUND: AddressApiError = {
  kind: 'not-found',
  message: 'No address was found for this ID.',
  fieldErrors: [],
};
const SERVER: AddressApiError = {
  kind: 'server',
  message: 'The address service returned an unexpected error. Try again in a moment.',
  fieldErrors: [],
};

/**
 * Maps whatever a request threw (HttpErrorResponse, or a resource error that
 * wraps one in `cause`) to an AddressApiError. Duck-typed on purpose: it keeps
 * this module framework-free and trivially unit-testable.
 */
export function toAddressApiError(err: unknown): AddressApiError {
  const failure = findHttpFailure(err);
  if (!failure) return SERVER;

  switch (failure.status) {
    case 0:
      return NETWORK;
    case 404:
      return NOT_FOUND;
    case 400:
      return fromValidationBody(failure.body) ?? SERVER;
    default:
      return SERVER;
  }
}

function findHttpFailure(err: unknown): { status: number; body: unknown } | undefined {
  let current: unknown = err;
  for (let depth = 0; depth < 3 && typeof current === 'object' && current !== null; depth++) {
    const candidate = current as { status?: unknown; error?: unknown; cause?: unknown };
    if (typeof candidate.status === 'number') {
      return { status: candidate.status, body: candidate.error };
    }
    current = candidate.cause;
  }
  return undefined;
}

/**
 * FluentValidation errors arrive as a JSON array of
 * `{ propertyName: 'Postcode', errorMessage: "..." }` (PascalCase property
 * names, because they are C# property names, not JSON names).
 */
function fromValidationBody(body: unknown): AddressApiError | undefined {
  if (!Array.isArray(body) || body.length === 0) return undefined;

  const fieldErrors: FieldError[] = [];
  const unmatched: string[] = [];

  for (const entry of body as unknown[]) {
    const item = (entry ?? {}) as Partial<Record<keyof ApiValidationError, unknown>>;
    if (typeof item.errorMessage !== 'string') continue;

    const name = typeof item.propertyName === 'string' ? lowerFirst(item.propertyName) : '';
    const field = FIELDS.find((candidate) => candidate === name);
    if (field) fieldErrors.push({ field, message: item.errorMessage });
    else unmatched.push(item.errorMessage);
  }

  if (fieldErrors.length === 0 && unmatched.length === 0) return undefined;

  return {
    kind: 'validation',
    message: unmatched.length > 0 ? unmatched.join(' ') : 'Fix the highlighted fields and try again.',
    fieldErrors,
  };
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
