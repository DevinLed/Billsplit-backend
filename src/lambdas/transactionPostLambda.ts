import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Transaction } from "../types";

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
const tableName = "Transactions";
const contactsTableName = "Contacts"; 
const createTransactionItem = async (
  transaction: Transaction
): Promise<void> => {
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
    body: "",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT",
    },
  };

  if (!event.body) {
    const res = {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request. Body is missing." }),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  }

  const { loggedInUserEmail, personEmail, selectedValue, personOwing, receiptTotal, personReceiptAmount, ...transaction } =
    JSON.parse(event.body);

    console.log("selectedValue?", selectedValue);
  // Determine the PayerId based on selectedValue
  const payerId = selectedValue === "you" ? loggedInUserEmail : personEmail;
  const debtorId = selectedValue === "you" ? personEmail : loggedInUserEmail;

  // Create a new Transaction
  try {
    
    await createTransactionItem({
      ...transaction,
      PayerId: payerId,
      DebtorId: debtorId,
      personReceiptAmount: personReceiptAmount,
    });
    console.log("loggedInUserEmail:",loggedInUserEmail);
    console.log("PersonEmail:",personEmail);
    console.log("payerID:", payerId);
    console.log("debtorID:", debtorId);
    console.log("personOwing:", personOwing);
    console.log("receiptTotal:", receiptTotal);
    console.log("personReceiptAmount:", personReceiptAmount);
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

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  switch (event.httpMethod) {
    case "POST": {
      return postTransactionHandler(event);
    }
    default: {
      return {
        statusCode: 404,
        body: "Method not supported",
      };
    }
  }
};
