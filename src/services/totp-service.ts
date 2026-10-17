import { downloadQRCodePng, readQRCode } from "@/totp/qrcode";
import {
    extractOTPAuth,
    extactOTPAuthMigration,
} from "@/totp/otpauth";
import {
    generateTotpCode,
    getSecondsRemaining,
    getTotpCounter,
} from "@/totp/totp";
import { getUser } from "@/state/user-state.svelte";

export const OTP_PERIOD_SECONDS = 30;

export type OtpState = {
    code: string;
    secondsLeft: number;
    periodSeconds: number;
};

type CachedOtp = {
    counter: number;
    code: string;
};

let cachedOtp: CachedOtp | null = null;

export async function extractSecretFromQRCode(file: Blob): Promise<string> {
    const qrContent = await readQRCode(file);

    if (qrContent.startsWith("otpauth://")) {
        return extractOTPAuth(qrContent);
    }

    if (qrContent.startsWith("otpauth-migration://")) {
        return extactOTPAuthMigration(qrContent);
    }

    throw new Error("The QR code does not contain a valid OTP URI or migration data.");
}

export function extractSecretFromInput(value: string): string {
    const input = value.trim();

    if (/^[A-Z2-7]{56}$/.test(input)) {
        return input;
    }

    if (input.startsWith("otpauth://")) {
        return extractOTPAuth(input);
    }

    if (input.startsWith("otpauth-migration://")) {
        return extactOTPAuthMigration(input);
    }

    throw new Error("The provided value does not contain a valid OTP URI, migration data, or secret key.");
}

export async function getOtpState(timestampMs: number = Date.now()): Promise<OtpState> {
    const secret = getUser().secretKey;
    const counter = getTotpCounter(timestampMs, OTP_PERIOD_SECONDS);

    if (!cachedOtp || cachedOtp.counter !== counter) {
        const code = await generateTotpCode(secret, timestampMs, {
            periodSeconds: OTP_PERIOD_SECONDS,
        });

        cachedOtp = { counter, code };
    }

    return {
        code: cachedOtp.code,
        secondsLeft: getSecondsRemaining(timestampMs, OTP_PERIOD_SECONDS),
        periodSeconds: OTP_PERIOD_SECONDS,
    };
}

export function getSecretKey(): string {
    return getUser().secretKey;
}

export function copySecretKeyToClipboard(): void {
    const secretKey = getSecretKey();
    navigator.clipboard.writeText(secretKey);
}

export function generateOTPAuthUri(): string {
    const neptunCode = encodeURIComponent(getUser().neptunCode);
    const secretKey = "?secret=" + encodeURIComponent(getUser().secretKey);
    return `otpauth://totp/Neptun:${neptunCode}?secret=${secretKey}&issuer=Neptun&algorithm=SHA1&digits=6&period=30`
}

export function downloadQRCode() {
    let uri = generateOTPAuthUri();
    let neptunCode = encodeURIComponent(getUser().neptunCode);
    let filename = `qrcode_${neptunCode}.png`;
    downloadQRCodePng(uri, filename);
}