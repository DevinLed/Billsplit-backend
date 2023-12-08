import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand, PutCommand, DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { Contact } from '../types';

const ddb = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(ddb);

const TableName = "Contacts";

export async function createContact(user: Contact): Promise<Contact> {
  try {
    const command = new PutCommand({
        TableName,
        Item: user
    });
    await docClient.send(command);

    return user
  } catch (error) {
    throw error;
  }
}

export async function updateContact(user: Contact): Promise<Contact> {
  try {
    const command = new UpdateCommand({
      TableName,
      Key: {
        ContactId: user.ContactId, 
      },
      UpdateExpression: 'SET #Name = :Name, #Email = :Email, #Phone = :Phone',
      ExpressionAttributeNames: {
        '#Name': 'Name',
        '#Email': 'Email',
        '#Phone': 'Phone',
        '#Owing': 'Owing',
      },
      ExpressionAttributeValues: {
        ':Name': user.Name,
        ':Email': user.Email,
        ':Phone': user.Phone,
        ':Owing': user.Owing,
      },
      ReturnValues: ReturnValue.UPDATED_NEW,
    });

    const result = await docClient.send(command);

    return result.Attributes as Contact;
  } catch (error) {
    throw error;
  }
}

export async function deleteContact(itemId: string): Promise<void> {
  const params = {
    TableName,
    Key: {
      ContactId: itemId,
    },
  };

  try {
    const command = new DeleteCommand(params);
    await docClient.send(command);
  } catch (error) {
    throw error;
  }
};

export async function getAllContacts(): Promise<unknown> {
  const params = {
    TableName,
  };
  try {
    const command = new ScanCommand(params);
    const data = await docClient.send(command);
    return data.Items || [];
  } catch (error) {
    throw error;
  }
};