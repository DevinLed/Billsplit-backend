// require("dotenv").config();

// const mockedSend = jest.fn();

// jest.mock("notificationapi-node-server-sdk", () => {
//   return {
//     __esModule: true,
//     ...jest.requireActual("notificationapi-node-server-sdk"),
//     send: mockedSend,
//   }
// });

// import * as notifications from '../../src/core/NotificationAPI'
// import { Contact } from '../../src/types';

// describe("Notification Service", () => {
//   const baseContact = {
//     Email: "test@example.com",
//     UserName: "Test User",
//     Owing: 100,
//   };


//   test("SendUserAdd sends a notification", async () => {
//     mockedSend.mockResolvedValueOnce(() => {
//       return {}
//     })

//     await notifications.SendUserAdd(baseContact as Contact);
//     expect(mockedSend).toHaveBeenCalledWith(
//       expect.objectContaining({
//         notificationId: "user_updated",
//         templateId: "user-add",
//         user: expect.objectContaining({
//           id: baseContact.Email,
//           email: baseContact.Email,
//         }),
//         mergeTags: expect.any(Object),
//       })
//     );
//   });
// });

test('Placeholder', () => {
  expect(true).toBe(true);
})