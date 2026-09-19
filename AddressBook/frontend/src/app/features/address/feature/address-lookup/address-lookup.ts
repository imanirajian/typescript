import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { Router } from '@angular/router';

import { requiredTrimmed } from '../../../../core/validators/required-trimmed';

/**
 * "Find an address by ID": jumps to /address/:id. It is a shortcut into the
 * routed detail screen, not a second way to fetch, so it only navigates.
 */
@Component({
  selector: 'app-address-lookup',
  imports: [FormRoot, FormField],
  templateUrl: './address-lookup.html',
  styleUrl: './address-lookup.scss',
})
export class AddressLookup {
  private readonly router = inject(Router);

  protected readonly model = signal({ id: '' });

  protected readonly lookupForm = form(
    this.model,
    (path) => requiredTrimmed(path.id, 'Enter an address ID.'),
    {
      submission: {
        action: async (field) => {
          await this.router.navigate(['/address', field().value().id.trim()]);
          this.model.set({ id: '' });
          return undefined;
        },
      },
    },
  );
}
