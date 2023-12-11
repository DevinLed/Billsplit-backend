import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { updateContact } from "../core";

export async function putContactHandler(
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

  if (!event.body) {
    const res = {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request. Body is missing." }),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  }

  const itemData = JSON.parse(event.body);

  try {
    console.log(`Updating contact with id: ${itemData.ContactId}`);

    await updateContact(itemData);

    const res = {
      ...response,
      statusCode: 200,
      body: JSON.stringify({ message: "Item updated successfully" })
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  } catch (error) {
    console.error("Error updating item:", error);

    const res = {
      ...response,
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update item." }),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;
  }
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  switch (event.httpMethod) {
    case 'PUT': {
      return putContactHandler(event);
    }
    
    default: {
      return {
        statusCode: 404,
        body: 'Method not supported',
      };
    }
  }
};
