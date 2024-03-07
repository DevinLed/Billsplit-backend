import { handler as getTransactionHandler } from "../../src/lambdas/transactionGetLambda";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import * as transactionsCore from "../../src/core/transactions";

jest.mock("../../src/core/transactions", () => ({
  listTransactions: jest.fn(),
}));

describe("getTransactionHandler Tests", () => {
  const createEvent = (overrides = {}): APIGatewayProxyEvent => ({
    httpMethod: "GET",
    path: "/transactions",
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: {},
    stageVariables: null,
    requestContext: {} as any,
    resource: "/transactions",
    body: null,
    isBase64Encoded: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should return transactions successfully", async () => {
    const mockTransactions = [{ id: "1", amount: 100 }];
    (transactionsCore.listTransactions as jest.Mock).mockResolvedValueOnce(
      mockTransactions
    );

    const event = createEvent();
    const context = {};

    const result = await getTransactionHandler(event, context as any);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify(mockTransactions));
    expect(transactionsCore.listTransactions).toHaveBeenCalled();
  });

  test("Should handle error when fetching transactions fails", async () => {
    (transactionsCore.listTransactions as jest.Mock).mockRejectedValueOnce(
      new Error("Error fetching transactions")
    );

    const event = createEvent();
    const context = {};

    const result = await getTransactionHandler(event, context as any);
    expect(result.statusCode).toEqual(500);
    expect(JSON.parse(result.body).error).toEqual(
      "Error fetching transactions" 
    );
    expect(transactionsCore.listTransactions).toHaveBeenCalled();
  });
});
