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
  ListUsersCommandOutput,
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
): Promise<ListUsersCommandOutput> {
  return cognitoIdentityProvider.listUsers(command);
}

export async function postContactHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return HttpResponses.badRequest("Invalid request. Body is missing.");
    }

    const itemData = JSON.parse(event.body);
    let existingUser;
    let existingCurrent;
    const currentEmail = itemData.UserEmail;
    const userPoolId = "us-east-1_whmGZCnxe";
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
      const users = await listUsers(listUsersCommand);
      if (users?.Users && users.Users.length > 0) {
        existingUser = users.Users[0];
      }
    } catch (error) {
      logger.error("Error querying Cognito for target user:", error);
      return HttpResponses.internalServerError("Internal Server Error");
    }

    try {
      const users = await listUsers(listCurrentCommand);
      if (itemData.Email === itemData.UserEmail) {
        logger.info("Found yourself", itemData.Email, itemData.UserEmail);
        const contactId = uuidv4();
        const userA = await createContact({
          ...itemData,
          ContactId: existingUser.Username,
        });
        logger.info("Processed userA creation:", userA);
        return HttpResponses.created({
          UserA: userA,
          UserB: null,
          contactAlreadyExists: false,
        });
      } else {
        if (users?.Users && users.Users.length > 0) {
          existingCurrent = users.Users[0];
          logger.info(
            "Found existing current user in Cognito:",
            existingCurrent.Username
          );
        }
      }
    } catch (error) {
      logger.error("Error querying Cognito for current user:", error);
      return HttpResponses.internalServerError("Internal Server Error");
    }

    if (existingUser) {
      const contactId = existingUser.Username;
      const existingContactInDB = await getExistingContactByEmail(
        itemData.Email,
        currentEmail
      );
      const oppositeOwing = -parseFloat(itemData.Owing);

      const userA = await createContact({
        ...itemData,
        UserEmail: currentEmail,
        ContactId: contactId,
        Owing: existingContactInDB
          ? -(
              parseFloat(existingContactInDB.Owing) - parseFloat(itemData.Owing)
            ).toString() ||
            itemData.Owing ||
            "0.00"
          : itemData.Owing,
      });

      logger.info("Processed userA creation:", userA);

      if (!existingContactInDB) {
        const userB = await createContact({
          Email: currentEmail,
          Name: itemData.UserName,
          UserName: itemData.Name,
          UserEmail: itemData.Email,
          ContactId: existingCurrent.Username,
          Phone: "Enter phone #",
          Owing: oppositeOwing.toString() || "0.00",
        });

        logger.info("Processed userB creation:", userB);

        await SendUserAdd(itemData);
        return HttpResponses.created({ UserA: userA, UserB: userB });
      } else {
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
          Owing: (
            parseFloat(existingContactInDB.Owing) - parseFloat(itemData.Owing)
          ).toString(),
        });

        return HttpResponses.created({
          UserA: userA,
          UserB: "updated",
          contactAlreadyExists: true,
        });
      }
    } else {
      const contactId = uuidv4();
      const user = await createContact({
        ...itemData,
        ContactId: contactId,
        UserEmail: currentEmail,
      });
      const contactEmail = itemData.Email;
      const contactReceiptAmount = itemData.Owing;
      const loggedInUsername = itemData.UserName;

      await SendContactEmail(
        contactEmail,
        contactReceiptAmount,
        loggedInUsername
      );

      return HttpResponses.created({
        UserA: user,
        UserB: null,
        contactAlreadyExists: false,
      });
    }
  } catch (error) {
    logger.error("Error processing request:", error);
    return HttpResponses.internalServerError("Internal Server Error");
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.info(`Executing ${event.httpMethod} request for path ${event.path}`);
  logger.info(`Request Event: ${JSON.stringify(event)}`);
  return await handlerFactory()
    .addHandler("POST", postContactHandler)
    .execute(event);
};
