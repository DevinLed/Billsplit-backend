import notificationapi from "notificationapi-node-server-sdk";

require('dotenv').config();
const clientId = process.env.NOTIFICATIONAPI_CLIENT_ID as string;
const clientSecret = process.env.NOTIFICATIONAPI_CLIENT_SECRET as string;

notificationapi.init(clientId, clientSecret);


export async function SendUserAdd(itemData) {
    const userID = itemData.Email;
    const contactName = itemData.UserName;
    const contactOwing = itemData.Owing;
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
      console.log("Sending user update notification with the following data:");
      console.log("itemData:", itemData);
      const userID = itemData.Email;
      const contactName = itemData.UserName;
      const contactOwing = itemData.Owing;
      console.log("userID? contactName? contactOwing?", userID, contactName, contactOwing);
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
    console.log("Sending transaction with the following data:");
    console.log("personEmail", personEmail);
    console.log("personName", personName);
    console.log("personReceiptAmount", personReceiptAmount);
    const userID = personEmail;
    const contactName = personName;
    const contactOwing = personReceiptAmount;
    console.log ("userID? contactName? contactOwing?", userID, contactName, contactOwing);
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
