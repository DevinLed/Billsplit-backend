import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand, PutCommand
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
