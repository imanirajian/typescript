import { FormControl } from '@angular/forms';
import { postcodeFormatValidator } from './postcode';

describe('postcodeFormatValidator', () => {
  const validate = postcodeFormatValidator();

  it('accepts 5-8 char alphanumeric', () => {
    expect(validate(new FormControl('AB1234'))).toBeNull();
  });
  it('rejects too short', () => {
    expect(validate(new FormControl('AB1'))).toEqual({ invalidPostcode: true });
  });
  it('rejects spaces/symbols', () => {
    expect(validate(new FormControl('AB1 23'))).toEqual({ invalidPostcode: true });
  });
  it('treats empty as valid (required is a separate concern)', () => {
    expect(validate(new FormControl(''))).toBeNull();
  });
});