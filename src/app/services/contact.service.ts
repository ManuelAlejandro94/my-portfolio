import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { ContactInterface } from '../interfaces/contact.interface';
import { ApiResponse } from '../interfaces/apiresponse.interface';
import { CONTACT_SETTINGS, ContactSettings } from './contact-settings';

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(
    private readonly http: HttpClient,
    @Inject(CONTACT_SETTINGS) private readonly settings: ContactSettings
  ) {}

  apiRequest(data: ContactInterface, token: string): Observable<ApiResponse> {
    // Never retry automatically: Telegram may already have accepted the message.
    return this.http.post<ApiResponse>(this.settings.apiUrl, data, {
      headers: { 'X-Turnstile-Token': token }
    }).pipe(timeout(20_000));
  }
}
