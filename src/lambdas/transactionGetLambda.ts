import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { listTransactions } from "../core/transactions";
import { HttpResponses } from "../http/utils";
import { handlerFactory } from "../http/handler";
import pino from 'pino';

const logger = pino();

export async function getTransactionHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    logger.info("Fetching transactions");
    const data = await listTransactions();

    return HttpResponses.ok(data);
  } catch (error) {
    logger.error("Error fetching transactions:", error);
    return HttpResponses.internalServerError("Error fetching transactions");
  }
}

const customHandler = handlerFactory();
customHandler.addHandler("GET", getTransactionHandler);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.info(`Executing GET request for path ${event.path}`);
  return await customHandler.execute(event);
};