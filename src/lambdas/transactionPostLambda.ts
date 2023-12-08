import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Transaction } from "../types";

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
const tableName = "Transactions";

const createTransactionItem = async (transaction: Transaction): Promise<void> => {
  const params = {
    TableName: tableName,
    Item: {
      ...transaction,
      TransactionId: Date.now().toString(), 
    },
  };

  try {
    const command = new PutCommand(params);
    await documentClient.send(command);
  } catch (error) {
    throw error;
  }
};

/**
 * POST will create a new transaction
 */
export async function postTransactionHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const response = {
    statusCode: 500,
    body: '',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT",
    }
  }

  if (!event.body) {
    const res = {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request. Body is missing." }),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  }

  const { loggedInUserEmail, Email, selectedValue, ...transaction } = JSON.parse(event.body);

  // Determine the PayerId based on selectedValue
  const payerId = selectedValue === "you" ? loggedInUserEmail : Email;

  // Create a new Transaction
  try {
    console.log(`Creating Transaction`);

    await createTransactionItem({
      ...transaction,
      PayerId: payerId,
    });

    const res = {
      ...response,
      statusCode: 201,
      body: JSON.stringify({ message: "Transaction created successfully" }),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  } catch (error) {
    console.error("Error creating transaction:", error);

    const res = {
      ...response,
      statusCode: 500,
      body: JSON.stringify({ error: "Error creating transaction" }),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  }
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  
  console.log('Received event:', JSON.stringify(event, null, 2));
  switch (event.httpMethod) {
    case 'POST': {
      return postTransactionHandler(event);
    } 
    default: {
      return {
        statusCode: 404,
        body: 'Method not supported',
      };
    }
  }
};
