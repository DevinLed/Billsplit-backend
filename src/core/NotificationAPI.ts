import notificationapi from "notificationapi-node-server-sdk";
const logger = require('pino')();
require("dotenv").config();
import { Contact, Transaction } from '../types'; 

const napiClientID = process.env.NOTIFICATIONAPI_CLIENT_ID!;
const napiClientSecret = process.env.NOTIFICATIONAPI_CLIENT_SECRET!;

notificationapi.init(napiClientID, napiClientSecret);

export async function SendUserAdd(itemData: Contact) {
  const userID = itemData.Email;
  const contactName = itemData.UserName;
  const contactOwing = itemData.Owing.toString();
  let message;
  if (parseFloat(contactOwing) < 0) {
    message = "set their owing amount to";
  } else {
    message = "set your owing amount to";
  }

  await notificationapi.send({
    notificationId: "user_updated",
    templateId: "user-add",
    user: {
      id: userID,
      email: userID,
      number: "+15005550006",
    },
    mergeTags: {
      item: contactName,
      message: message,
      owing: contactOwing,
    },
  });
}

export async function SendUserUpdate(itemData: Contact) {
  const userID = itemData.Email;
  const contactName = itemData.UserName;
  const contactOwing = itemData.Owing.toString();
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

export async function SendTransactionUpdate(
  personEmail: string,
  personReceiptAmount: string,
  loggedInUsername: string
) {
  const userID = personEmail;
  const contactName = loggedInUsername;
  const contactOwing = personReceiptAmount;
  await notificationapi.send({
    notificationId: "user_updated",
    templateId: "transaction_updated",
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

export async function SendContactEmail(
  contactEmail: string,
  contactReceiptAmount: string,
  loggedInUsername: string
) {
  const userID = contactEmail;
  const contactName = loggedInUsername;
  const contactOwing = contactReceiptAmount;
  await notificationapi.send({
    notificationId: "contactemail",
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
