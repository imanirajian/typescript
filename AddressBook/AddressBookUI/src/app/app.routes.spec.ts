import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { routes } from './app.routes';
import { AddressDetail } from './features/address/feature/address-detail/address-detail';
import { AddressForm } from './features/address/feature/address-form/address-form';

// Wiring test: the real route table, including the lazy feature routes.
describe('routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  it.each(['/create', '/', '/no/such/page'])('shows the create form at %s', async (url) => {
    expect(await harness.navigateByUrl(url, AddressForm)).toBeInstanceOf(AddressForm);
  });

  it('binds the :id route parameter into AddressDetail', async () => {
    const detail = await harness.navigateByUrl('/address/abc-123', AddressDetail);
    expect(detail.id()).toBe('abc-123');
  });
});
