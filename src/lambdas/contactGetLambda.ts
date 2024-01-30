import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { listContacts } from '../core/contacts';
import { HttpResponses, HttpStatus } from "../http/utils"; 
import { handlerFactory } from "../http/handler";
import pino from 'pino';

const logger = pino();

async function getContactHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('getContactHandler invoked');
  
  try {
    logger.info('Attempting to list contacts');
    const data = await listContacts();
    logger.info('Contacts successfully retrieved', { contactCount: data.length });

    const response = {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
      },
    };
    
    logger.info('Sending response', response);
    return response;
  } catch (error) {
    logger.error('Error occurred while fetching contacts', error);

    const response = {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch contacts." }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
      },
    };

    logger.error('Sending error response', response);
    return response;
  }
}

const customHandler = handlerFactory();

customHandler.addHandler("GET", getContactHandler);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.info(`Executing ${event.httpMethod} request for path ${event.path}`);
  logger.info(`Request Event: ${JSON.stringify(event)}`);
  return await customHandler.execute(event);
};