import notificationapi from "notificationapi-node-server-sdk";

notificationapi.init(
  "49foj0su1nftfvk9p0rvmh31s1", // clientId
  "13mbvbqgkcmaot1j393cle3gmgjapsm36jelpj5poop4smcmjt05" // clientSecret
);

export async function SendUserUpdate(itemData) {
  console.log("Sending user update notification with the following data:");
  console.log("itemData:", itemData);
  const userID = itemData.Email;
  const contactName = itemData.UserName;
  const contactOwing = itemData.Owing;
  console.log ("userID? contactName? contactOwing?", userID, contactName, contactOwing);
  await notificationapi.send({
    notificationId: "user_updated",
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


export async function SendTransactionUpdate(personEmail, personOwing, personName) {
    console.log("Sending user update notification with the following data:");
    console.log("personEmail", personEmail);
    console.log("personName", personName);
    console.log("personOwing", personOwing);
    const userID = personEmail;
    const contactName = personName;
    const contactOwing = personOwing;
    console.log ("userID? contactName? contactOwing?", userID, contactName, contactOwing);
    await notificationapi.send({
      notificationId: "user_updated",
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
