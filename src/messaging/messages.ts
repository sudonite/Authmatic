import { browser } from "#imports";

type NeptunPrepareLoginMessage = {
    type: "neptun:prepare-login";
};

type NeptunGenerateTotpMessage = {
    type: "neptun:generate-totp";
};

type ExtensionMessage = NeptunPrepareLoginMessage | NeptunGenerateTotpMessage;

type LoginCredentials = {
    neptunCode: string;
    password: string;
    autoLogin: boolean;
};

type PrepareLoginResponse =
    | { ok: true; login: LoginCredentials }
    | { ok: false; error: string };

type GenerateTotpResponse =
    | { ok: true; code: string }
    | { ok: false; error: string };

type ExtensionResponse = PrepareLoginResponse | GenerateTotpResponse;

const MESSAGE_TYPES = [
    "neptun:prepare-login",
    "neptun:generate-totp",
] as const;

function isExtensionMessage(value: unknown): value is ExtensionMessage {
    if (typeof value !== "object" || value === null || !("type" in value)) {
        return false;
    }

    const type = (value as { type: unknown }).type;

    return MESSAGE_TYPES.some((known) => known === type);
}

function isLoginCredentials(value: unknown): value is LoginCredentials {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const login = value as Record<string, unknown>;

    return (
        typeof login.neptunCode === "string" &&
        typeof login.password === "string" &&
        typeof login.autoLogin === "boolean"
    );
}

function isExtensionResponse(value: unknown): value is ExtensionResponse {
    if (typeof value !== "object" || value === null || !("ok" in value)) {
        return false;
    }

    const response = value as Record<string, unknown>;

    if (response.ok === false) {
        return typeof response.error === "string";
    }

    if (response.ok !== true) {
        return false;
    }

    if ("code" in response) {
        return typeof response.code === "string";
    }

    if ("login" in response) {
        return isLoginCredentials(response.login);
    }

    return false;
}

async function sendExtensionMessage(
    message: ExtensionMessage,
): Promise<ExtensionResponse> {
    let response: unknown;

    try {
        response = await browser.runtime.sendMessage(message);
    } catch {
        throw new Error("The extension did not respond to the message.");
    }

    if (!isExtensionResponse(response)) {
        throw new Error("The extension returned an unexpected response.");
    }

    return response;
}

export { isExtensionMessage, sendExtensionMessage };
export type {
    ExtensionMessage,
    ExtensionResponse,
    GenerateTotpResponse,
    LoginCredentials,
    PrepareLoginResponse,
};
