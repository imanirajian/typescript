import { FormControl } from '@angular/forms';
import { requiredTrimmed } from './required-trimmed';

describe('requiredTrimmed', () => {
  const validate = requiredTrimmed();

  it('rejects empty string', () => expect(validate(new FormControl(''))).toEqual({ required: true }));
  it('rejects whitespace-only string', () =>
    expect(validate(new FormControl('    '))).toEqual({ required: true }));
  it('accepts non-empty trimmed value', () =>
    expect(validate(new FormControl('  Hello  '))).toBeNull());
});