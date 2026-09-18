import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AddressApiService } from './address-api';
import { AddressApiError } from '../models/address';

describe('AddressApiService', () => {
  let service: AddressApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AddressApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs a new address and returns it', () => {
    service
      .createAddress({ addressee: 'A', street1: 'S', town: 'T', postcode: 'AB123' })
      .subscribe((res) => expect(res.addressId).toBe('123'));

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url.endsWith('/address'));
    req.flush({ addressId: '123' });
  });

  it('GETs an address by id', () => {
    service.getAddress('abc').subscribe((res) => expect(res.town).toBe('London'));
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url.endsWith('/abc'));
    req.flush({ town: 'London' });
  });

  it('maps a 400 FluentValidation response into fieldErrors keyed by camelCase name', () => {
    let captured!: AddressApiError;
    service.createAddress({ addressee: '', street1: '', town: '', postcode: '' }).subscribe({
      error: (err: AddressApiError) => (captured = err)
    });

    const req = httpMock.expectOne((r) => r.method === 'POST');
    req.flush(
      [
        { propertyName: 'Postcode', errorMessage: "'Postcode' must be between 5 and 8 characters." },
        { propertyName: 'Addressee', errorMessage: "'Addressee' must not be empty." }
      ],
      { status: 400, statusText: 'Bad Request' }
    );

    expect(captured.kind).toBe('validation');
    expect(captured.fieldErrors?.['postcode']).toContain('between 5 and 8');
    expect(captured.fieldErrors?.['addressee']).toContain('must not be empty');
  });

  it('maps a 404 into a not-found error', () => {
    let captured!: AddressApiError;
    service.getAddress('missing-id').subscribe({ error: (err) => (captured = err) });
    const req = httpMock.expectOne((r) => r.method === 'GET');
    req.flush(null, { status: 404, statusText: 'Not Found' });
    expect(captured.kind).toBe('not-found');
  });

  it('maps a network failure (status 0) into a network error', () => {
    let captured!: AddressApiError;
    service.getAddress('any-id').subscribe({ error: (err) => (captured = err) });
    const req = httpMock.expectOne((r) => r.method === 'GET');
    req.error(new ProgressEvent('network error'), { status: 0 });
    expect(captured.kind).toBe('network');
  });
});