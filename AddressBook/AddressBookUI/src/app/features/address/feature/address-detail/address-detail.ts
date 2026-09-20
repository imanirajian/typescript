import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ErrorBanner } from '../../../../shared/components/error-banner/error-banner';
import { LoadingIndicator } from '../../../../shared/components/loading-indicator/loading-indicator';
import { AddressApi } from '../../data-access/address-api';
import { toAddressApiError } from '../../data-access/address-api-error';
import type { UkAddress } from '../../data-access/address.model';
import { AddressCard } from '../../ui/address-card/address-card';

/**
 * Detail screen for /address/:id. `id` is bound from the route
 * (withComponentInputBinding), and the GET is a resource keyed on it.
 */
@Component({
  selector: 'app-address-detail',
  imports: [RouterLink, AddressCard, ErrorBanner, LoadingIndicator],
  templateUrl: './address-detail.html',
})
export class AddressDetail {
  /** Route parameter `:id`. */
  readonly id = input.required<string>();

  private readonly api = inject(AddressApi);

  protected readonly addressResource = this.api.lookup(this.id);

  /** GET returns the body only, so the id comes from the route. */
  protected readonly address = computed<UkAddress | undefined>(() => {
    const body = this.addressResource.hasValue() ? this.addressResource.value() : undefined;
    return body ? { ...body, addressId: this.id() } : undefined;
  });

  protected readonly failure = computed(() => {
    const error = this.addressResource.error();
    return error ? toAddressApiError(error) : undefined;
  });
}
