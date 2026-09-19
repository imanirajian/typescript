import { Component, computed, input } from '@angular/core';
import { FormField, type FieldTree } from '@angular/forms/signals';

/**
 * One labelled text input with its hint and error messages.
 * Presentational: it renders whatever state the bound field already has.
 */
@Component({
  selector: 'app-address-field',
  imports: [FormField],
  templateUrl: './address-field.html',
  styleUrl: './address-field.scss',
})
export class AddressField {
  readonly field = input.required<FieldTree<string>>();
  readonly label = input.required<string>();
  /** Stable id: ties label, hint and error text to the input (and to tests). */
  readonly inputId = input.required<string>();
  readonly optional = input(false);
  readonly hint = input<string>();
  /** HTML autocomplete token, e.g. "address-line1". */
  readonly autocomplete = input<string>();

  protected readonly state = computed(() => this.field()());
  /** Errors appear once the user has visited the field or tried to submit. */
  protected readonly showErrors = computed(() => this.state().touched() && this.state().invalid());
  protected readonly hintId = computed(() => `${this.inputId()}-hint`);
  protected readonly errorId = computed(() => `${this.inputId()}-error`);
  protected readonly describedBy = computed(() => {
    const ids = [this.hint() ? this.hintId() : null, this.showErrors() ? this.errorId() : null];
    return ids.filter(Boolean).join(' ') || null;
  });
}
