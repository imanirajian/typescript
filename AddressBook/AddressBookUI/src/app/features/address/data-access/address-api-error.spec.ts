import { describe, expect, it } from 'vitest';
import { toAddressApiError } from './address-api-error';

describe('toAddressApiError', () => {
  it('treats status 0 as the API being unreachable', () => {
    expect(toAddressApiError({ status: 0 }).kind).toBe('network');
  });

  it('maps 404 to not-found', () => {
    expect(toAddressApiError({ status: 404, error: null }).kind).toBe('not-found');
  });

  it('maps FluentValidation errors onto form fields (PascalCase -> camelCase)', () => {
    const error = toAddressApiError({
      status: 400,
      error: [
        { propertyName: 'Postcode', errorMessage: "'Postcode' must be between 5 and 8 characters." },
        { propertyName: 'Street2', errorMessage: 'Street 2 is too long.' },
      ],
    });

    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual([
      { field: 'postcode', message: "'Postcode' must be between 5 and 8 characters." },
      { field: 'street2', message: 'Street 2 is too long.' },
    ]);
  });

  it('keeps messages for unknown properties instead of dropping them', () => {
    const error = toAddressApiError({
      status: 400,
      error: [{ propertyName: 'Whatever', errorMessage: 'Something is wrong.' }],
    });

    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual([]);
    expect(error.message).toBe('Something is wrong.');
  });

  it('unwraps errors that carry the HTTP failure in `cause` (resources)', () => {
    expect(toAddressApiError({ message: 'Request failed', cause: { status: 404 } }).kind).toBe(
      'not-found',
    );
  });

  it.each([
    ['a 500', { status: 500 }],
    ['a 400 that is not a validation list', { status: 400, error: { title: 'Bad Request' } }],
    ['a plain Error', new Error('boom')],
    ['undefined', undefined],
  ])('falls back to a generic server error for %s', (_name, input) => {
    expect(toAddressApiError(input).kind).toBe('server');
  });
});
