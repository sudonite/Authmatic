import {
  clearApp,
  loadApp,
  saveApp,
  SETUP_VIEWS,
  type SetupView,
} from "@/storage/app-repository";
import { themes, DEFAULT_THEME, applyTheme } from "@/utils/themes";

type App = {
  currentView: View;
  autoLogin: boolean;
  error: CapturedError | null;
  theme: string;
};

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

function isSetupView(value: unknown): value is SetupView {
  return (SETUP_VIEWS as readonly unknown[]).includes(value);
}

// All storage writes run through this queue so rapid navigations cannot
// persist out of order.
let persistQueue: Promise<void> = Promise.resolve();

function enqueuePersist(
  action: () => Promise<void>,
  failureMessage: string,
): Promise<void> {
  persistQueue = persistQueue
    .then(action)
    .catch((error) => {
      console.error(failureMessage, error);
    });

  return persistQueue;
}

function queuePersist(): Promise<void> {
  return enqueuePersist(
    () =>
      saveApp({
        autoLogin: app.autoLogin,
        theme: app.theme,
        setupView: isSetupView(app.currentView) ? app.currentView : null,
      }),
    "Failed to save app settings:",
  );
}

async function initializeApp(): Promise<View | null> {
  const stored = await loadApp();

  app.theme =
    stored?.theme && themes.includes(stored.theme)
      ? stored.theme
      : DEFAULT_THEME;

  app.autoLogin = stored?.autoLogin ?? true;

  applyTheme(app.theme);

  return stored && isSetupView(stored.setupView) ? stored.setupView : null;
}

function setView(view: View): void {
  app.currentView = view;
  void queuePersist();
}

async function setTheme(theme: string): Promise<void> {
  if (!themes.includes(theme)) {
    throw new Error(`Unknown theme: ${theme}`);
  }

  app.theme = theme;
  applyTheme(theme);
  await queuePersist();
}

async function setAutoLogin(autoLogin: boolean): Promise<void> {
  app.autoLogin = autoLogin;
  await queuePersist();
}

async function resetApp(): Promise<void> {
  app.currentView = "loading";
  app.autoLogin = true;
  app.error = null;
  app.theme = DEFAULT_THEME;
  // Chained behind queued saves so no pending write resurrects data.
  await enqueuePersist(clearApp, "Failed to clear app settings:");
}

export { app, initializeApp, setView, setTheme, setAutoLogin, resetApp };
export type { App, CapturedError, View };