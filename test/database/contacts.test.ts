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
    Email: "david.smith@Mario.com",
    Phone: "18675309",
    Owing: 0,
    UserEmail: "user@user",
    UserName: "DavidUser",
  };

  const updatedContact = {
    ...baseContact,
    Name: "Terry Brown",
    Email: "terry.brown@marybrown",
    Phone: "+18675309",
  };

  test("Should create contact database item", async () => {
    ddbMock.on(PutCommand).resolvesOnce({});
    await expect(createContact(baseContact)).resolves.toEqual(baseContact);
    expect(ddbMock).toHaveReceivedCommandTimes(PutCommand, 1);
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

  afterEach(() => {
    ddbMock.reset();
  });
});
