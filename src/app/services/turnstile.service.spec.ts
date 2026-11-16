import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { TurnstileApi, TurnstileService } from './turnstile.service';

describe('TurnstileService script loading', () => {
  let script: HTMLScriptElement;
  let browser: Window & { turnstile?: TurnstileApi };
  let service: TurnstileService;
  let ready: jasmine.Spy;
  let api: TurnstileApi & { ready: jasmine.Spy };
  let append: jasmine.Spy;

  beforeEach(() => {
    browser = { setTimeout: window.setTimeout.bind(window),
      clearTimeout: window.clearTimeout.bind(window) } as typeof browser;
    ready = jasmine.createSpy('ready').and.callFake((callback: () => void) => {
      // Reproduce Cloudflare's documented loading-mode restriction.
      if (script?.async || script?.defer) {
        throw new Error('[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready().');
      }
      callback();
    });
    api = { ready, render: jasmine.createSpy('render'),
      reset: jasmine.createSpy('reset'), remove: jasmine.createSpy('remove') };
    append = jasmine.createSpy('append').and.callFake((element: HTMLScriptElement) => {
      script = element; // Never attach an external script or contact Cloudflare.
    });
    service = new TurnstileService({
      defaultView: browser, head: { append },
      createElement: () => document.createElement('script')
    } as unknown as Document);
  });

  it('resolves after asynchronous script load without calling incompatible ready', fakeAsync(() => {
    let loaded: TurnstileApi | undefined;
    service.load().then(value => loaded = value, () => undefined);
    expect(loaded).toBeUndefined();
    expect(script.async).toBeTrue();
    browser.turnstile = api;
    expect(() => script.onload?.call(script, new Event('load'))).not.toThrow();
    flushMicrotasks();
    tick(15_000);
    expect(loaded).toBe(api);
    expect(ready).not.toHaveBeenCalled();
  }));

  it('reuses an already loaded API without ready or another script', fakeAsync(() => {
    browser.turnstile = api;
    let loaded: TurnstileApi | undefined;
    service.load().then(value => loaded = value, () => undefined);
    flushMicrotasks();
    expect(loaded).toBe(api);
    expect(append).not.toHaveBeenCalled();
    expect(ready).not.toHaveBeenCalled();
  }));

  it('shares concurrent loads and permits retry after script failure', fakeAsync(() => {
    const first = service.load();
    const second = service.load();
    expect(first).toBe(second);
    let rejected = false;
    first.catch(() => rejected = true);
    script.onerror?.call(script, new Event('error'));
    flushMicrotasks();
    expect(rejected).toBeTrue();
    let loaded: TurnstileApi | undefined;
    service.load().then(value => loaded = value, () => undefined);
    browser.turnstile = api;
    expect(() => script.onload?.call(script, new Event('load'))).not.toThrow();
    flushMicrotasks();
    tick(15_000);
    expect(loaded).toBe(api);
    expect(append).toHaveBeenCalledTimes(2);
  }));

  it('rejects a stalled script load and clears the cached attempt', fakeAsync(() => {
    let rejected = false;
    const first = service.load();
    first.catch(() => rejected = true);
    tick(15_000);
    expect(rejected).toBeTrue();
    const second = service.load();
    second.catch(() => undefined);
    expect(second).not.toBe(first);
    script.onerror?.call(script, new Event('error'));
    flushMicrotasks();
  }));
});
