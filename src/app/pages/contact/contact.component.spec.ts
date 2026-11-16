import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { ContactComponent } from './contact.component';
import { ContactService } from '../../services/contact.service';
import { CONTACT_SETTINGS } from '../../services/contact-settings';
import { TurnstileApi, TurnstileService } from '../../services/turnstile.service';
import { TurnstileComponent } from '../../shared/turnstile/turnstile.component';
import { ApiResponse } from '../../interfaces/apiresponse.interface';

describe('ContactComponent', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let component: ContactComponent;
  let service: jasmine.SpyObj<ContactService>;
  let router: jasmine.SpyObj<Router>;
  let api: jasmine.SpyObj<TurnstileApi>;
  let previousLanguage: string | null;
  const valid = { name: 'Test User', email: 'test@example.com',
    subject: 'Contact test', message: 'Hello' };

  beforeEach(async () => {
    previousLanguage = sessionStorage.getItem('lang');
    sessionStorage.removeItem('lang');
    service = jasmine.createSpyObj('ContactService', ['apiRequest']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    api = jasmine.createSpyObj('TurnstileApi', ['render', 'reset', 'remove']);
    api.render.and.returnValue('widget-id');
    await TestBed.configureTestingModule({
      declarations: [ContactComponent],
      imports: [CommonModule, FormsModule, TranslateModule.forRoot(), TurnstileComponent],
      providers: [
        { provide: ContactService, useValue: service },
        { provide: Router, useValue: router },
        { provide: CONTACT_SETTINGS, useValue: {
          apiUrl: 'http://localhost:8888/grima-bot',
          turnstileSiteKey: 'public-test-key', turnstileAction: 'contact'
        } },
        { provide: TurnstileService, useValue: { load: () => Promise.resolve(api) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    if (previousLanguage === null) sessionStorage.removeItem('lang');
    else sessionStorage.setItem('lang', previousLanguage);
  });

  function form(): NgForm {
    return fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
  }

  async function fill(): Promise<void> {
    component.contactModel = { ...valid };
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('registers every field with form validation and blocks an empty form', () => {
    expect(Object.keys(form().controls).sort()).toEqual(['email', 'message', 'name', 'subject']);
    component.onToken('proof');
    component.contact(form());
    expect(service.apiRequest).not.toHaveBeenCalled();
    expect(component.errorKey).toBe('contact.invalidForm');
    expect((fixture.nativeElement.querySelector('button[type=submit]') as HTMLButtonElement).disabled)
      .toBeTrue();
  });

  it('requires proof even for an otherwise valid contact', async () => {
    await fill();
    component.contact(form());
    expect(service.apiRequest).not.toHaveBeenCalled();
    expect(component.errorKey).toBe('contact.verificationError');
  });

  it('rejects whitespace-only content before sending', async () => {
    await fill();
    component.contactModel.message = '   ';
    component.onToken('proof');
    component.contact(form());
    expect(service.apiRequest).not.toHaveBeenCalled();
    expect(component.errorKey).toBe('contact.invalidForm');
  });

  it('preserves the success contract, trims values and supplies a valid language fallback', async () => {
    await fill();
    component.contactModel.name = '  Test User  ';
    service.apiRequest.and.returnValue(of({ code: 0, message: 'Email sended correctly' }));
    component.onToken('proof');
    component.contact(form());
    expect(service.apiRequest).toHaveBeenCalledOnceWith({ ...valid, lang: 'en' }, 'proof');
    expect(router.navigate).toHaveBeenCalledWith(['/contact/success']);
    expect(component.loading).toBeFalse();
  });

  it('keeps the widget mounted and prevents duplicate in-flight submissions', async () => {
    await fill();
    const response = new Subject<ApiResponse>();
    service.apiRequest.and.returnValue(response);
    const widget = fixture.debugElement.query(By.directive(TurnstileComponent)).componentInstance;
    component.onToken('proof');
    component.contact(form());
    fixture.detectChanges();
    component.contact(form());
    expect(component.loading).toBeTrue();
    expect(service.apiRequest).toHaveBeenCalledTimes(1);
    expect(fixture.debugElement.query(By.directive(TurnstileComponent)).componentInstance).toBe(widget);
    response.next({ code: 0, message: 'Email sended correctly' });
    response.complete();
    expect(component.loading).toBeFalse();
  });

  it('restores the form after errors, preserves the message and requests fresh proof', async () => {
    await fill();
    for (const [status, key] of [
      [403, 'contact.verificationError'], [422, 'contact.invalidForm'],
      [429, 'contact.rateLimited'], [503, 'contact.unavailable'],
      [500, 'contact.deliveryUnconfirmed'], [0, 'contact.deliveryUnconfirmed']
    ] as const) {
      service.apiRequest.and.returnValue(throwError(() => new HttpErrorResponse({
        status, error: 'non-JSON upstream text'
      })));
      component.onToken('proof');
      component.contact(form());
      expect(component.errorKey).toBe(key);
      expect(component.loading).toBeFalse();
      expect(component.token).toBe('');
      expect(component.contactModel.message).toBe(valid.message);
    }
    expect(api.reset).toHaveBeenCalledTimes(6);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('invalidates expired proof and leaves verification failures recoverable', async () => {
    await fill();
    component.onToken('proof');
    component.onVerificationError();
    component.contact(form());
    expect(service.apiRequest).not.toHaveBeenCalled();
    component.onToken('fresh-proof');
    expect(component.errorKey).toBe('');
  });

  it('uses Spanish when selected and releases pending requests on navigation', async () => {
    await fill();
    sessionStorage.setItem('lang', 'es');
    const response = new Subject<ApiResponse>();
    service.apiRequest.and.returnValue(response);
    component.onToken('proof');
    component.contact(form());
    expect(service.apiRequest).toHaveBeenCalledWith({ ...valid, lang: 'es' }, 'proof');
    component.ngOnDestroy();
    expect(component.loading).toBeFalse();
  });
});
