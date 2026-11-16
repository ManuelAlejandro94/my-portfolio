import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { locale as english } from '../../services/i18n/en';
import { locale as spanish } from '../../services/i18n/es';
import { ContactSuccessComponent } from './contact-success.component';

describe('ContactSuccessComponent', () => {
  let fixture: ComponentFixture<ContactSuccessComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    await TestBed.configureTestingModule({
      imports: [ContactSuccessComponent, TranslateModule.forRoot()],
      providers: [{ provide: Router, useValue: router }]
    }).compileComponents();
    const translations = TestBed.inject(TranslateService);
    translations.setTranslation('en', english.data);
    translations.setTranslation('es', spanish.data);
    translations.use('en');
    fixture = TestBed.createComponent(ContactSuccessComponent);
  });

  afterEach(() => fixture.destroy());

  it('shows confirmation and redirects only after seven seconds', fakeAsync(() => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Your message was sent successfully.');
    expect(fixture.nativeElement.textContent).toContain('7 seconds');
    tick(6000);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1 second.');
    expect(router.navigate).not.toHaveBeenCalled();
    tick(999);
    expect(router.navigate).not.toHaveBeenCalled();
    tick(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/home']);
    tick(7000);
    expect(router.navigate).toHaveBeenCalledTimes(1);
  }));

  it('returns home immediately when the fallback button is pressed', fakeAsync(() => {
    fixture.detectChanges();
    tick(2000);
    fixture.nativeElement.querySelector('button').click();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/home']);
    tick(7000);
    expect(router.navigate).toHaveBeenCalledTimes(1);
  }));

  it('cancels the countdown when the user leaves the page', fakeAsync(() => {
    fixture.detectChanges();
    tick(2000);
    fixture.destroy();
    tick(7000);
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('keeps the fallback usable if automatic navigation is cancelled', fakeAsync(() => {
    router.navigate.and.resolveTo(false);
    fixture.detectChanges();
    tick(7000);
    expect(router.navigate).toHaveBeenCalledTimes(1);
    router.navigate.and.resolveTo(true);
    fixture.nativeElement.querySelector('button').click();
    expect(router.navigate).toHaveBeenCalledTimes(2);
  }));

  it('renders the confirmation and redirect instructions in Spanish', fakeAsync(() => {
    TestBed.inject(TranslateService).use('es');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Tu mensaje fue enviado correctamente.');
    expect(text).toContain('7 segundos');
    expect(text).toContain('Si no eres redirigido');
    expect(text).toContain('Ir al inicio ahora');
    fixture.destroy();
  }));
});
