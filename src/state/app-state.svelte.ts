import { clearApp, loadApp, saveApp } from "@/storage/app-repository";
import { themes, DEFAULT_THEME, applyTheme } from "@/utils/themes";

type App = {
  currentView: View
  autoLogin: boolean
  error: CapturedError | null
  theme: string
}

type View =
  | "loading"
  | "error"
  | "setup-credentials"
  | "setup-method"
  | "setup-qrcode"
  | "setup-secretkey"
  | "dashboard"
  | "themes"
  | "settings"
  | "show-qrcode"
  | "show-secretkey";

type CapturedError = {
  name: string;
  message: string;
  stack: string | null;
  source: "uncaught" | "unhandled-rejection";
  at: string;
};

const app: App = $state({
  currentView: "loading",
  autoLogin: true,
  error: null,
  theme: DEFAULT_THEME,
});

async function initializeApp(): Promise<void> {
  const stored = await loadApp();

  app.theme =
    stored?.theme && themes.includes(stored.theme)
      ? stored.theme
      : DEFAULT_THEME;

  applyTheme(app.theme);
}

async function setTheme(theme: string): Promise<void> {
  if (!themes.includes(theme)) {
    throw new Error(`Unknown theme: ${theme}`);
  }

  app.theme = theme;
  applyTheme(theme);
  await saveApp({ autoLogin: app.autoLogin, theme });
}

async function setAutoLogin(autoLogin: boolean): Promise<void> {
  app.autoLogin = autoLogin;
  await saveApp({ autoLogin, theme: app.theme });
}

async function resetApp(): Promise<void> {
  app.currentView = "loading";
  app.autoLogin = true;
  app.error = null;
  app.theme = DEFAULT_THEME;
  await clearApp();
}

export { app, initializeApp, setTheme, setAutoLogin, resetApp };
export type { App, CapturedError, View };