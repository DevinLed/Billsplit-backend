import * as core from '../core/contacts';
import { Contact } from '../types';

export async function createContact(user: Contact): Promise<Contact> {
    try {
        return await core.createContact(user);
    } catch (error) {
        throw error;
    }
}

export async function updateContact(user: Contact): Promise<Contact> {
    try {
        return await core.updateContact(user);
    } catch (error) {
        throw error;
    }
}

export async function deleteContact(itemId: string): Promise<void> {
    try {
        await core.deleteContact(itemId);
    } catch (error) {
        throw error;
    }
}

export async function listItems(): Promise<Contact[]> {
    try {
        return await core.listItems();
    } catch (error) {
        throw error;
    }
}
