import "aws-sdk-client-mock-jest";

const mockedV4 = jest.fn();

jest.mock('uuid', () => {
  return {
    __esModule: true,
    ...jest.requireActual('uuid'),
    v4: mockedV4
  }
})

import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  createTransaction,
  listTransactions,
} from "../../src/core/transactions"; 

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("Transaction Management Operations", () => {
  const baseTransaction = {
    TransactionId: "t1234567-89ab-cdef-1234-56789abcdef0",
    PayerId: "payer@example.com",
    DebtorId: "debtor@example.com",
    TransactionItems: [{ Name: "Item1", Price: 10, Percentage: 50 }],
    Merchant: "Amazon",
    Date: new Date(),
    SelectedValue: "you",
    Email: "user@example.com",
    UserEmail: "user@example.com",
    Name: "John Doe",
    ReceiptTotal: "50",
    Username: "john.doe",
  };

  mockedV4.mockImplementationOnce(() => baseTransaction.TransactionId)

  beforeEach(() => {
    ddbMock.reset();
  });

  test("Should create transaction database item", async () => {
    ddbMock.on(PutCommand).resolvesOnce({});
    await expect(createTransaction(baseTransaction)).resolves.toEqual(baseTransaction);
    expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
      TableName: expect.any(String),
      Item: baseTransaction,
    });
  });

  test("Should list transactions", async () => {
    const transactionsList = [baseTransaction];
    ddbMock.on(ScanCommand).resolvesOnce({
      Items: transactionsList
    });
    await expect(listTransactions()).resolves.toEqual(transactionsList);
    expect(ddbMock).toHaveReceivedCommandTimes(ScanCommand, 1);
  });

  test("Should handle error in createTransaction", async () => {
    ddbMock.on(PutCommand).rejects(new Error("Create transaction error"));
    await expect(createTransaction(baseTransaction)).rejects.toThrow("Create transaction error");
  });

  test("Should handle error in listTransactions", async () => {
    ddbMock.on(ScanCommand).rejects(new Error("List transactions error"));
    await expect(listTransactions()).rejects.toThrow("List transactions error");
  });
});
