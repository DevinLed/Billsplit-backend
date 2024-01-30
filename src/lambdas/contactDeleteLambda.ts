import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { deleteContact } from "../core/contacts";
import { handlerFactory } from "../http/handler";
import { HttpResponses, HttpStatus } from "../http/utils";
import pino from 'pino';

const logger = pino();

export async function deleteContactHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  logger.info('deleteContactHandler invoked');
  
  const response = {
    statusCode: 500,
    body: "",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT",
    },
  };

  const itemId = event.pathParameters?.ContactId;
  const itemEmail = event.pathParameters?.UserEmail;

  if (!itemId) {
    const res = {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request. ContactId is missing." }),
    };

    logger.info('Invalid request. ContactId is missing', res);
    return res;
  }

  try {
    logger.info(`Deleting contact with id: ${itemId}`);
    logger.info("ItemEmail?", itemEmail);
    await deleteContact(itemId, itemEmail);

    const res = {
      ...response,
      statusCode: 204,
    };

    logger.info('Contact deleted successfully', res);
    return res;
  } catch (error) {
    logger.error('Error deleting item:', error);

    const res = {
      ...response,
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete item." }),
    };

    logger.error('Failed to delete item', res);
    return res;
  }
}

const customHandler = handlerFactory();

customHandler.addHandler("DELETE", deleteContactHandler);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.info(`Executing ${event.httpMethod} request for path ${event.path}`);
  logger.info(`Request Event: ${JSON.stringify(event)}`);
  return await customHandler.execute(event);
};