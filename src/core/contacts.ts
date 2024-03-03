import * as db from "../database/contacts";
import { Contact } from "../types";

export async function createContact(user: Contact): Promise<Contact> {
  try {
    return await db.createContact(user);
  } catch (error) {
    throw error;
  }
}

export async function updateContact(user: Contact): Promise<Contact> {
  try {
    return await db.updateContact(user);
  } catch (error) {
    throw error;
  }
}

export async function deleteContact(itemId: string, userEmail: any): Promise<void> {
  try {
    await db.deleteContact(itemId, userEmail);
  } catch (error) {
    throw error;
  }
}

export async function listContacts(): Promise<Contact[]> {
  try {
    return await db.listContacts();
  } catch (error) {
    throw error;
  }
}

export async function getExistingContactByEmail(email: string, userEmail: string): Promise<Contact | null> {
  try {
    return await db.getExistingContactByEmail(email, userEmail);
  } catch (error) {
    throw error;
  }
}

export async function getContact(contactId: string, userEmail: string): Promise<Contact | null> {
  try {
    return await db.getContact(contactId, userEmail);
  } catch (error) {
    throw error;
  }
}

export async function updateExistingContact(contactId: string, updatedFields: Partial<Pick<Contact, "Owing" | "Name" | "Email" | "Phone" | "UserEmail">>): Promise<Contact | null> {
  try {
    return await db.updateExistingContact(contactId, updatedFields);
  } catch (error) {
    throw error;
  }
}
