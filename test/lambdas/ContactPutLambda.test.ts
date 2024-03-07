import { putContactHandler } from "../../src/lambdas/contactPutLambda";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as coreModule from "../../src/core";
import * as databaseModule from "../../src/database/contacts";
import * as httpUtilsModule from "../../src/http/utils";

jest.mock("../../src/core", () => ({
  ...jest.requireActual("../../src/core"),
  updateContact: jest.fn(),
  SendUserUpdate: jest.fn(),
}));

jest.mock("../../src/database/contacts", () => ({
  ...jest.requireActual("../../src/database/contacts"),
  getExistingContactByEmail: jest.fn(),
}));

jest.mock("../../src/http/utils", () => ({
  ...jest.requireActual("../../src/http/utils"),
  HttpResponses: {
    badRequest: jest.fn(() => ({ statusCode: 400, body: JSON.stringify({ error: "Bad Request" }) })),
    internalServerError: jest.fn(() => ({ statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) })),
    ok: jest.fn(() => ({ statusCode: 200, body: JSON.stringify({ message: "OK" }) })),
  },
}));

describe("putContactHandler Tests", () => {
  const createEvent = (overrides = {}): APIGatewayProxyEvent => ({
    httpMethod: "PUT",
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should handle valid request", async () => {
    const mockExistingContact = { someProperty: "value" };
    const mockEmail = "test@example.com";
    const mockUserEmail = "user@example.com";

    (coreModule.updateContact as jest.Mock).mockResolvedValueOnce(mockExistingContact);
    (databaseModule.getExistingContactByEmail as jest.Mock).mockResolvedValueOnce(mockExistingContact);

    const requestBody = JSON.stringify({
      Email: mockEmail,
      UserEmail: mockUserEmail,
      ContactId: "123", 
      Owing: "100",
    });

    const event = createEvent({ body: requestBody });

    const response = await putContactHandler(event);

    expect(httpUtilsModule.HttpResponses.ok).toHaveBeenCalledWith({
      UserA: expect.any(Object),
      UserB: expect.any(String),
      contactAlreadyExists: expect.any(Boolean),
    });

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: "OK" })
    });
  });
});
