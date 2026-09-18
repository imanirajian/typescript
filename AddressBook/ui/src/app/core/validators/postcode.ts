import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Enforces the DOCUMENTED requirement (README/model comment): 5-8 alphanumeric characters.
 *
 * Note: the supplied backend's FluentValidation rule is only
 *   RuleFor(x => x.Postcode).NotEmpty().Length(5, 8);
 * which does NOT enforce alphanumeric-only characters, despite the model comment saying so.
 * This validator intentionally enforces the *stricter, documented* rule on the client,
 * rather than claiming to mirror the backend exactly (it doesn't).
 */
const POSTCODE_PATTERN = /^[A-Za-z0-9]{5,8}$/;

export function postcodeFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = (control.value as string | null)?.trim();
        if (!value) return null; // required handled separately
        return POSTCODE_PATTERN.test(value) ? null : { invalidPostcode: true };
    };
}