import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TurnstileComponent } from './turnstile.component';
import { TurnstileApi, TurnstileOptions, TurnstileService } from '../../services/turnstile.service';

describe('TurnstileComponent', () => {
  let fixture: ComponentFixture<TurnstileComponent>;
  let component: TurnstileComponent;
  let api: jasmine.SpyObj<TurnstileApi>;
  let loader: jasmine.SpyObj<TurnstileService>;
  let options: TurnstileOptions;

  beforeEach(async () => {
    api = jasmine.createSpyObj('TurnstileApi', ['render', 'reset', 'remove']);
    api.render.and.callFake((_container, input) => {
      options = input;
      return 'widget-id';
    });
    loader = jasmine.createSpyObj('TurnstileService', ['load']);
    loader.load.and.resolveTo(api);
    await TestBed.configureTestingModule({
      imports: [TurnstileComponent],
      providers: [{ provide: TurnstileService, useValue: loader }]
    }).compileComponents();
    fixture = TestBed.createComponent(TurnstileComponent);
    component = fixture.componentInstance;
    component.siteKey = 'public-test-key';
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  it('renders explicit verification with the public key and expected action', () => {
    expect(options.sitekey).toBe('public-test-key');
    expect(options.action).toBe('contact');
    expect(options['response-field']).toBeFalse();
    const token = spyOn(component.tokenChange, 'emit');
    options.callback('proof');
    expect(token).toHaveBeenCalledWith('proof');
  });

  it('clears expired proof and resets verification', () => {
    const token = spyOn(component.tokenChange, 'emit');
    options['expired-callback']();
    expect(token).toHaveBeenCalledWith('');
    expect(api.reset).toHaveBeenCalledWith('widget-id');
  });

  it('clears proof on widget failures and allows manual recovery', () => {
    const token = spyOn(component.tokenChange, 'emit');
    const error = spyOn(component.verificationError, 'emit');
    options['error-callback']();
    expect(token).toHaveBeenCalledWith('');
    expect(error).toHaveBeenCalled();
    component.reset();
    expect(api.reset).toHaveBeenCalledWith('widget-id');
  });

  it('removes the widget on navigation and ignores late callbacks', () => {
    const token = spyOn(component.tokenChange, 'emit');
    fixture.destroy();
    expect(api.remove).toHaveBeenCalledWith('widget-id');
    options.callback('late-proof');
    expect(token).not.toHaveBeenCalled();
  });
});
