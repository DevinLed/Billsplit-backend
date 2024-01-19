import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { deleteContact } from "../core/contacts";

import { handlerFactory } from "../http/handler";
import { HttpResponses, HttpStatus } from "../http/utils";

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
  const itemEmail = event.pathParameters?.UserEmail;

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
    console.log("ItemEmail?", itemEmail);
    await deleteContact(itemId, itemEmail);

    const res = {
      ...response,
      statusCode: 204,
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
const customHandler = handlerFactory();

customHandler.addHandler("DELETE", deleteContactHandler);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Executing ${event.httpMethod} request`);
  console.log(`Event: ${JSON.stringify(event)}`);
  return await customHandler.execute(event);
};
