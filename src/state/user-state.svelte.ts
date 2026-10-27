import {
  loadUser,
  saveUser,
  clearUser,
  loadSetupDraft,
  saveSetupDraft,
  clearSetupDraft,
  loadSetupQrImage,
  saveSetupQrImage,
  clearSetupQrImage,
  type User,
  type SetupDraft,
  type StoredQrImage,
} from "@/storage/user-repository";

let user = $state.raw<User | null>(null);

function getUser(): User {
  if (!user) {
    throw new Error("User is not initialized");
  }
  return user;
}

async function initializeUser(): Promise<User | null> {
  user = await loadUser();
  return user;
}

async function persistUser(next: User): Promise<void> {
  user = next;
  // Setup is complete: the in-progress draft and image are no longer needed.
  await Promise.all([
    saveUser(next),
    clearSetupDraft(),
    clearSetupQrImage(),
  ]);
}

async function resetUser(): Promise<void> {
  user = null;
  await Promise.all([clearUser(), clearSetupDraft(), clearSetupQrImage()]);
}

export {
  getUser,
  initializeUser,
  persistUser,
  resetUser,
  loadSetupDraft,
  saveSetupDraft,
  loadSetupQrImage,
  saveSetupQrImage,
  clearSetupQrImage,
};
export type { SetupDraft, StoredQrImage, User };