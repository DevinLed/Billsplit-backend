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
        Item: user,
        ReturnValues: ReturnValue.ALL_NEW
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
        UserEmail: 'TODO'
      },
      UpdateExpression: '',
      ExpressionAttributeNames: {

      },
      ExpressionAttributeValues: {

      },
      ReturnValues: ReturnValue.UPDATED_NEW
    });

    const result = await docClient.send(command);

    return result.Attributes as Contact
  } catch (error) {
    throw error;
  }
}
