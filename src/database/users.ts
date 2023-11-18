import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { Transaction } from '../types';

const ddb = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(ddb);

const TableName = "Transactions";

export async function createTransaction(user: User): Promise<User> {
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

export async function updateUser(): Promise<User> {
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

    return result.Attributes as User
  } catch (error) {
    throw error;
  }
}