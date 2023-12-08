import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { deleteContact } from "../database/contacts";

export async function deleteContactHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const response = {
    statusCode: 500,
    body: "",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT",
    },
  };

  const itemId = event.pathParameters?.ContactId;

  if (!itemId) {
    const res = {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request. ContactId is missing." }),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  }

  try {
    console.log(`Deleting contact with id: ${itemId}`);

    await deleteContact(itemId);

    const res = {
      ...response,
      statusCode: 204, // No content for a successful deletion
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  } catch (error) {
    console.error("Error deleting item:", error);

    const res = {
      ...response,
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete item." }),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  }
}
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    switch (event.httpMethod) {
      case 'DELETE': {
        return deleteContactHandler(event);
      }
      
      default: {
        return {
          statusCode: 404,
          body: 'Method not supported',
        };
      }
    }
  };
