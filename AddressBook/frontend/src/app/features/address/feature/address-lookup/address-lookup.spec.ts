import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddressLookup } from './address-lookup';

function spyOnNavigate() {
  return vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
}

describe('AddressLookup', () => {
  let fixture: ComponentFixture<AddressLookup>;
  let navigate: ReturnType<typeof spyOnNavigate>;

  const root = () => fixture.nativeElement as HTMLElement;
  const input = () => root().querySelector<HTMLInputElement>('#lookup-id')!;
  const settle = async () => {
    await new Promise<void>((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  };

  async function submitWith(value: string) {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    root().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await settle();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    navigate = spyOnNavigate();
    fixture = TestBed.createComponent(AddressLookup);
    fixture.detectChanges();
  });

  it('navigates to the address for the trimmed id and clears the field', async () => {
    await submitWith('  3f2c6d1e-8a5b-4d7e-9c1a-0b2e4f6a8c10  ');

    expect(navigate).toHaveBeenCalledWith(['/address', '3f2c6d1e-8a5b-4d7e-9c1a-0b2e4f6a8c10']);
    expect(input().value).toBe('');
  });

  it('does nothing for a blank id', async () => {
    await submitWith('   ');

    expect(navigate).not.toHaveBeenCalled();
  });
});
