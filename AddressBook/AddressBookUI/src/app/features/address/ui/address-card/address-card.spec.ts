import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import type { UkAddress } from '../../data-access/address.model';
import { AddressCard } from './address-card';

function render(address: UkAddress): HTMLElement {
  const fixture = TestBed.createComponent(AddressCard);
  fixture.componentRef.setInput('address', address);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

const BASE: UkAddress = {
  addressId: 'id-1',
  addressee: 'Mrs. Elizabeth White',
  street1: 'Hathaway Cottage',
  town: 'Stratford-upon-Avon',
  postcode: 'CV376HP',
};

describe('AddressCard', () => {
  it('omits optional lines that are empty', () => {
    const lines = Array.from(render({ ...BASE, street2: null, county: null }).querySelectorAll('.line'))
      .map((line) => line.textContent?.trim());

    expect(lines).toEqual(['Mrs. Elizabeth White', 'Hathaway Cottage', 'Stratford-upon-Avon', 'CV37 6HP']);
  });

  it('renders optional lines in postal order when present', () => {
    const lines = Array.from(
      render({ ...BASE, street2: '1 Main Street', county: 'Warwickshire' }).querySelectorAll('.line'),
    ).map((line) => line.textContent?.trim());

    expect(lines).toEqual([
      'Mrs. Elizabeth White',
      'Hathaway Cottage',
      '1 Main Street',
      'Stratford-upon-Avon',
      'Warwickshire',
      'CV37 6HP',
    ]);
  });
});
