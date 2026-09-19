import { Component, computed, input } from '@angular/core';
import type { UkAddress } from '../../data-access/address.model';
import { formatPostcode } from '../../data-access/address.rules';

/** Presentation only: renders an address like the front of an envelope. */
@Component({
  selector: 'app-address-card',
  templateUrl: './address-card.html',
  styleUrl: './address-card.scss',
})
export class AddressCard {
  readonly address = input.required<UkAddress>();

  protected readonly postcode = computed(() => formatPostcode(this.address().postcode));
}
