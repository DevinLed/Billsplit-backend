import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { updateContact } from "../core";
import { getExistingContactByEmail } from "../database/contacts";
import { HttpResponses } from "../http/utils";
import { handlerFactory } from "../http/handler";
import { SendUserUpdate } from "../core/NotificationAPI";
import pino from 'pino';

const logger = pino();

export async function putContactHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return HttpResponses.badRequest("Invalid request. Body is missing.");
    }

    const itemData = JSON.parse(event.body);

    logger.info(`Updating contact with id: ${itemData.ContactId}`);

    const existingContact = await updateContact(itemData);
    
    logger.info(`Processing reciprocal contact update for email: ${itemData.Email}`);
    const reciprocalContact = await getExistingContactByEmail(
      itemData.Email,
      itemData.UserEmail
    );

    logger.info(`Reciprocal Contact found:`, reciprocalContact);

    if (reciprocalContact) {
      await SendUserUpdate(itemData);
      const newReciprocalOwing = -parseFloat(itemData.Owing) || "0.00";
      await updateContact({
        ...reciprocalContact,
        Owing: newReciprocalOwing.toString(),
      });
    }

    const responsePayload = {
      UserA: existingContact,
      UserB: reciprocalContact ? "updated" : null,
      contactAlreadyExists: !!reciprocalContact,
    };

    return HttpResponses.ok(responsePayload);
  } catch (error) {
    logger.error("Error updating item:", error);
    return HttpResponses.internalServerError("Failed to update item.");
  }
}

const customHandler = handlerFactory();
customHandler.addHandler("PUT", putContactHandler);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.info(`Executing PUT request for path ${event.path}`);
  return await customHandler.execute(event);
};