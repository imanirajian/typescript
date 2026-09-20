import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '../../data-access/address-api';
import { AddressDetail } from './address-detail';

const ID = '3f2c6d1e-8a5b-4d7e-9c1a-0b2e4f6a8c10';
const BODY = {
  addressee: 'Mrs. Elizabeth White',
  street1: 'Hathaway Cottage',
  street2: null,
  town: 'Stratford-upon-Avon',
  county: null,
  postcode: 'CV376HP',
};

describe('AddressDetail', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;
  let url: string;

  const html = () => harness.routeNativeElement!;
  const settle = async () => {
    await new Promise<void>((resolve) => setTimeout(resolve));
    harness.detectChanges();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'address/:id', component: AddressDetail }], withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    url = `${TestBed.inject(API_BASE_URL)}/address/${ID}`;

    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/address/${ID}`, AddressDetail);
    await settle();
  });

  afterEach(() => http.verify());

  it('requests the address for the id in the route and renders it', async () => {
    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    expect(html().textContent).toContain('Loading address');

    req.flush(BODY);
    await settle();

    expect(html().textContent).toContain('Mrs. Elizabeth White');
    expect(html().textContent).toContain('Hathaway Cottage');
    expect(html().textContent).toContain('CV37 6HP'); // formatted for display
    expect(html().textContent).toContain(ID); // merged in from the route
  });

  it('explains when the address does not exist', async () => {
    http.expectOne(url).flush(null, { status: 404, statusText: 'Not Found' });
    await settle();

    expect(html().querySelector('[role="alert"]')?.textContent).toContain('No address was found');
    expect(html().textContent).not.toContain('Try again');
    expect(html().textContent).toContain('Add an address');
  });

  it('offers a retry when the service is unreachable', async () => {
    http.expectOne(url).error(new ProgressEvent('error'));
    await settle();

    expect(html().querySelector('[role="alert"]')?.textContent).toContain('reach the address service');

    html().querySelector<HTMLButtonElement>('button')!.click();
    await settle();

    http.expectOne(url).flush(BODY);
    await settle();

    expect(html().textContent).toContain('Hathaway Cottage');
  });
});
