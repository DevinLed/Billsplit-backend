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

    const { UserEmail, UserName, ...itemData } = JSON.parse(event.body);

    let existingUser;
    let existingCurrent;

    const currentEmail = UserEmail;

    const userPoolId = 'us-east-1_whmGZCnxe';
    const filter = `email = "${itemData.Email}"`;
    const filterCurrent = `email = "${currentEmail}"`;

    const listUsersCommand: ListUsersCommandInput = {
      UserPoolId: userPoolId,
      Filter: filter,
    };
    const listCurrentCommand: ListUsersCommandInput = {
      UserPoolId: userPoolId,
      Filter: filterCurrent,
    };

    try {
      const users: ListUsersCommandOutput = await listUsers(listUsersCommand);

      if (users?.Users && users.Users.length > 0) {
        existingUser = users.Users[0];
      }
    } catch (error: any) {
      console.error('Error querying Cognito:', error);
      return HttpResponses.internalServerError("Internal Server Error");
    }
    try {
      const users: ListUsersCommandOutput = await listUsers(listCurrentCommand);

      if (users?.Users && users.Users.length > 0) {
        existingCurrent = users.Users[0];
      }
    } catch (error: any) {
      console.error('Error querying Cognito:', error);
      return HttpResponses.internalServerError("Internal Server Error");
    }
    const cognitoUserId = event.requestContext?.identity?.cognitoIdentityId || uuidv4();

    if (existingUser) {
      const contactId = existingUser.Username;

      const userA = await createContact({
        ...itemData,
        UserEmail: currentEmail,
        ContactId: contactId,
        UserName: itemData.Name
      });

      const userB = await createContact({
        Email: currentEmail,
        Name: UserName,
        UserName: itemData.UserName,
        UserEmail: itemData.Email,
        ContactId: cognitoUserId,
        Phone: '1111111111', 
        Owing: '0', 
      });

      return HttpResponses.created({ UserA: userA, UserB: userB });
    } else {
      const contactId = uuidv4();
      const user = await createContact({ ...itemData, ContactId: contactId, UserEmail: currentEmail });

      return HttpResponses.created({ UserA: user, UserB: null });
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