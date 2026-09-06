import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from './theme.service';

const STORAGE_KEY = 'warranty-tracker-theme';

type Listener = (event: { matches: boolean }) => void;

function installMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const state = { matches: initialMatches };
  const mql = {
    get matches() {
      return state.matches;
    },
    addEventListener: (_type: string, cb: Listener) => {
      listeners.add(cb);
    },
    removeEventListener: (_type: string, cb: Listener) => {
      listeners.delete(cb);
    },
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return {
    setMatches(matches: boolean) {
      state.matches = matches;
      listeners.forEach((cb) => cb({ matches }));
    },
  };
}

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to system mode and follows the system preference', () => {
    installMatchMedia(true);
    const service = new ThemeService();
    expect(service.mode()).toBe('system');
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('honors a saved light mode', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    installMatchMedia(true);
    const service = new ThemeService();
    expect(service.mode()).toBe('light');
    expect(service.theme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('cycles system -> light -> dark -> system and persists the mode', () => {
    installMatchMedia(false);
    const service = new ThemeService();

    expect(service.mode()).toBe('system');
    service.cycle();
    expect(service.mode()).toBe('light');
    service.cycle();
    expect(service.mode()).toBe('dark');
    expect(service.theme()).toBe('dark');
    service.cycle();
    expect(service.mode()).toBe('system');

    expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
  });

  it('updates live when the system theme changes while in system mode', () => {
    const media = installMatchMedia(false);
    const service = new ThemeService();
    expect(service.theme()).toBe('light');

    media.setMatches(true);
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('does not follow the system once an explicit mode is chosen', () => {
    const media = installMatchMedia(false);
    const service = new ThemeService();
    service.cycle(); // -> light
    expect(service.mode()).toBe('light');

    media.setMatches(true);
    expect(service.theme()).toBe('light');
  });
});
