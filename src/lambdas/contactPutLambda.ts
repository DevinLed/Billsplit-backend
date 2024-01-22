import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { updateContact } from "../core";
import { getExistingContactByEmail } from "../database/contacts";
import { HttpResponses } from "../http/utils";
import { handlerFactory } from "../http/handler";


export async function putContactHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return HttpResponses.badRequest("Invalid request. Body is missing.");
    }

    const itemData = JSON.parse(event.body);

    console.log(`Updating contact with id: ${itemData.ContactId}`);

    const existingContact = await updateContact(itemData);

    const reciprocalContact = await getExistingContactByEmail(
      itemData.Email,
      itemData.UserEmail
    );

    console.log(`Reciprocal Contact?`, reciprocalContact);

    if (reciprocalContact) {
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
    console.error("Error updating item:", error);

    return HttpResponses.internalServerError("Failed to update item.");
  }
}

const customHandler = handlerFactory();

customHandler.addHandler("PUT", putContactHandler);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return await customHandler.execute(event);
};
