import {
  isExtensionMessage,
  type ExtensionResponse,
  type GenerateTotpResponse,
  type PrepareLoginResponse,
} from "@/messaging/messages";
import { initializeUser } from "@/state/user-state.svelte";
import { getOtpState } from "@/services/totp-service";
import { loadApp } from "@/storage/app-repository";

const DEFAULT_AUTO_LOGIN = true;

async function handlePrepareLogin(): Promise<PrepareLoginResponse> {
  try {
    const [user, appSettings] = await Promise.all([
      initializeUser(),
      loadApp(),
    ]);

    if (!user) {
      return { ok: false, error: "No saved Neptun account was found." };
    }

    return {
      ok: true,
      login: {
        neptunCode: user.neptunCode,
        password: user.password,
        autoLogin: appSettings?.autoLogin ?? DEFAULT_AUTO_LOGIN,
      },
    };
  } catch {
    return { ok: false, error: "Failed to load the saved account." };
  }
}

async function handleGenerateTotp(): Promise<GenerateTotpResponse> {
  try {
    const user = await initializeUser();

    if (!user) {
      return { ok: false, error: "No saved Neptun account was found." };
    }

    const otpState = await getOtpState();

    return { ok: true, code: otpState.code };
  } catch {
    // Do not forward the underlying error: TOTP errors can quote the secret.
    return { ok: false, error: "Failed to generate the TOTP code." };
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (message: unknown): Promise<ExtensionResponse> => {
      if (!isExtensionMessage(message)) {
        return Promise.resolve({
          ok: false,
          error: "Unknown extension message.",
        });
      }

      switch (message.type) {
        case "neptun:prepare-login":
          return handlePrepareLogin();
        case "neptun:generate-totp":
          return handleGenerateTotp();
      }
    },
  );
});
