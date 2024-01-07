import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createContact } from "../core";
import { Contact } from "../types";
import { v4 as uuidv4 } from "uuid";
import {
  CognitoIdentityProvider,
  ListUsersCommand,
  ListUsersCommandInput,
  ListUsersCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoIdentityProvider = new CognitoIdentityProvider({
  region: 'us-east-1',
});

async function listUsers(command: ListUsersCommandInput): Promise<ListUsersCommandOutput> {
  return cognitoIdentityProvider.listUsers(command);
}

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

    return res;
  }

  const { loggedInUserEmail, ...itemData } = JSON.parse(event.body);

  if (itemData.itemId) {
    const user = await createContact({
      ...itemData,
      UserEmail: loggedInUserEmail,
    });

    const res = {
      ...response,
      statusCode: 200,
      body: JSON.stringify({ message: "Item updated successfully" }),
    };

    return res;

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

        const res = {
          ...response,
          statusCode: 201,
          body: JSON.stringify({ ...user, ContactId: userId }),
        };

        return res;
      }
    } catch (error: any) {
      console.error('Error querying Cognito:', error);
    }

    const contactId = uuidv4();
    const user = await createContact({ ...itemData, ContactId: contactId });

    const res = {
      ...response,
      statusCode: 201,
      body: JSON.stringify({ ...user, ContactId: contactId }),
    };

    return res;
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
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
