import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TimeoutError } from 'rxjs';
import { ContactService } from './contact.service';
import { CONTACT_SETTINGS } from './contact-settings';

describe('ContactService', () => {
  let service: ContactService;
  let http: HttpTestingController;
  const endpoint = 'http://localhost:8888/grima-bot';
  const data = { name: 'Test User', email: 'test@example.com',
    subject: 'Contact test', message: 'Hello', lang: 'en' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: CONTACT_SETTINGS, useValue: {
          apiUrl: endpoint, turnstileSiteKey: 'public-test-key', turnstileAction: 'contact'
        } }
      ]
    });
    service = TestBed.inject(ContactService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify({ ignoreCancelled: true }));

  it('posts the unchanged JSON contract with the proof in a header', () => {
    let result: unknown;
    service.apiRequest(data, 'proof').subscribe(response => result = response);
    const request = http.expectOne(endpoint);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);
    expect(request.request.headers.get('X-Turnstile-Token')).toBe('proof');
    expect(request.request.headers.has('Origin')).toBeFalse();
    expect(request.request.withCredentials).toBeFalse();
    request.flush({ code: 0, message: 'Email sended correctly' });
    expect(result).toEqual({ code: 0, message: 'Email sended correctly' });
  });

  it('propagates native non-JSON throttling without retrying', () => {
    let status: number | undefined;
    service.apiRequest(data, 'proof').subscribe({
      error: (error: HttpErrorResponse) => status = error.status
    });
    http.expectOne(endpoint).flush('Too many requests', {
      status: 429, statusText: 'Too Many Requests'
    });
    expect(status).toBe(429);
    http.expectNone(endpoint);
  });

  it('propagates network or CORS failures without retrying', () => {
    let status: number | undefined;
    service.apiRequest(data, 'proof').subscribe({
      error: (error: HttpErrorResponse) => status = error.status
    });
    http.expectOne(endpoint).error(new ProgressEvent('error'));
    expect(status).toBe(0);
    http.expectNone(endpoint);
  });

  it('bounds the wait and cancels an unanswered request', fakeAsync(() => {
    let failure: unknown;
    service.apiRequest(data, 'proof').subscribe({ error: error => failure = error });
    const request = http.expectOne(endpoint);
    tick(20_000);
    expect(failure instanceof TimeoutError).toBeTrue();
    expect(request.cancelled).toBeTrue();
    http.expectNone(endpoint);
  }));
});
