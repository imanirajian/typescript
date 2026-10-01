import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { environment } from '../../../core/environments/environment';
import type { UkAddress, UkAddressBody } from './address.model';
import { Observable } from 'rxjs';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});

@Injectable({ providedIn: 'root' })
export class AddressApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  create(body: UkAddressBody): Observable<UkAddress> {
    return this.http.post<UkAddress>(`${this.baseUrl}/address`, body);
  }

  lookup(id: () => string) {
    return httpResource<UkAddressBody>(() => `${this.baseUrl}/address/${encodeURIComponent(id())}`);
  }
}