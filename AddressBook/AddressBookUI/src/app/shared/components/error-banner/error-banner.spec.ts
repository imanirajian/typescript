import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ErrorBanner } from './error-banner';

describe('ErrorBanner', () => {
  it('shows the message in an alert region', () => {
    const fixture = TestBed.createComponent(ErrorBanner);
    fixture.componentRef.setInput('message', 'Something broke.');
    fixture.detectChanges();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Something broke.');
  });
});
