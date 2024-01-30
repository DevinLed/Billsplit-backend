import notificationapi from "notificationapi-node-server-sdk";

notificationapi.init(
  "49foj0su1nftfvk9p0rvmh31s1", // clientId
  "13mbvbqgkcmaot1j393cle3gmgjapsm36jelpj5poop4smcmjt05" // clientSecret
);

export async function SendUserAdd(itemData) {
    const userID = itemData.Email;
    const contactName = itemData.UserName;
    const contactOwing = itemData.Owing;
    let message;
    if (parseFloat(contactOwing) < 0) {
      message = 'set their owing amount to';
    } else {
      message = 'set your owing amount to';
    }
  
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
          message: message,
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
