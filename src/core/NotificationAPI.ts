import notificationapi from "notificationapi-node-server-sdk";
import pino from 'pino';

require('dotenv').config();
const clientId = process.env.NOTIFICATIONAPI_CLIENT_ID as string;
const clientSecret = process.env.NOTIFICATIONAPI_CLIENT_SECRET as string;

notificationapi.init(clientId, clientSecret);

const logger = pino();

export async function SendUserAdd(itemData) {
  const userID = itemData.Email;
  const contactName = itemData.UserName;
  const contactOwing = itemData.Owing;

  logger.info("Sending user add notification with the following data:", { itemData });

  await notificationapi.send({
    notificationId: "user_updated",
    templateId: "user-add",
    user: {
      id: userID,
      email: userID,
      number: "+15005550006" 
    },
    mergeTags: {
      item: contactName,
      owing: contactOwing,
    },
  });
}

export async function SendUserUpdate(itemData) {
  logger.info("Sending user update notification with the following data:", { itemData });

  const userID = itemData.Email;
  const contactName = itemData.UserName;
  const contactOwing = itemData.Owing;

  await notificationapi.send({
    notificationId: "user_updated",
    templateId: "default",
    user: {
      id: userID,
      email: userID,
      number: "+15005550006",
    },
    mergeTags: {
      item: contactName,
      orderId: contactOwing,
    },
  });
}

export async function SendTransactionUpdate(personEmail, personReceiptAmount, personName) {
  logger.info("Sending transaction update with the following data:", {
    personEmail,
    personName,
    personReceiptAmount,
  });

  const userID = personEmail;
  const contactName = personName;
  const contactOwing = personReceiptAmount;

  await notificationapi.send({
    notificationId: "user_updated",
    templateId: "transaction_updated",
    user: {
      id: userID,
      email: userID,
      number: "+15005550006" 
    },
    mergeTags: {
      item: contactName,
      orderId: contactOwing,
    },
  });
}
