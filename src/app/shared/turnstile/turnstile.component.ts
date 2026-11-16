import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone,
  OnDestroy, Output, ViewChild
} from '@angular/core';
import { TurnstileApi, TurnstileService } from '../../services/turnstile.service';

@Component({
  selector: 'app-turnstile',
  standalone: true,
  template: '<div #container></div>',
  styles: [':host { display: block; min-height: 65px; margin: 1rem 0; }']
})
export class TurnstileComponent implements AfterViewInit, OnDestroy {
  @Input() siteKey = '';
  @Input() action = 'contact';
  @Output() readonly tokenChange = new EventEmitter<string>();
  @Output() readonly verificationError = new EventEmitter<void>();
  @ViewChild('container', { static: true }) private container!: ElementRef<HTMLElement>;
  private api?: TurnstileApi;
  private widgetId?: string;
  private destroyed = false;
  private initializing = false;

  constructor(private readonly turnstile: TurnstileService, private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    void this.initialize();
  }

  reset(): void {
    this.tokenChange.emit('');
    if (this.api && this.widgetId !== undefined) {
      try {
        this.api.reset(this.widgetId);
      } catch {
        this.verificationError.emit();
      }
    } else {
      void this.initialize();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.api && this.widgetId !== undefined) this.api.remove(this.widgetId);
  }

  private async initialize(): Promise<void> {
    if (this.initializing || this.destroyed) return;
    this.initializing = true;
    try {
      if (!this.siteKey) throw new Error('Verification is not configured');
      this.api = await this.turnstile.load();
      if (this.destroyed) return;
      this.widgetId = this.api.render(this.container.nativeElement, {
        sitekey: this.siteKey,
        action: this.action,
        'response-field': false,
        retry: 'never',
        callback: token => this.zone.run(() => {
          if (!this.destroyed) this.tokenChange.emit(token);
        }),
        'expired-callback': () => this.zone.run(() => {
          if (!this.destroyed) this.reset();
        }),
        'error-callback': () => this.zone.run(() => this.fail()),
        'timeout-callback': () => this.zone.run(() => this.fail())
      });
    } catch {
      this.zone.run(() => this.fail());
    } finally {
      this.initializing = false;
    }
  }

  private fail(): void {
    if (this.destroyed) return;
    this.tokenChange.emit('');
    this.verificationError.emit();
  }
}
