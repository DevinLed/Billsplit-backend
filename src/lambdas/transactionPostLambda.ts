import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Transaction } from "../types";
import { HttpResponses } from "../http/utils";
import { handlerFactory } from "../http/handler";
import { SendTransactionUpdate } from "../core/NotificationAPI";
import pino from 'pino';

const logger = pino();
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
    logger.error("Error in createTransactionItem", error);
    throw error;
  }
};

export async function postTransactionHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  logger.info("Received event", { event });

  if (!event.body) {
    const errorMessage = "Invalid request. Body is missing.";
    logger.warn(errorMessage);
    return HttpResponses.badRequest(errorMessage);
  }

  try {
    const {
      loggedInUserEmail,
      personEmail,
      selectedValue,
      personOwing,
      receiptTotal,
      personReceiptAmount,
      personName,
      submissionArray,
      ...transaction
    } = JSON.parse(event.body);

    const payerId = selectedValue === "you" ? loggedInUserEmail : personEmail;
    const debtorId = selectedValue === "you" ? personEmail : loggedInUserEmail;

    await createTransactionItem({
      ...transaction,
      PayerId: payerId,
      DebtorId: debtorId,
      personReceiptAmount: personReceiptAmount,
      loggedInUserEmail: loggedInUserEmail,
      personEmail: personEmail,
      personName: personName,
      receiptTotal: receiptTotal,
      selectedValue: selectedValue,
      submissionArray: submissionArray,
    });
    const formattedAmount = parseFloat(personReceiptAmount).toFixed(2);
    await SendTransactionUpdate(personEmail, formattedAmount, personName);

    logger.info("Transaction created successfully", {
      loggedInUserEmail,
      personEmail,
      personName,
      payerId,
      debtorId,
      personOwing,
      receiptTotal,
      personReceiptAmount,
      submissionArray,
    });

    return HttpResponses.created({ message: "Transaction created successfully" });
  } catch (error) {
    logger.error("Error creating transaction", error);
    return HttpResponses.internalServerError("Error creating transaction");
  }
}

const customHandler = handlerFactory();
customHandler.addHandler("POST", postTransactionHandler);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return await customHandler.execute(event);
};