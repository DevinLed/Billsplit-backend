import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Transaction } from '../types';
import { postTransactionHandler } from "./transactionPostLambda";

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
const tableName = 'Transactions';

const listItems = async (): Promise<Transaction[]> => {
  const params = {
    TableName: tableName,
  };
  try {
    const command = new ScanCommand(params);
    const data = await documentClient.send(command);
    return data.Items as Transaction[] || [];
  } catch (error) {
    throw error;
  }
};

export async function getTransactionHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const data = await listItems();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
      },
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching transactions" }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
      },
    };
  }
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  switch (event.httpMethod) {
    case 'GET': {
      return getTransactionHandler(event);
    } 
    default: {
      return {
        statusCode: 404,
        body: 'Method not supported',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
        },
      };
    }
  }
};
