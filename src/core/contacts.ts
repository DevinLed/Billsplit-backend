import { v4 as uuid } from "uuid";
import {
  ScanCommand,
  UpdateCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { Contact } from "../types";

const ddb = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(ddb);
const TableName = "Contacts";

export async function createContact(contact: Contact): Promise<Contact> {
  try {
    const id = uuid();
    const command = new PutCommand({
      TableName,
      Item: { ...contact, ContactId: id },
    });
    await docClient.send(command);
    return { ...contact, ContactId: id };
  } catch (error) {
    throw error;
  }
}

export async function updateContact(contact: Contact): Promise<Contact> {
  try {
    const command = new UpdateCommand({
      TableName,
      Key: {
        ContactId: contact.ContactId,
      },
      UpdateExpression: "SET #Name = :Name, #Email = :Email, #Phone = :Phone, #Owing = :Owing",
      ExpressionAttributeNames: {
        "#Name": "Name",
        "#Email": "Email",
        "#Phone": "Phone",
        "#Owing": "Owing",
      },
      ExpressionAttributeValues: {
        ":Name": contact.Name,
        ":Email": contact.Email,
        ":Phone": contact.Phone,
        ":Owing": contact.Owing,
      },
      ReturnValues: ReturnValue.UPDATED_NEW,
    });

    const result = await docClient.send(command);
    return result.Attributes as Contact;
  } catch (error) {
    throw error;
  }
}

export async function deleteContact(contactId: string): Promise<void> {
  const params = {
    TableName,
    Key: {
      ContactId: contactId,
    },
  };

  try {
    const command = new DeleteCommand(params);
    await docClient.send(command);
  } catch (error) {
    throw error;
  }
}

export async function listItems(): Promise<Contact[]> {
  const params = {
    TableName,
  };

  try {
    const command = new ScanCommand(params);
    const data: ScanCommandOutput = await docClient.send(command);
    return (data.Items || []) as Contact[];
  } catch (error) {
    throw error;
  }
}

export async function getContact(contactId: string): Promise<Contact | null> {
  const params = {
    TableName,
    Key: {
      ContactId: contactId,
    },
  };

  try {
    const command = new ScanCommand(params);
    const data: ScanCommandOutput = await docClient.send(command);
    const contact = (data.Items || []) as Contact[];
    return contact.length ? contact[0] : null;
  } catch (error) {
    throw error;
  }
}
