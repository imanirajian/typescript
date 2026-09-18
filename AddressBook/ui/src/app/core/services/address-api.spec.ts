import { TestBed } from '@angular/core/testing';
import { AddressApi } from './address-api';

describe('AddressApi', () => {
  let service: AddressApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddressApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
