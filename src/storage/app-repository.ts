import { storage } from "#imports";

// Single source of truth for the resumable setup steps; SetupView is derived
// from it so the runtime list and the type cannot drift apart.
const SETUP_VIEWS = [
    "setup-credentials",
    "setup-method",
    "setup-qrcode",
    "setup-secretkey",
] as const;

type SetupView = (typeof SETUP_VIEWS)[number];

type App = {
    autoLogin: boolean;
    theme: string;
    setupView: SetupView | null;
};

const appItem = storage.defineItem<App>("local:app");

async function loadApp(): Promise<App | null> {
    return await appItem.getValue();
}

async function saveApp(app: App): Promise<void> {
    await appItem.setValue(app);
}

async function clearApp(): Promise<void> {
    await appItem.removeValue();
}

export { SETUP_VIEWS, loadApp, saveApp, clearApp };
export type { App, SetupView };

