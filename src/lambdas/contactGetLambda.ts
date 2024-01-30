import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { listContacts } from '../core/contacts';
import { HttpResponses, HttpStatus } from "../http/utils"; 
import { handlerFactory } from "../http/handler";

async function getContactHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const data = await listContacts();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
    },
  };
}

const customHandler = handlerFactory();

customHandler.addHandler("GET", getContactHandler);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return await customHandler.execute(event);
};