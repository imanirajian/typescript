import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '../../data-access/address-api';
import { AddressForm } from './address-form';

const ID = '3f2c6d1e-8a5b-4d7e-9c1a-0b2e4f6a8c10';

function spyOnNavigate() {
  return vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
}

describe('AddressForm', () => {
  let fixture: ComponentFixture<AddressForm>;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof spyOnNavigate>;
  let createUrl: string;

  const root = () => fixture.nativeElement as HTMLElement;
  const text = (selector: string) => root().querySelector(selector)?.textContent ?? '';

  // Let microtasks (submit -> action -> HTTP) run, then re-render.
  const settle = async () => {
    await new Promise<void>((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  };

  function fill(id: string, value: string) {
    const input = root().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function fillValid() {
    fill('addressee', 'Mrs. Elizabeth White');
    fill('street1', 'Hathaway Cottage');
    fill('town', 'Stratford-upon-Avon');
    fill('postcode', 'cv37 6hp');
  }

  const submitButton = () => root().querySelector<HTMLButtonElement>('button[type="submit"]')!;

  async function submit() {
    submitButton().click();
    await settle();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    navigate = spyOnNavigate();
    createUrl = `${TestBed.inject(API_BASE_URL)}/address`;

    fixture = TestBed.createComponent(AddressForm);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('does not call the API when the form is invalid, and shows why', async () => {
    await submit();

    http.expectNone(createUrl);
    expect(text('#addressee-error')).toContain('Addressee is required.');
    expect(text('#postcode-error')).toContain('Postcode is required.');
    expect(document.activeElement?.id).toBe('addressee'); // focus moves to first error
  });

  it('POSTs a normalised payload and navigates to the created address', async () => {
    fillValid();
    fill('street2', '   ');
    await submit();

    const req = http.expectOne(createUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      addressee: 'Mrs. Elizabeth White',
      street1: 'Hathaway Cottage',
      street2: null,
      town: 'Stratford-upon-Avon',
      county: null,
      postcode: 'CV376HP',
    });

    req.flush({ ...req.request.body, addressId: ID }, { status: 201, statusText: 'Created' });
    await settle();

    expect(navigate).toHaveBeenCalledWith(['/address', ID]);
  });

  it('disables the button while saving to prevent duplicate submits', async () => {
    fillValid();
    await submit();

    expect(submitButton().disabled).toBe(true);
    expect(submitButton().textContent).toContain('Saving');

    http.expectOne(createUrl).flush({ addressId: ID }, { status: 201, statusText: 'Created' });
    await settle();
  });

  it('shows a server-side validation message on the matching field', async () => {
    fillValid();
    await submit();

    http.expectOne(createUrl).flush(
      [{ propertyName: 'Town', errorMessage: "'Town' must not be empty." }],
      { status: 400, statusText: 'Bad Request' },
    );
    await settle();

    expect(text('#town-error')).toContain("'Town' must not be empty.");
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows an alert when the API is unreachable', async () => {
    fillValid();
    await submit();

    http.expectOne(createUrl).error(new ProgressEvent('error'));
    await settle();

    expect(text('[role="alert"]')).toContain('reach the address service');
    expect(navigate).not.toHaveBeenCalled();
  });
});
