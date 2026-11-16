import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

export interface TurnstileOptions {
  sitekey: string;
  action: string;
  'response-field': false;
  retry: 'never';
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
  'timeout-callback': () => void;
}

export interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileOptions): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

@Injectable({ providedIn: 'root' })
export class TurnstileService {
  private loading?: Promise<TurnstileApi>;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  load(): Promise<TurnstileApi> {
    if (this.loading) return this.loading;
    this.loading = this.loadScript().catch(error => {
      this.loading = undefined;
      throw error;
    });
    return this.loading;
  }

  private loadScript(): Promise<TurnstileApi> {
    return new Promise((resolve, reject) => {
      const browser = this.document.defaultView as (Window & {
        turnstile?: TurnstileApi;
      }) | null;
      if (!browser) {
        reject(new Error('Browser verification unavailable'));
        return;
      }
      const existingApi = browser.turnstile;
      if (existingApi) {
        resolve(existingApi);
        return;
      }
      const script = this.document.createElement('script');
      // Use the official URL; do not proxy or self-host this script.
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      const timer = browser.setTimeout(fail, 15_000);
      function fail(): void {
        browser?.clearTimeout(timer);
        script.remove();
        reject(new Error('Browser verification unavailable'));
      }
      script.onerror = fail;
      script.onload = () => {
        const api = browser.turnstile;
        if (!api) {
          fail();
          return;
        }
        // The script load event already follows execution. Turnstile forbids
        // ready() when api.js is loaded with async/defer.
        browser.clearTimeout(timer);
        resolve(api);
      };
      this.document.head.append(script);
    });
  }
}
