import { handler as postTransactionHandler } from "../../src/lambdas/transactionPostLambda";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { SendTransactionUpdate } from "../../src/core/NotificationAPI";

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockReturnThis(),
    send: jest.fn().mockResolvedValue({}),
  },
  PutCommand: jest.fn(),
}));

jest.mock("../../src/core/NotificationAPI", () => ({
  SendTransactionUpdate: jest.fn().mockResolvedValue({}),
}));

describe("postTransactionHandler Tests", () => {
  const createEvent = (bodyObj = {}, overrides = {}): APIGatewayProxyEvent => ({
    httpMethod: "POST",
    path: "/transaction",
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: {},
    stageVariables: null,
    requestContext: {} as any,
    resource: "",
    body: JSON.stringify(bodyObj),
    isBase64Encoded: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should successfully create a transaction", async () => {
    const validRequestBody = {
      someKey: "someValue",
      anotherKey: "anotherValue",
    };

    const event = createEvent(validRequestBody);
    const context = {} as Context;

    (SendTransactionUpdate as jest.Mock).mockResolvedValueOnce({});

    const response = await postTransactionHandler(event, context);

    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body)).toHaveProperty("message", "Transaction created successfully");
    expect(SendTransactionUpdate).toHaveBeenCalled();
  });
});
