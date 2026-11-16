import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ContactSettings {
  apiUrl: string;
  turnstileSiteKey: string;
  turnstileAction: string;
}

export const CONTACT_SETTINGS = new InjectionToken<ContactSettings>('CONTACT_SETTINGS', {
  providedIn: 'root',
  factory: () => environment.contact
});
