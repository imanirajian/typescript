import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';

import { requiredTrimmed } from './required-trimmed';

function createField(initial: string) {
  const model = signal({ name: initial });
  return form(model, (path) => requiredTrimmed(path.name, 'Name is required.'), {
    injector: TestBed.inject(Injector),
  }).name;
}

describe('requiredTrimmed', () => {
  it('rejects an empty string', () => {
    const errors = createField('')().errors();

    expect(errors.map((e) => e.kind)).toEqual(['required']);
    expect(errors[0]?.message).toBe('Name is required.');
  });

  it('rejects whitespace-only input with the same message', () => {
    const errors = createField('    ')().errors();

    expect(errors.map((e) => e.kind)).toEqual(['blank']);
    expect(errors[0]?.message).toBe('Name is required.');
  });

  it('accepts a value, including surrounding whitespace', () => {
    expect(createField('  Hello  ')().valid()).toBe(true);
  });
});
