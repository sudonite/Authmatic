const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const BASE32_BITS_PER_CHAR = 5;
const BYTE_BITS = 8;
const COUNTER_BYTES = 8;

const DEFAULT_PERIOD_SECONDS = 30;
const DEFAULT_DIGITS = 6;

export type TotpOptions = {
    periodSeconds?: number;
    digits?: number;
};

function decodeBase32(secret: string): Uint8Array<ArrayBuffer> {
    const normalized = secret
        .replace(/=+$/, "")
        .replace(/\s+/g, "")
        .toUpperCase();

    const bytes: number[] = [];
    let buffer = 0;
    let bitCount = 0;

    for (const character of normalized) {
        const value = BASE32_ALPHABET.indexOf(character);

        if (value === -1) {
            throw new Error(
                `The secret key contains an invalid Base32 character: ${character}`,
            );
        }

        buffer = (buffer << BASE32_BITS_PER_CHAR) | value;
        bitCount += BASE32_BITS_PER_CHAR;

        if (bitCount >= BYTE_BITS) {
            bitCount -= BYTE_BITS;
            bytes.push((buffer >>> bitCount) & 0xff);
        }
    }

    if (bytes.length === 0) {
        throw new Error("The secret key is empty.");
    }

    return Uint8Array.from(bytes) as Uint8Array<ArrayBuffer>;
}

function counterToBytes(counter: number): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(COUNTER_BYTES);
    let remaining = counter;

    for (let index = COUNTER_BYTES - 1; index >= 0; index--) {
        bytes[index] = remaining & 0xff;
        remaining = Math.floor(remaining / 256);
    }

    return bytes;
}

async function hmacSha1(
    key: Uint8Array<ArrayBuffer>,
    message: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"],
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);

    return new Uint8Array(signature);
}

function dynamicTruncate(hash: Uint8Array): number {
    const offset = (hash[hash.length - 1] ?? 0) & 0x0f;

    const b0 = (hash[offset] ?? 0) & 0x7f;
    const b1 = hash[offset + 1] ?? 0;
    const b2 = hash[offset + 2] ?? 0;
    const b3 = hash[offset + 3] ?? 0;

    return (
        (b0 << (BYTE_BITS * 3)) |
        (b1 << (BYTE_BITS * 2)) |
        (b2 << BYTE_BITS) |
        b3
    );
}

export function getTotpCounter(
    timestampMs: number,
    periodSeconds: number,
): number {
    return Math.floor(timestampMs / 1000 / periodSeconds);
}

export function getSecondsRemaining(
    timestampMs: number,
    periodSeconds: number = DEFAULT_PERIOD_SECONDS,
): number {
    const elapsedMs = timestampMs % (periodSeconds * 1000);
    const remainingMs = periodSeconds * 1000 - elapsedMs;

    return Math.ceil(remainingMs / 1000);
}

export async function generateTotpCode(
    secret: string,
    timestampMs: number = Date.now(),
    options: TotpOptions = {},
): Promise<string> {
    const periodSeconds = options.periodSeconds ?? DEFAULT_PERIOD_SECONDS;
    const digits = options.digits ?? DEFAULT_DIGITS;

    const counter = getTotpCounter(timestampMs, periodSeconds);
    const key = decodeBase32(secret);
    const hash = await hmacSha1(key, counterToBytes(counter));
    const binary = dynamicTruncate(hash);

    return String(binary % 10 ** digits).padStart(digits, "0");
}
