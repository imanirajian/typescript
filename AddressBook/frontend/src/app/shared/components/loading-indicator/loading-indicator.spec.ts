import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { LoadingIndicator } from './loading-indicator';

describe('LoadingIndicator', () => {
  it('announces its label as a status', () => {
    const fixture = TestBed.createComponent(LoadingIndicator);
    fixture.componentRef.setInput('label', 'Loading address…');
    fixture.detectChanges();

    const status = (fixture.nativeElement as HTMLElement).querySelector('[role="status"]');
    expect(status?.textContent).toContain('Loading address…');
  });
});
