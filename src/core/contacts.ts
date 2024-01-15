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

/* To update - based on PK will not work
export async function updateExistingContact(
    Email: string,
    Owing: number,
    Name: string,
    Phone: string,
    UserEmail: any,
    ContactId: string
  ): Promise<Contact> {
    try {
      const updatedContact = await db.updateExistingContact(
        ContactId,
        UserEmail,
      );
  
      if (!updatedContact) {
        throw new Error("Failed to update contact");
      }
  
      return updatedContact;
    } catch (error) {
      throw error;
    }
  }
  
  */

export async function deleteContact(itemId: string, itemEmail:any): Promise<void> {
  try {
    await db.deleteContact(itemId, itemEmail);
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
