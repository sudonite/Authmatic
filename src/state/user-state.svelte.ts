import {
  loadUser,
  saveUser,
  clearUser,
  type User,
} from "@/storage/user-repository";

let user = $state.raw<User | null>(null);

function getUser(): User | null {
  return user;
}

async function initializeUser(): Promise<User | null> {
  user = await loadUser();
  return user;
}

async function persistUser(next: User): Promise<void> {
  user = next;
  await saveUser(next);
}

async function resetUser(): Promise<void> {
  user = null;
  await clearUser();
}

export { getUser, initializeUser, persistUser, resetUser };
export type { User };