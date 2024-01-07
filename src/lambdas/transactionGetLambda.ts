import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Transaction } from "../types";
import { listTransactions } from "../core/transactions";

export async function getTransactionHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const data = await listTransactions();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT",
      },
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching transactions" }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT",
      },
    };
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  switch (event.httpMethod) {
    case "GET": {
      return getTransactionHandler(event);
    }
    default: {
      return {
        statusCode: 404,
        body: "Method not supported",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT",
        },
      };
    }
  }
};
