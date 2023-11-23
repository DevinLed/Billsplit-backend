import * as db from '../database/users';
import { Contact } from '../types';

export async function createContact(user: Contact): Promise<Contact> {
    const id = Math.random() * 1000000;
    
    return await db.createContact(user);
}

export async function updateContact(user: Contact) {

    return await db.updateContact(user)
}

export async function getContact() {

}
