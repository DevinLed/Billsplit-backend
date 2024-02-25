import { v4 as uuidv4 } from "uuid";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createContact, deleteContact } from "../core";
import {
  CognitoIdentityProvider,
  ListUsersCommandInput,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { HttpResponses } from "../http/utils";
import { handlerFactory } from "../http/handler";
import { getExistingContactByEmail } from "../database/contacts";
import { SendUserAdd, SendContactEmail } from "../core/NotificationAPI";
import pino from "pino";

const logger = pino();
const cognitoIdentityProvider = new CognitoIdentityProvider({
  region: "us-east-1",
});

async function listUsers(
  command: ListUsersCommandInput
): Promise<UserType[]> {
  try {
    const response = await cognitoIdentityProvider.listUsers(command);
    return response.Users ?? [];
  } catch (error) {
    logger.error("Error querying Cognito:", error);
    throw new Error("Failed to query Cognito.");
  }
}

export async function postContactHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return HttpResponses.badRequest("Invalid request. Body is missing.");
  }

  const itemData = JSON.parse(event.body);
  const userPoolId = "us-east-1_whmGZCnxe";
  const currentEmail = itemData.UserEmail;
  const targetUserFilter = `email = "${itemData.Email}"`;
  const currentUserFilter = `email = "${currentEmail}"`;

  let existingUser: UserType | null = null;
  let existingCurrent: UserType | null = null;

  try {
    const targetUsers = await listUsers({
      UserPoolId: userPoolId,
      Filter: targetUserFilter,
    });
    existingUser = targetUsers[0] ?? null;

    const currentUsers = await listUsers({
      UserPoolId: userPoolId,
      Filter: currentUserFilter,
    });
    existingCurrent = currentUsers[0] ?? null;
  } catch (error) {
    logger.error("Error querying Cognito:", error);
    return HttpResponses.internalServerError("Internal Server Error");
  }

  try {
    if (itemData.Email === currentEmail) {
      logger.info("Found yourself", itemData.Email, currentEmail);
      const contactId = uuidv4();
      const userA = await createContact({
        ...itemData,
        ContactId: contactId,
      });
      logger.info("Processed userA creation:", userA);
      return HttpResponses.created({
        UserA: userA,
        UserB: null,
        contactAlreadyExists: false,
      });
    }

    if (existingUser && existingCurrent) {
      const contactId = existingUser.Username ?? uuidv4();
      const existingContactInDB = await getExistingContactByEmail(itemData.Email, currentEmail);
      const oppositeOwing = -parseFloat(itemData.Owing);

      const userA = await createContact({
        ...itemData,
        UserEmail: currentEmail,
        ContactId: contactId,
        Owing: existingContactInDB
          ? (-(parseFloat(existingContactInDB.Owing) + parseFloat(itemData.Owing))).toString()
          : itemData.Owing,
      });

      let userBResponse;
      if (!existingContactInDB) {
        userBResponse = await createContact({
          Email: currentEmail,
          Name: itemData.UserName,
          UserName: itemData.Name,
          UserEmail: itemData.Email,
          ContactId: existingCurrent?.Username ?? uuidv4(),
          Phone: "Enter phone #",
          Owing: oppositeOwing.toString(),
        });
      } else {
        await deleteContact(existingContactInDB.ContactId, existingContactInDB.UserEmail);
        userBResponse = "updated";
      }

      return HttpResponses.created({
        UserA: userA,
        UserB: userBResponse,
        contactAlreadyExists: !!existingContactInDB,
      });
    } else {
      const contactId = uuidv4();
      const user = await createContact({
        ...itemData,
        ContactId: contactId,
        UserEmail: currentEmail,
      });

      await SendContactEmail(itemData.Email, itemData.Owing, itemData.UserName);

      return HttpResponses.created({
        UserA: user,
        UserB: null,
        contactAlreadyExists: false,
      });
    }
  } catch (error) {
    logger.error("Error processing contact creation:", error);
    return HttpResponses.internalServerError("Internal Server Error");
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.info(`Executing ${event.httpMethod} request for path ${event.path}`);
  logger.info(`Request Event: ${JSON.stringify(event)}`);
  return handlerFactory()
    .addHandler("POST", postContactHandler)
    .execute(event);
};
