import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { getContact } from '../core';
import { Contact } from '../types';
import { getAllContacts } from '../database/contacts';


async function getContactHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const data = await getAllContacts();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
    },
  };
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  
  console.log('Received event:', JSON.stringify(event, null, 2));
  switch (event.httpMethod) {
    case 'GET': {
      return getContactHandler(event);
    }
    
    default: {
      return {
        statusCode: 404,
        body: 'Method not supported',
      };
    }
  }
};

