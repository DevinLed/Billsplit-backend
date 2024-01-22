import notificationapi from 'notificationapi-node-server-sdk'

notificationapi.init(
  '49foj0su1nftfvk9p0rvmh31s1', // clientId
  '13mbvbqgkcmaot1j393cle3gmgjapsm36jelpj5poop4smcmjt05'// clientSecret
)

export async function SendUserUpdate(itemData){
    console.log('Sending user update notification with the following data:');
    console.log('itemData:', itemData);
    notificationapi.send({
  notificationId: 'user_updated',
  user: {
    id: itemData.Email,
    email: itemData.Email,
    number: itemData.Phone, 
  },
  mergeTags: {
    user: itemData.UserName,
    owing: itemData.Owing,
    contactId: itemData.Email,
  }
})

}


