import { v4 as uuidv4 } from "uuid";
import * as db from "../database/transactions";
import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";
import { Transaction } from "../types";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(ddb);

const TableName = "Transactions";

export async function createTransaction(
  transaction: Transaction
): Promise<Transaction> {
  try {
    const command = new PutCommand({
      TableName: TableName,
      Item: transaction,
    });
    await docClient.send(command);

    return transaction;
  } catch (error) {
    throw error;
  }
}

export async function listTransactions(): Promise<Transaction[]> {
  try {
    const params = {
      TableName,
    };

    const command = new ScanCommand(params);
    const data = await docClient.send(command);

    return (data.Items as Transaction[]) || [];
  } catch (error) {
    throw error;
  }
}