import * as db from '../database/contacts';
import { Contact } from '../types';
import { v4 as uuid } from "uuid"

export async function createContact(user: Contact): Promise<Contact> {
    const id = uuid();
    
    return await db.createContact(user);
}

export async function updateContact(user: Contact) {

    return await db.updateContact(user)
}

export async function getContact() {

}
export async function deleteContact() {

}

