import { required, validate, type SchemaPath } from '@angular/forms/signals';

/**
 * Required, and not just whitespace. `required()` alone accepts "   ", so a
 * second rule reports whitespace-only input with the same message
 * (`kind: 'blank'`, alongside `required()`'s own `kind: 'required'`).
 */
export function requiredTrimmed(path: SchemaPath<string>, message: string): void {
  required(path, { message });
  validate(path, ({ value }) =>
    value().length > 0 && value().trim().length === 0 ? { kind: 'blank', message } : null,
  );
}
