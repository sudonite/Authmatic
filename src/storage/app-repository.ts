import { storage } from "#imports";

type App = {
    autoLogin: boolean;
    theme: string;
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

export { loadApp, saveApp, clearApp };
export type { App };

