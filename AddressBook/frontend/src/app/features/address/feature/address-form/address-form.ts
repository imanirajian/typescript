import { Component, inject, signal } from '@angular/core';
import { form, FormRoot } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AddressApi } from '../../data-access/address-api';
import { toAddressApiError } from '../../data-access/address-api-error';
import { ErrorBanner } from '../../../../shared/components/error-banner/error-banner';
import { AddressField } from '../../ui/address-field/address-field';
import type { UkAddress } from '../../data-access/address.model';
import { emptyAddressForm, toRequest, type AddressFormModel } from '../../data-access/address.rules';
import { addressSchema } from './address-form.schema';

/**
 * Create-address screen. State is local and small: the form model, and one
 * banner message for failures that don't belong to a specific field.
 */
@Component({
  selector: 'app-address-form',
  imports: [FormRoot, AddressField, ErrorBanner],
  templateUrl: './address-form.html',
  styleUrl: './address-form.scss',
})
export class AddressForm {
  private readonly api = inject(AddressApi);
  private readonly router = inject(Router);

  protected readonly model = signal<AddressFormModel>(emptyAddressForm());
  protected readonly submitError = signal<string | null>(null);

  protected readonly addressForm = form(this.model, addressSchema, {
    submission: {
      // Runs only when client-side validation passes; FormRoot also prevents
      // duplicate submits while it is in flight.
      action: async (field) => {
        this.submitError.set(null);

        let created: UkAddress;
        try {
          created = await firstValueFrom(this.api.create(toRequest(field().value())));
        } catch (cause) {
          const failure = toAddressApiError(cause);
          if (failure.fieldErrors.length === 0) {
            this.submitError.set(failure.message);
            return undefined;
          }
          // Server-side validation: put each message on its own field.
          return failure.fieldErrors.map(({ field: name, message }) => ({
            kind: 'server',
            message,
            fieldTree: field[name],
          }));
        }

        // The detail screen re-fetches by id, so both endpoints are exercised.
        await this.router.navigate(['/address', created.addressId]);
        return undefined;
      },
      onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
    },
  });
}
