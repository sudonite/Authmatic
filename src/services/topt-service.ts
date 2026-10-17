import { readQrCode } from "@/totp/qrcode";
import {
    extractOTPAuth,
    extactOTPAuthMigration,
} from "@/totp/otpauth"

export async function extractSecretFromQRCode(file: Blob): Promise<string> {
    const qrContent = await readQrCode(file);

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