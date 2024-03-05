import { handler as postContactHandler } from "../../src/lambdas/contactPostLambda";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as contacts from "../../src/core";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";

jest.mock("../../src/core", () => ({
  createContact: jest.fn(),
  deleteContact: jest.fn(),
  getExistingContactByEmail: jest.fn(),
  listContacts: jest.fn(),
}));

jest.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProvider: jest.fn().mockImplementation(() => ({
    listUsers: jest.fn().mockImplementation((command) => {
      const users = [
        {
          Username: "user123",
          Attributes: [{ Name: "email", Value: "existing@example.com" }],
        },
        {
          Username: "currentUser123",
          Attributes: [{ Name: "email", Value: "current@example.com" }],
        },
      ];
      const filteredUsers = users.filter((user) =>
        command.Filter.includes(user.Attributes[0].Value)
      );
      return Promise.resolve({ Users: filteredUsers });
    }),
  })),
}));

describe("postContactHandler Tests", () => {
  const createEvent = (overrides = {}): APIGatewayProxyEvent => ({
    httpMethod: "POST",
    path: "/contacts",
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: {},
    stageVariables: null,
    requestContext: {} as any,
    resource: "/contacts",
    body: null,
    isBase64Encoded: false,
    ...overrides,
  });

  test("Should create contact and send notification successfully", async () => {
    const mockItemData = {
      ContactId: "c1234567-89ab-cdef-1234-56789abcdef0",
      Name: "Test User",
      Email: "test@example.com",
      Phone: "123456789",
      Owing: "100.00",
      UserEmail: "user@example.com",
      UserName: "TestUser",
    };
    (contacts.createContact as jest.Mock).mockResolvedValueOnce(mockItemData);
    (contacts.getExistingContactByEmail as jest.Mock).mockResolvedValueOnce(
      null
    );
    const event = createEvent({ body: JSON.stringify(mockItemData) });
    const result = await postContactHandler(event, {} as any);
    expect(result.statusCode).toEqual(201);
    expect(JSON.parse(result.body).UserA).toEqual(mockItemData);
    expect(JSON.parse(result.body).UserB).toBeNull();
    expect(JSON.parse(result.body).contactAlreadyExists).toBeFalsy();
  });

  test("Should handle creating a contact with existing user and current user", async () => {
    const mockItemData = {
      ContactId: "c1234567-89ab-cdef-1234-56789abcdef0",
      Name: "Test User",
      Email: "existing@example.com",
      Phone: "123456789",
      Owing: "100.00",
      UserEmail: "current@example.com",
      UserName: "TestUser",
    };
    (contacts.createContact as jest.Mock).mockResolvedValueOnce({
      ...mockItemData,
      ContactId: "existingContactId",
    });
    (contacts.getExistingContactByEmail as jest.Mock).mockResolvedValueOnce(
      null
    );
    const event = createEvent({ body: JSON.stringify(mockItemData) });
    const result = await postContactHandler(event, {} as any);
    expect(result.statusCode).toEqual(201);
  });
});
