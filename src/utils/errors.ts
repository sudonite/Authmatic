import { app } from "@/state/app-state.svelte";
import type { CapturedError } from "@/state/app-state.svelte";

const captureError = (source: CapturedError["source"], err: unknown): void => {
    const error = err instanceof Error ? err : new Error(String(err));

    app.error = {
        name: error.name,
        message: error.message,
        stack: error.stack ?? null,
        source,
        at: new Date().toISOString(),
    };
    app.currentView = "error";
};

const initializeErrorHandlers = (): void => {
    window.addEventListener("error", (event) => {
        captureError("uncaught", event.error ?? event.message);
    });

    window.addEventListener("unhandledrejection", (event) => {
        captureError("unhandled-rejection", event.reason);
    });
};

export { initializeErrorHandlers };