import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import {
    AddressApiError,
    ApiValidationError,
    UkAddress,
    UkAddressBody
} from '../models/address';

@Injectable({ providedIn: 'root' })
export class AddressApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/address`;

    createAddress(body: UkAddressBody): Observable<UkAddress> {
        return this.http
            .post<UkAddress>(this.baseUrl, body)
            .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toApiError(err))));
    }

    /** Backend's GET returns UkAddressBody only (no id) — caller merges the route id. */
    getAddress(id: string): Observable<UkAddressBody> {
        return this.http
            .get<UkAddressBody>(`${this.baseUrl}/${id}`)
            .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toApiError(err))));
    }

    private toApiError(err: HttpErrorResponse): AddressApiError {
        if (err.status === 400 && Array.isArray(err.error)) {
            const fieldErrors: Record<string, string> = {};
            for (const e of err.error as ApiValidationError[]) {
                if (e?.propertyName) {
                    fieldErrors[this.toFieldKey(e.propertyName)] = e.errorMessage;
                }
            }
            return {
                kind: 'validation',
                message: 'Please correct the highlighted fields and try again.',
                fieldErrors
            };
        }

        if (err.status === 404) {
            return { kind: 'not-found', message: 'Address not found.' };
        }

        if (err.status === 0) {
            return {
                kind: 'network',
                message: 'Cannot reach the server. Check your connection and try again.'
            };
        }

        return { kind: 'unknown', message: 'Something went wrong. Please try again.' };
    }

    /** "Postcode" (C# PascalCase) -> "postcode" (Angular form control name). */
    private toFieldKey(propertyName: string): string {
        return propertyName.charAt(0).toLowerCase() + propertyName.slice(1);
    }

}