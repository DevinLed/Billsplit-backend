import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createContact } from "../core";
import { Contact } from "../types";
import { v4 as uuidv4 } from "uuid";

/**
 * POST will update or create user
 */
export async function postContactHandler(
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

  const { loggedInUserEmail, ...itemData } = JSON.parse(event.body);

  // Update a user
  if (itemData.itemId) {
    console.log(`Updating contact with id: ${itemData.itemId}`);

    const user = await createContact({
      ...itemData,
      UserEmail: loggedInUserEmail,
    });

    const res = {
      ...response,
      statusCode: 200,
      body: JSON.stringify({ message: "Item updated successfully" }),
    };

    console.log(JSON.stringify(res, null, 2));

    return res;

    // Create a Contact
  } else {
    console.log(`Creating Contact`);
    const contactId = uuidv4();
    const user = await createContact({ ...itemData, ContactId: contactId });

    const res = {
      ...response,
      statusCode: 201,
      body: JSON.stringify({ ...user, ContactId: contactId }),
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
      return postContactHandler(event);
    }

    default: {
      return {
        statusCode: 404,
        body: "Method not supported",
      };
    }
  }
};
