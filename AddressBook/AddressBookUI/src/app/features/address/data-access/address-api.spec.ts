import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL, AddressApi } from './address-api';

describe('AddressApi', () => {
  let api: AddressApi;
  let http: HttpTestingController;
  let baseUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(AddressApi);
    http = TestBed.inject(HttpTestingController);
    baseUrl = TestBed.inject(API_BASE_URL);
  });

  afterEach(() => http.verify());

  it('POSTs the body to /address and emits the created address', () => {
    const body = { addressee: 'A', street1: 'S', town: 'T', postcode: 'AB123' };
    let created: { addressId: string } | undefined;

    api.create(body).subscribe((address) => (created = address));

    const req = http.expectOne(`${baseUrl}/address`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush({ ...body, addressId: 'id-1' }, { status: 201, statusText: 'Created' });
    expect(created?.addressId).toBe('id-1');
  });
});
