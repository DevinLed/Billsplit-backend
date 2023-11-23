import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createTransaction } from "../core/transactions";
import { Transaction } from "../types";

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
const tableName = "Transactions";

const createItem = async (itemData: Record<string, any>) => {
  const userId = Date.now().toString();

  const params = {
    TableName: tableName,
    Item: {
      ...itemData,
      userId: userId,
    },
  };

  try {
    const command = new PutCommand(params);
    await documentClient.send(command);
  } catch (error) {
    throw error;
  }

  return { userId, ...itemData };
};

/**
 * POST will update or create user
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

  const { loggedInUserEmail, ...itemData } = JSON.parse(event.body);

  // Update a user
  if (itemData.itemId) {
    console.log(`Updating transaction with id: ${itemData.itemId}`);

    const user = await createItem({
      ...itemData,
      UserEmail: loggedInUserEmail,
    });

    const res = {
      ...response,
      statusCode: 200,
      body: JSON.stringify({ message: "Item updated successfully" })
    };

    console.log(JSON.stringify(res, null, 2));

    return res;

  // Create a Transaction
  } else {
    console.log(`Creating Transaction`);

    const user = await createTransaction(itemData);

    const res = {
      ...response,
      statusCode: 201,
      body: JSON.stringify(user),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  }
}
