import { storage } from "#imports";

type User = {
    neptunCode: string;
    password: string;
    secretKey: string;
};

type SetupDraft = {
    neptunCode: string;
    password: string;
};

type StoredQrImage = {
    name: string;
    dataUrl: string;
};

const userItem = storage.defineItem<User>("local:user");

// Session storage is in-memory only: it survives the popup closing (e.g. the
// OS file dialog) but is wiped when the browser exits. Never written to disk.
const setupDraftItem = storage.defineItem<SetupDraft>("session:setup-draft");

// Best-effort copy of the selected QR image so setup can resume if the popup
// is destroyed before the image is decoded. Removed as soon as processing
// finishes. Note: session storage has a size quota, so oversized images
// (large files, base64 overhead) fail to save and the flow falls back to
// in-memory only.
const qrImageItem = storage.defineItem<StoredQrImage>(
    "session:setup-qr-image",
);

export async function loadUser(): Promise<User | null> {
    return await userItem.getValue();
}

export async function saveUser(user: User): Promise<void> {
    await userItem.setValue(user);
}

export async function clearUser(): Promise<void> {
    await userItem.removeValue();
}

export async function loadSetupDraft(): Promise<SetupDraft | null> {
    return await setupDraftItem.getValue();
}

export async function saveSetupDraft(draft: SetupDraft): Promise<void> {
    await setupDraftItem.setValue(draft);
}

export async function clearSetupDraft(): Promise<void> {
    await setupDraftItem.removeValue();
}

export async function loadSetupQrImage(): Promise<StoredQrImage | null> {
    return await qrImageItem.getValue();
}

export async function saveSetupQrImage(image: StoredQrImage): Promise<void> {
    await qrImageItem.setValue(image);
}

export async function clearSetupQrImage(): Promise<void> {
    await qrImageItem.removeValue();
}

export type { SetupDraft, StoredQrImage, User };

