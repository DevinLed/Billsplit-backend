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
  QueryCommand,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { Contact } from "../types";

const ddb = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(ddb);
const TableName = "Contacts";

export async function createContact(contact: Contact): Promise<Contact> {
  try {
    const command = new PutCommand({
      TableName,
      Item: { ...contact },
    });
    await docClient.send(command);
    return contact;
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
      UpdateExpression:
        "SET #Name = :Name, #Email = :Email, #Phone = :Phone, #Owing = :Owing",
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
export async function listContacts(): Promise<Contact[]> {
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
export async function getExistingContact(Email: string, UserEmail: string): Promise<Contact | null> {
  const params = {
    TableName,
    FilterExpression: 'Email = :email AND UserEmail = :userEmail',
    ExpressionAttributeValues: {
      ':email': UserEmail,
      ':userEmail': Email,
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
export async function updateExistingContact(
  Email: string,
  UserEmail: string,
  updatedFields: Partial<Pick<Contact, 'ContactId' | 'Owing' | 'Name' | 'Email' | 'Phone'>>
): Promise<Contact | null> {
  console.log('Update operation parameters:', { Email, UserEmail, updatedFields });

  const params = {
    TableName,
    Key: {
      'Email': UserEmail,
      'UserEmail': Email,
    },
    UpdateExpression: "SET #ContactId = :ContactId, #Owing = :Owing, #Name = :Name, #Email = :Email, #Phone = :Phone",
    ExpressionAttributeNames: {
      "#ContactId": "ContactId",
      "#Owing": "Owing",
      "#Name": "Name",
      "#Email": "Email",
      "#Phone": "Phone",
    },
    ExpressionAttributeValues: {
      ":ContactId": updatedFields.ContactId, 
      ":Owing": updatedFields.Owing,
      ":Name": updatedFields.Name,
      ":Email": updatedFields.Email,
      ":Phone": updatedFields.Phone,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  };

  try {
    const command = new UpdateCommand(params);
    const data: any = await docClient.send(command);
    console.log('Update successful. Updated contact:', data.Attributes);
    return data.Attributes as Contact;
  } catch (error) {
    console.error('Error updating contact:', error);
    console.log('Input parameters:', { Email, UserEmail, updatedFields });
    console.log('ExpressionAttributeValues:', params.ExpressionAttributeValues);
    console.log('ExpressionAttributeNames:', params.ExpressionAttributeNames);
  
    throw error;
  }
}




const table = {
  id: '', // PK, Current/active user id
  contactId: '', // SK, cognito id of other person, or uuid of other person
}

