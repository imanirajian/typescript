import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';

import { emptyAddressForm, type AddressFormModel } from '../../data-access/address.rules';
import { addressSchema } from './address-form.schema';

// Isolated form tests (no component, no DOM), as recommended for schema logic.
function createForm(initial: Partial<AddressFormModel> = {}) {
  const model = signal<AddressFormModel>({ ...emptyAddressForm(), ...initial });
  return form(model, addressSchema, { injector: TestBed.inject(Injector) });
}

const VALID: AddressFormModel = {
  addressee: 'Mrs. Elizabeth White',
  street1: 'Hathaway Cottage',
  street2: '',
  town: 'Stratford-upon-Avon',
  county: '',
  postcode: 'CV37 6HP',
};

describe('addressSchema', () => {
  it('accepts a complete address with optional lines left blank', () => {
    expect(createForm(VALID)().valid()).toBe(true);
  });

  it('requires addressee, street 1, town and postcode', () => {
    const f = createForm();

    expect(f.addressee().errors().map((e) => e.kind)).toContain('required');
    expect(f.street1().errors().map((e) => e.kind)).toContain('required');
    expect(f.town().errors().map((e) => e.kind)).toContain('required');
    expect(f.postcode().errors().map((e) => e.kind)).toContain('required');
    expect(f.street2().valid()).toBe(true);
    expect(f.county().valid()).toBe(true);
  });

  it('rejects whitespace-only required values', () => {
    const f = createForm({ ...VALID, addressee: '    ', postcode: '   ' });

    expect(f.addressee().errors().map((e) => e.kind)).toEqual(['blank']);
    expect(f.postcode().errors().map((e) => e.kind)).toEqual(['blank']);
  });

  it('limits every line to 50 characters', () => {
    const tooLong = 'x'.repeat(51);

    expect(createForm({ ...VALID, addressee: tooLong }).addressee().invalid()).toBe(true);
    expect(createForm({ ...VALID, street2: tooLong }).street2().invalid()).toBe(true);
    expect(createForm({ ...VALID, county: 'x'.repeat(50) }).county().valid()).toBe(true);
  });

  it.each(['AB12', 'AB-123', 'ABCDEFGHI'])('rejects postcode "%s"', (postcode) => {
    const f = createForm({ ...VALID, postcode });

    expect(f.postcode().errors().map((e) => e.kind)).toEqual(['postcode']);
  });

  it.each(['CV37 6HP', 'cv376hp', 'M1 1AE'])('accepts postcode "%s"', (postcode) => {
    expect(createForm({ ...VALID, postcode }).postcode().valid()).toBe(true);
  });
});
