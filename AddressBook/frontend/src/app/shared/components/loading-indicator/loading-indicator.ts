import { Component, input } from '@angular/core';

/** Spinner + text, announced politely (role="status"). Motion is disabled for users who ask. */
@Component({
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.html',
  styleUrl: './loading-indicator.scss',
})
export class LoadingIndicator {
  readonly label = input('Loading…');
}
