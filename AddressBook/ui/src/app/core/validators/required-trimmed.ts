import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Rejects null/undefined AND whitespace-only strings (e.g. "   "). */
export function requiredTrimmed(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (value === null || value === undefined) return { required: true };
        if (typeof value === 'string' && value.trim().length === 0) return { required: true };
        return null;
    };
}