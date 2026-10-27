import { sendExtensionMessage } from "@/messaging/messages";

const USERNAME_SELECTOR = "#userName";
const PASSWORD_SELECTOR = "#password-form-password";
const TWO_FACTOR_INPUT_SELECTOR = "#two-factor-qr-code-input-form-input";

const ELEMENT_TIMEOUT_MS = 15_000;
const BUTTON_TIMEOUT_MS = 5_000;

export default defineContentScript({
  matches: ["https://neptun-hweb.sze.hu/hallgato_ng/login*"],

  runAt: "document_idle",

  async main() {
    try {
      await performLogin();
    } catch (error) {
      // Only messages are logged; credentials and codes never are.
      console.warn(
        "Authmatic: automatic login failed.",
        error instanceof Error ? error.message : error,
      );
    }
  },
});

async function performLogin(): Promise<void> {
  const credentials = await sendExtensionMessage({
    type: "neptun:prepare-login",
  });

  if (!credentials.ok) {
    throw new Error(credentials.error);
  }

  if (!("login" in credentials)) {
    throw new Error("The extension returned an unexpected login response.");
  }

  if (!credentials.login.autoLogin) {
    return;
  }

  const usernameInput = await waitForElement<HTMLInputElement>(
    USERNAME_SELECTOR,
    ELEMENT_TIMEOUT_MS,
  );
  const passwordInput = await waitForElement<HTMLInputElement>(
    PASSWORD_SELECTOR,
    ELEMENT_TIMEOUT_MS,
  );

  setInputValue(usernameInput, credentials.login.neptunCode);
  setInputValue(passwordInput, credentials.login.password);

  const loginForm = usernameInput.closest("form");

  if (!loginForm) {
    throw new Error("The Neptun login form was not found.");
  }

  const loginButton = loginForm.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );

  if (!loginButton) {
    throw new Error("The Neptun login button was not found.");
  }

  loginForm.requestSubmit(loginButton);

  const twoFactorInput = await waitForElement<HTMLInputElement>(
    TWO_FACTOR_INPUT_SELECTOR,
    ELEMENT_TIMEOUT_MS,
  );

  const totpResponse = await sendExtensionMessage({
    type: "neptun:generate-totp",
  });

  if (!totpResponse.ok) {
    throw new Error(totpResponse.error);
  }

  if (!("code" in totpResponse)) {
    throw new Error("The extension returned an unexpected TOTP response.");
  }

  setInputValue(twoFactorInput, totpResponse.code);

  const twoFactorButton = await waitForEnabledButton(
    twoFactorInput,
    BUTTON_TIMEOUT_MS,
  );

  twoFactorButton.click();
}

function setInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  if (!setter) {
    throw new Error("The input value setter was not found.");
  }

  setter.call(input, value);

  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("blur", { bubbles: true }));
}

async function waitForElement<T extends Element>(
  selector: string,
  timeout: number,
): Promise<T> {
  const existing = document.querySelector<T>(selector);

  if (existing) {
    return existing;
  }

  return new Promise<T>((resolve, reject) => {
    let finished = false;

    const observer = new MutationObserver(() => {
      const element = document.querySelector<T>(selector);

      if (!element || finished) {
        return;
      }

      finished = true;
      observer.disconnect();
      clearTimeout(timer);
      resolve(element);
    });

    const timer = window.setTimeout(() => {
      if (finished) {
        return;
      }

      finished = true;
      observer.disconnect();
      reject(new Error(`The element did not appear in time: ${selector}`));
    }, timeout);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

async function waitForEnabledButton(
  input: HTMLInputElement,
  timeout: number,
): Promise<HTMLButtonElement> {
  const form = input.closest("form");

  if (!form) {
    throw new Error("The two-factor form was not found.");
  }

  const findButton = (): HTMLButtonElement | null => {
    const button = form.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    if (!button || button.disabled) {
      return null;
    }

    return button;
  };

  const existing = findButton();

  if (existing) {
    return existing;
  }

  return new Promise<HTMLButtonElement>((resolve, reject) => {
    let finished = false;

    const observer = new MutationObserver(() => {
      const button = findButton();

      if (!button || finished) {
        return;
      }

      finished = true;
      observer.disconnect();
      clearTimeout(timer);
      resolve(button);
    });

    const timer = window.setTimeout(() => {
      if (finished) {
        return;
      }

      finished = true;
      observer.disconnect();
      reject(new Error("The two-factor submit button did not enable in time."));
    }, timeout);

    observer.observe(form, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  });
}
