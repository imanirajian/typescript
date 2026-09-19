import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { App } from './app';

describe('App', () => {
  it('renders the brand, the new-address link and the lookup form', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.app-header__brand')?.textContent).toContain('Address book');
    expect(el.querySelector('nav a')?.textContent).toContain('New address');
    expect(el.querySelector('form[role="search"]')).not.toBeNull();
  });
});
