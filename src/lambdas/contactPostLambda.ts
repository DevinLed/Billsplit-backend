import { v4 as uuidv4 } from "uuid";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createContact } from "../core";
import { Contact } from "../types";

import {
  CognitoIdentityProvider,
  ListUsersCommandInput,
  ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { HttpResponses, HttpStatus } from "../http/utils";
import { Handler, handlerFactory } from "../http/handler";

const cognitoIdentityProvider = new CognitoIdentityProvider({
  region: 'us-east-1',
});

async function listUsers(command: ListUsersCommandInput): Promise<ListUsersCommandOutput> {
  return cognitoIdentityProvider.listUsers(command);
}

export async function postContactHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    console.log("Incoming request:", event);

    const response = {
      body: "",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT",
      },
    };

    if (!event.body) {
      return HttpResponses.badRequest("Invalid request. Body is missing.");
    }

    const { loggedInUserEmail, ...itemData } = JSON.parse(event.body);

    if (itemData.itemId) {
      const user = await createContact({
        ...itemData,
        UserEmail: loggedInUserEmail,
      });

      return HttpResponses.ok({ message: "Item updated successfully" });
    } else {
      const userPoolId = 'us-east-1_whmGZCnxe';
      const filter = `email = "${itemData.Email}"`;

      const listUsersCommand: ListUsersCommandInput = {
        UserPoolId: userPoolId,
        Filter: filter,
      };

      try {
        const users: ListUsersCommandOutput = await listUsers(listUsersCommand);

        if (users?.Users && users.Users.length > 0) {
          const userId = users.Users[0].Username;
          const user = await createContact({ ...itemData, ContactId: userId });

          return HttpResponses.created({ ...user, ContactId: userId });
        }
      } catch (error: any) {
        console.error('Error querying Cognito:', error);
      }

      const contactId = uuidv4();
      const user = await createContact({ ...itemData, ContactId: contactId });

      return HttpResponses.created({ ...user, ContactId: contactId });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return HttpResponses.internalServerError("Internal Server Error");
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return await handlerFactory()
    .addHandler("POST", postContactHandler)
    .execute(event);
};