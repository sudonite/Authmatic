export type MigrationAccount = {
    secret: string;
    name: string;
    issuer: string;
    algorithm: "SHA1" | "SHA256" | "SHA512" | "MD5";
    digits: 6 | 8;
    type: "TOTP" | "HOTP";
    counter: number;
};

type ProtobufField = {
    number: number;
    wireType: number;
    value: Uint8Array | number;
};

function readVarint(
    data: Uint8Array,
    state: { offset: number },
): number {
    let result = 0;
    let shift = 0;

    while (state.offset < data.length && shift < 35) {
        const byte = data[state.offset++];

        if (byte === undefined) {
            throw new Error("Invalid or truncated Protobuf data.");
        }

        result |= (byte & 0x7f) << shift;

        if ((byte & 0x80) === 0) {
            return result >>> 0;
        }

        shift += 7;
    }

    throw new Error("Invalid or truncated Protobuf data.");
}

function readFields(data: Uint8Array): ProtobufField[] {
    const fields: ProtobufField[] = [];
    const state = { offset: 0 };

    while (state.offset < data.length) {
        const tag = readVarint(data, state);
        const number = tag >>> 3;
        const wireType = tag & 7;

        if (number === 0) {
            throw new Error("Invalid Protobuf field.");
        }

        if (wireType === 0) {
            fields.push({
                number,
                wireType,
                value: readVarint(data, state),
            });
        } else if (wireType === 2) {
            const length = readVarint(data, state);
            const end = state.offset + length;

            if (end > data.length) {
                throw new Error("Truncated Protobuf field.");
            }

            fields.push({
                number,
                wireType,
                value: data.slice(state.offset, end),
            });

            state.offset = end;
        } else if (wireType === 1) {
            state.offset += 8;

            if (state.offset > data.length) {
                throw new Error("Truncated Protobuf field.");
            }
        } else if (wireType === 5) {
            state.offset += 4;

            if (state.offset > data.length) {
                throw new Error("Truncated Protobuf field.");
            }
        } else {
            throw new Error("Unsupported Protobuf wire type.");
        }
    }

    return fields;
}

function getBytes(
    fields: ProtobufField[],
    number: number,
): Uint8Array | undefined {
    const field = fields.find(
        (field) => field.number === number && field.wireType === 2,
    );

    return field?.value instanceof Uint8Array
        ? field.value
        : undefined;
}

function getNumber(
    fields: ProtobufField[],
    number: number,
    fallback = 0,
): number {
    const field = fields.find(
        (field) => field.number === number && field.wireType === 0,
    );

    return typeof field?.value === "number"
        ? field.value
        : fallback;
}

function getString(
    fields: ProtobufField[],
    number: number,
): string {
    const bytes = getBytes(fields, number);
    return bytes ? new TextDecoder().decode(bytes) : "";
}

function bytesToBase32(bytes: Uint8Array): string {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let result = "";
    let buffer = 0;
    let bits = 0;

    for (const byte of bytes) {
        buffer = (buffer << 8) | byte;
        bits += 8;

        while (bits >= 5) {
            bits -= 5;
            result += alphabet[(buffer >>> bits) & 31];
        }

        buffer &= (1 << bits) - 1;
    }

    if (bits > 0) {
        result += alphabet[(buffer << (5 - bits)) & 31];
    }

    return result;
}

function decodeAccount(data: Uint8Array): MigrationAccount {
    const fields = readFields(data);
    const secret = getBytes(fields, 1);

    if (!secret?.length) {
        throw new Error("The migration account is missing its secret key.");
    }

    const algorithmValue = getNumber(fields, 4);
    const digitsValue = getNumber(fields, 5);
    const typeValue = getNumber(fields, 6);

    const algorithms = {
        0: "SHA1",
        1: "SHA1",
        2: "SHA256",
        3: "SHA512",
        4: "MD5",
    } as const;

    const algorithm =
        algorithms[algorithmValue as keyof typeof algorithms];

    if (!algorithm) {
        throw new Error("Unsupported OTP algorithm.");
    }

    if (digitsValue !== 0 && digitsValue !== 1 && digitsValue !== 2) {
        throw new Error("Unsupported OTP digit count.");
    }

    if (typeValue !== 1 && typeValue !== 2) {
        throw new Error("Unsupported OTP account type.");
    }

    return {
        secret: bytesToBase32(secret),
        name: getString(fields, 2),
        issuer: getString(fields, 3),
        algorithm,
        digits: digitsValue === 2 ? 8 : 6,
        type: typeValue === 1 ? "HOTP" : "TOTP",
        counter: getNumber(fields, 7),
    };
}

export function extactOTPAuthMigration(uri: string): string {
    let url: URL;

    try {
        url = new URL(uri);
    } catch {
        throw new Error("Invalid migration QR code URI.");
    }

    if (
        url.protocol !== "otpauth-migration:" ||
        url.hostname !== "offline"
    ) {
        throw new Error(
            "This is not a Google Authenticator migration QR code.",
        );
    }

    const encoded = url.searchParams.get("data");

    if (!encoded) {
        throw new Error("Migration data is missing.");
    }

    const normalized = encoded
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    let binary: string;

    try {
        binary = atob(normalized);
    } catch {
        throw new Error("Invalid Base64 migration data.");
    }

    const bytes = Uint8Array.from(
        binary,
        (character) => character.charCodeAt(0),
    );

    const fields = readFields(bytes);

    const accounts = fields
        .filter((field) => field.number === 1 && field.wireType === 2)
        .map((field) => {
            if (!(field.value instanceof Uint8Array)) {
                throw new Error("Invalid account data.");
            }

            return decodeAccount(field.value);
        });

    if (accounts.length === 0) {
        throw new Error("The QR code does not contain any accounts.");
    }

    const account = findNeptunAccount(accounts);

    return account.secret.toUpperCase();
}

export function findNeptunAccount(
    accounts: MigrationAccount[],
): MigrationAccount {
    const account = accounts.find(
        (account) =>
            account.name.toUpperCase().includes("NEPTUN") ||
            account.issuer.toUpperCase().includes("NEPTUN"),
    );

    if (!account) {
        throw new Error("No Neptun account was found in the QR code.");
    }

    return account;
}

export function extractOTPAuth(qrContent: string): string {
    let uri: URL;

    try {
        uri = new URL(qrContent);
    } catch {
        throw new Error("The QR code does not contain a valid OTP URI.");
    }

    if (
        uri.protocol !== "otpauth:" ||
        uri.hostname !== "totp"
    ) {
        throw new Error(
            "The QR code does not contain a TOTP authentication code.",
        );
    }

    const secret = uri.searchParams.get("secret");

    if (!secret || !/^[A-Z2-7]+=*$/i.test(secret)) {
        throw new Error("The QR code does not contain a valid secret key.");
    }

    return secret.replace(/=+$/, "").toUpperCase();
}