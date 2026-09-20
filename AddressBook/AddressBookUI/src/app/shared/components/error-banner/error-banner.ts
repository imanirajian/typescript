import { Component, input } from '@angular/core';

/** A user-facing failure message, announced to assistive tech (role="alert"). */
@Component({
  selector: 'app-error-banner',
  templateUrl: './error-banner.html',
  styleUrl: './error-banner.scss',
})
export class ErrorBanner {
  readonly message = input.required<string>();
}
