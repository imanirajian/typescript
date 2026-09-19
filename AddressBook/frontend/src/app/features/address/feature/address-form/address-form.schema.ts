import { maxLength, validate, type SchemaPath, type SchemaPathTree } from '@angular/forms/signals';

import { requiredTrimmed } from '../../../../core/validators/required-trimmed';
import { MAX_LINE_LENGTH, isBlank, isValidPostcode, type AddressFormModel } from '../../data-access/address.rules';

/**
 * Client-side rules, taken from the documented limits on UkAddressBody.
 * A plain function (not tied to a component) so it can be tested in isolation.
 */
export function addressSchema(path: SchemaPathTree<AddressFormModel>): void {
  requiredLine(path.addressee, 'Addressee');
  requiredLine(path.street1, 'Street 1');
  optionalLine(path.street2, 'Street 2');
  requiredLine(path.town, 'Town');
  optionalLine(path.county, 'County');
  postcode(path.postcode);
}

/** Required, not blank, max 50. */
function requiredLine(path: SchemaPath<string>, label: string): void {
  requiredTrimmed(path, `${label} is required.`);
  maxLine(path, label);
}

/** Optional, max 50. Blank values are dropped by `toRequest`. */
function optionalLine(path: SchemaPath<string>, label: string): void {
  maxLine(path, label);
}

function maxLine(path: SchemaPath<string>, label: string): void {
  maxLength(path, MAX_LINE_LENGTH, {
    message: `${label} must be ${MAX_LINE_LENGTH} characters or fewer.`,
  });
}

/**
 * Documented rule: required, 5-8 characters, letters and numbers only.
 * The supplied backend only enforces "not empty + length 5-8", so the stricter
 * documented rule is enforced here. Spaces are tolerated while typing and
 * stripped on submit (see `normalizePostcode`).
 */
function postcode(path: SchemaPath<string>): void {
  requiredTrimmed(path, 'Postcode is required.');
  validate(path, ({ value }) => {
    const raw = value();
    if (isBlank(raw)) return null; // reported by requiredTrimmed
    return isValidPostcode(raw)
      ? null
      : {
          kind: 'postcode',
          message: 'Postcode must be 5 to 8 letters or numbers. Spaces are ignored.',
        };
  });
}
