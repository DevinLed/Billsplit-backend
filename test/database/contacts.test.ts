import "aws-sdk-client-mock-jest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  ScanCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  createContact,
  updateContact,
  deleteContact,
  listContacts,
  getContact,
  getExistingContactByEmail,
  updateExistingContact,
} from "../../src/database/contacts"; 

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("Contacts Operations", () => {
  const baseContact = {
    ContactId: "c1234567-89ab-cdef-1234-56789abcdef0",
    Name: "David Smith",
    Email: "david.smith@example.com",
    Phone: "18675309",
    Owing: 0,
    UserEmail: "user@example.com",
    UserName: "DavidUser",
  };

  const updatedContact = {
    ...baseContact,
    Name: "Terry Brown",
    Email: "terry.brown@example.com",
    Phone: "+18675309",
  };

  beforeEach(() => {
    ddbMock.reset();
  });

  test("Should create contact database item", async () => {
    ddbMock.on(PutCommand).resolvesOnce({});
    await expect(createContact(baseContact)).resolves.toEqual(baseContact);
    expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
      TableName: expect.any(String),
      Item: baseContact,
    });
  });

  test("Should update contact database item", async () => {
    ddbMock.on(UpdateCommand).resolvesOnce({
      Attributes: updatedContact
    });
    await expect(updateContact(updatedContact)).resolves.toEqual(updatedContact);
    expect(ddbMock).toHaveReceivedCommandTimes(UpdateCommand, 1);
  });

  test("Should delete contact database item", async () => {
    ddbMock.on(DeleteCommand).resolvesOnce({});
    await expect(deleteContact(baseContact.ContactId, baseContact.UserEmail)).resolves.toBeUndefined();
    expect(ddbMock).toHaveReceivedCommandTimes(DeleteCommand, 1);
  });

  test("Should list contacts", async () => {
    const contactsList = [baseContact, updatedContact];
    ddbMock.on(ScanCommand).resolvesOnce({
      Items: contactsList
    });
    await expect(listContacts()).resolves.toEqual(contactsList);
    expect(ddbMock).toHaveReceivedCommandTimes(ScanCommand, 1);
  });

  test("Should get a single contact", async () => {
    ddbMock.on(QueryCommand).resolvesOnce({
      Items: [baseContact]
    });
    await expect(getContact(baseContact.ContactId, baseContact.UserEmail)).resolves.toEqual(baseContact);
    expect(ddbMock).toHaveReceivedCommandTimes(QueryCommand, 1);
  });

  test("Should get an existing contact by email", async () => {
    ddbMock.on(QueryCommand).resolvesOnce({
      Items: [baseContact]
    });
    await expect(getExistingContactByEmail(baseContact.Email, baseContact.UserEmail)).resolves.toEqual(baseContact);
    expect(ddbMock).toHaveReceivedCommandTimes(QueryCommand, 1);
  });

  test("Should update existing contact fields", async () => {
    ddbMock.on(UpdateCommand).resolvesOnce({
      Attributes: updatedContact
    });
    await expect(updateExistingContact(baseContact.ContactId, {
      Email: updatedContact.Email,
      Name: updatedContact.Name,
      Phone: updatedContact.Phone,
    })).resolves.toEqual(updatedContact);
    expect(ddbMock).toHaveReceivedCommandTimes(UpdateCommand, 1);
  });

  test("Should handle error in createContact", async () => {
    ddbMock.on(PutCommand).rejects(new Error("Create contact error"));
    await expect(createContact(baseContact)).rejects.toThrow("Create contact error");
  });

  test("Should handle error in updateContact", async () => {
    ddbMock.on(UpdateCommand).rejects(new Error("Update contact error"));
    await expect(updateContact(updatedContact)).rejects.toThrow("Update contact error");
  });

  test("Should handle error in deleteContact", async () => {
    ddbMock.on(DeleteCommand).rejects(new Error("Delete contact error"));
    await expect(deleteContact(baseContact.ContactId, baseContact.UserEmail)).rejects.toThrow("Delete contact error");
  });

  test("Should handle error in listContacts", async () => {
    ddbMock.on(ScanCommand).rejects(new Error("List contacts error"));
    await expect(listContacts()).rejects.toThrow("List contacts error");
  });

  test("Should handle error in getContact", async () => {
    ddbMock.on(QueryCommand).rejects(new Error("Get contact error"));
    await expect(getContact(baseContact.ContactId, baseContact.UserEmail)).rejects.toThrow("Get contact error");
  });

  test("Should handle error in getExistingContactByEmail", async () => {
    ddbMock.on(QueryCommand).rejects(new Error("Get existing contact by email error"));
    await expect(getExistingContactByEmail(baseContact.Email, baseContact.UserEmail)).rejects.toThrow("Get existing contact by email error");
  });

  test("Should handle error in updateExistingContact", async () => {
    ddbMock.on(UpdateCommand).rejects(new Error("Update existing contact error"));
    await expect(updateExistingContact(baseContact.ContactId, {
      Email: updatedContact.Email,
      Name: updatedContact.Name,
      Phone: updatedContact.Phone,
    })).rejects.toThrow("Update existing contact error");
  });
});
