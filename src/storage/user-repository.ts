import { storage } from "#imports";

type User = {
    neptunCode: string;
    password: string;
    secretKey: string;
};

const userItem = storage.defineItem<User>("local:user");

export async function loadUser(): Promise<User | null> {
    return await userItem.getValue();
}

export async function saveUser(user: User): Promise<void> {
    await userItem.setValue(user);
}

export async function clearUser(): Promise<void> {
    await userItem.removeValue();
}

export type { User };

