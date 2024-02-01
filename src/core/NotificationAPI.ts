import notificationapi from "notificationapi-node-server-sdk";
const logger = require('pino')()
require("dotenv").config();

const napiClientID = process.env.NOTIFICATIONAPI_CLIENT_ID!;
const napiClientSecret = process.env.NOTIFICATIONAPI_CLIENT_SECRET!;


notificationapi.init(napiClientID, napiClientSecret);

// notificationapi.retract({

// })

export async function SendUserAdd(itemData) {
  const userID = itemData.Email;
  const contactName = itemData.UserName;
  const contactOwing = itemData.Owing;
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
export async function SendUserUpdate(itemData) {
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

export async function SendTransactionUpdate(
  personEmail,
  personReceiptAmount,
  personName
) {
  const userID = personEmail;
  const contactName = personName;
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
