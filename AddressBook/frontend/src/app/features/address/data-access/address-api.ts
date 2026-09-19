import { HttpClient, httpResource } from '@angular/common/http';
import { InjectionToken, Service, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import type { UkAddress, UkAddressBody } from './address.model';

/** Defaults to core/environments. CORS on the supplied API allows only http://localhost:4200, so the app calls it directly (no proxy). */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});

/** The only place that knows the API's URLs and verbs. */
@Service()
export class AddressApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** POST /address -> 201 with the created address, including its id. */
  create(body: UkAddressBody): Observable<UkAddress> {
    return this.http.post<UkAddress>(`${this.baseUrl}/address`, body);
  }

  /**
   * GET /address/{id}, as a reactive resource: it re-fetches when `id` changes
   * and exposes value / isLoading / error / reload(). Resolves to the bare
   * body (the API does not echo the id on GET).
   *
   * Must be called in an injection context (e.g. a field initialiser).
   */
  lookup(id: () => string) {
    return httpResource<UkAddressBody>(
      () => `${this.baseUrl}/address/${encodeURIComponent(id())}`,
    );
  }
}
