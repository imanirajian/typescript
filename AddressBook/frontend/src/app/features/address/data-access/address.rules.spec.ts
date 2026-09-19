import { describe, expect, it } from 'vitest';
import {
  emptyAddressForm,
  formatPostcode,
  isValidPostcode,
  normalizePostcode,
  toRequest,
} from './address.rules';

describe('postcode rules', () => {
  it('normalises spacing and case', () => {
    expect(normalizePostcode(' cv37 6hp ')).toBe('CV376HP');
  });

  it.each(['CV37 6HP', 'cv376hp', 'M1 1AE', 'SW1A 1AA', 'W1A 0AX', 'AB123'])(
    'accepts %s',
    (value) => expect(isValidPostcode(value)).toBe(true),
  );

  it.each(['', '     ', 'AB12', 'AB 12', 'AB-123', 'AB@123', 'ABCDEFGHI'])(
    'rejects "%s"',
    (value) => expect(isValidPostcode(value)).toBe(false),
  );

  it('formats a stored postcode for display', () => {
    expect(formatPostcode('CV376HP')).toBe('CV37 6HP');
    expect(formatPostcode('M11AE')).toBe('M1 1AE');
  });

  it('leaves values it does not understand untouched', () => {
    expect(formatPostcode('AB-123')).toBe('AB-123');
    expect(formatPostcode('SW1A 1AA')).toBe('SW1A 1AA');
  });
});

describe('toRequest', () => {
  it('trims text, omits blank optional lines and normalises the postcode', () => {
    const body = toRequest({
      ...emptyAddressForm(),
      addressee: '  Mrs. Elizabeth White ',
      street1: ' Hathaway Cottage',
      street2: '   ',
      town: 'Stratford ',
      county: '',
      postcode: 'cv37 6hp',
    });

    expect(body).toEqual({
      addressee: 'Mrs. Elizabeth White',
      street1: 'Hathaway Cottage',
      street2: null,
      town: 'Stratford',
      county: null,
      postcode: 'CV376HP',
    });
  });
});
