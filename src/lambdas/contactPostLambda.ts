import { v4 as uuidv4 } from "uuid";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createContact, deleteContact } from "../core";
import { Contact } from "../types";
import {
  CognitoIdentityProvider,
  ListUsersCommandInput,
  ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { HttpResponses, HttpStatus } from "../http/utils";
import { Handler, handlerFactory } from "../http/handler";
import {
  getExistingContactByEmail,
  updateExistingContact,
} from "../database/contacts";
import { SendUserUpdate } from "../core/NotificationAPI";

const cognitoIdentityProvider = new CognitoIdentityProvider({
  region: "us-east-1",
});

async function listUsers(
  command: ListUsersCommandInput
): Promise<ListUsersCommandOutput> {
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

    const { ...itemData } = JSON.parse(event.body);
    

    let existingUser;
    let existingCurrent;

    const currentEmail = itemData.UserEmail;

    const userPoolId = "us-east-1_whmGZCnxe";
    const filter = `email = "${itemData.Email}"`;
    const filterCurrent = `email = "${itemData.UserEmail}"`;

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
      console.error("Error querying Cognito:", error);
      return HttpResponses.internalServerError("Internal Server Error");
    }
    try {
      const users: ListUsersCommandOutput = await listUsers(listCurrentCommand);

      if (users?.Users && users.Users.length > 0) {
        existingCurrent = users.Users[0];
        console.log("Cognito ID?", existingCurrent.Username);
      }
    } catch (error: any) {
      console.error("Error querying Cognito:", error);
      return HttpResponses.internalServerError("Internal Server Error");
    }

    if (existingUser) {
      const contactId = existingUser.Username;

      const existingContactInDB = await getExistingContactByEmail(
        itemData.Email,
        itemData.UserEmail
      );
      
      const oppositeOwing = -parseFloat(itemData.Owing);
      const userA = await createContact({
        ...itemData,
        UserEmail: currentEmail,
        ContactId: contactId,
        UserName: itemData.UserName,
        Owing: existingContactInDB
      ? -(
          parseFloat(existingContactInDB.Owing) -
          parseFloat(itemData.Owing)
        ).toString()
       || itemData.Owing || "0.00" : itemData.Owing
      });
      console.log(
        "itemData.Email, itemData.UserEmail:",
        itemData.Email,
        itemData.UserEmail
      );
      console.log("existingContactInDB?", existingContactInDB);
      if (!existingContactInDB) {
        const userB = await createContact({
          Email: currentEmail,
          Name: itemData.UserName,
          UserName: itemData.Name,
          UserEmail: itemData.Email,
          ContactId: existingCurrent.Username,
          Phone: "Enter phone #",
          Owing: oppositeOwing || "0.00",
        });

        console.log("Sending notification with itemData:", itemData);
        console.log("Sending notification with contactId:", contactId);
        await SendUserUpdate(itemData);
        return HttpResponses.created({ UserA: userA, UserB: userB });
      } else {
        console.log("existingCurrent.Username:", existingCurrent.Username);
        console.log("itemData.Email:", itemData.Email);
        console.log("itemData.UserEmail:", itemData.UserEmail);
        await deleteContact(
          existingContactInDB.ContactId,
          existingContactInDB.UserEmail
        );
        const userB = await createContact({
          Email: currentEmail,
          Name: existingContactInDB.Name,
          UserName: existingContactInDB.UserName,
          UserEmail: existingContactInDB.UserEmail,
          ContactId: existingCurrent.Username,
          Phone: existingContactInDB.Phone,
          Owing:
            parseFloat(existingContactInDB.Owing) -
              parseFloat(itemData.Owing) || "0.00",
        });
        return HttpResponses.created({ UserA: userA, UserB: "updated", 
        contactAlreadyExists: true, });
      }
    } else {
      const contactId = uuidv4();
      const user = await createContact({
        ...itemData,
        ContactId: contactId,
        UserEmail: currentEmail,
      });

      return HttpResponses.created({ UserA: user, UserB: null, 
        contactAlreadyExists: false, });
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
  console.log(`Executing ${event.httpMethod} request`);
  console.log(`Event: ${JSON.stringify(event)}`);
  return await handlerFactory()
    .addHandler("POST", postContactHandler)
    .execute(event);
};
