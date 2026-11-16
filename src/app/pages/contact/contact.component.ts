import { Component, ChangeDetectionStrategy, Inject, OnDestroy, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { CONTACT_SETTINGS, ContactSettings } from '../../services/contact-settings';
import { ContactInterface } from '../../interfaces/contact.interface';
import { ApiResponse } from '../../interfaces/apiresponse.interface';
import { TurnstileComponent } from '../../shared/turnstile/turnstile.component';

@Component({
  standalone: false,
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnDestroy {
  @ViewChild(TurnstileComponent) verification?: TurnstileComponent;
  contactModel: ContactInterface = {};
  response?: ApiResponse;
  loading = false;
  token = '';
  errorKey = '';
  private submission?: Subscription;

  constructor(
    private readonly contactService: ContactService,
    private readonly router: Router,
    @Inject(CONTACT_SETTINGS) readonly settings: ContactSettings
  ) {}

  get configured(): boolean {
    return !!this.settings.apiUrl && !!this.settings.turnstileSiteKey;
  }

  onToken(token: string): void {
    this.token = token;
    if (token && this.errorKey === 'contact.verificationError') this.errorKey = '';
  }

  onVerificationError(): void {
    this.token = '';
    this.errorKey = 'contact.verificationError';
  }

  contact(form: NgForm): void {
    if (this.loading) return;
    this.errorKey = '';
    const data = this.normalizedContact();
    if (form.invalid || !data) {
      form.control.markAllAsTouched();
      this.errorKey = 'contact.invalidForm';
      return;
    }
    if (!this.configured) {
      this.errorKey = 'contact.unavailable';
      return;
    }
    if (!this.token) {
      this.errorKey = 'contact.verificationError';
      return;
    }
    const proof = this.token;
    this.token = '';
    this.loading = true;
    this.submission = this.contactService.apiRequest(data, proof).pipe(
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: response => {
        this.response = response;
        if (response.code === 0) {
          // Show confirmation only after Grima confirms successful delivery.
          void this.router.navigate(['/contact/success']);
        } else {
          this.errorKey = 'contact.deliveryUnconfirmed';
          this.verification?.reset();
        }
      },
      error: (error: unknown) => {
        // Platform throttling can surface as non-JSON or as status 0.
        // Do not display upstream details, log payloads or automatically retry.
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        this.errorKey = ({
          400: 'contact.invalidForm', 403: 'contact.verificationError',
          413: 'contact.invalidForm', 415: 'contact.invalidForm',
          422: 'contact.invalidForm', 429: 'contact.rateLimited',
          503: 'contact.unavailable'
        } as Record<number, string>)[status] ?? 'contact.deliveryUnconfirmed';
        this.verification?.reset();
      }
    });
  }

  ngOnDestroy(): void {
    this.submission?.unsubscribe();
  }

  private normalizedContact(): ContactInterface | undefined {
    const data = {
      name: this.contactModel.name?.trim() ?? '',
      email: this.contactModel.email?.trim() ?? '',
      subject: this.contactModel.subject?.trim() ?? '',
      message: this.contactModel.message?.trim() ?? '',
      lang: sessionStorage.getItem('lang') === 'es' ? 'es' : 'en'
    };
    if (data.name.length < 3 || data.name.length > 60 ||
        data.email.length < 5 || data.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
        data.subject.length < 4 || data.subject.length > 300 ||
        data.message.length < 1 || data.message.length > 3000 ||
        Object.values(data).some(value => /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value))) {
      return undefined;
    }
    return data;
  }
}
