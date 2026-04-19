import { useSessionStore } from '../lib/stores/sessionStore';

beforeEach(() => {
  useSessionStore.setState({ theme: 'light', language: 'ko' });
  document.documentElement.classList.remove('dark');
});

describe('sessionStore', () => {
  it('defaults to light theme and ko language', () => {
    const { theme, language } = useSessionStore.getState();
    expect(theme).toBe('light');
    expect(language).toBe('ko');
  });

  it('setTheme updates state and toggles dark class', () => {
    useSessionStore.getState().setTheme('dark');
    expect(useSessionStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    useSessionStore.getState().setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('setLanguage updates state', () => {
    useSessionStore.getState().setLanguage('en');
    expect(useSessionStore.getState().language).toBe('en');
  });
});
