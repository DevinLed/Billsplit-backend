import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { createTransaction, listTransactions } from "../../src/database/transactions";
import { Transaction } from "../../src/types";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("Transactions Operations", () => {
  const transactionParams: Transaction = {
    TransactionId: "some-id",
    PayerId: "payer-id",
    DebtorId: "debtor-id",
    TransactionItems: [
      {
        Name: "Item 1",
        Percentage: 50,
        Price: 100,
      },
    ],
    Merchant: "merchant",
    Date: new Date(),
    SelectedValue: "value",
    Email: "dave@dave.com",
    UserEmail: "walala@walala.com",
    Name: "Joe",
    ReceiptTotal: "1337",
    Username: "DDBBCC",
  };

  test("Should create transaction database item", async () => {
    ddbMock.on(PutCommand).resolvesOnce({});
    await expect(createTransaction(transactionParams)).resolves.toEqual(transactionParams);
  });

  test("Should throw error on create transaction failure", async () => {
    ddbMock.on(PutCommand).rejectsOnce(new Error("Create failed"));
    await expect(createTransaction(transactionParams)).rejects.toThrow("Create failed");
  });

  test("Should return list of transactions", async () => {
    const transactionsList: Transaction[] = [transactionParams];
    ddbMock.on(ScanCommand).resolvesOnce({ Items: transactionsList });
    await expect(listTransactions()).resolves.toEqual(transactionsList);
  });

  test("Should throw error on list transactions failure", async () => {
    ddbMock.on(ScanCommand).rejectsOnce(new Error("List failed"));
    await expect(listTransactions()).rejects.toThrow("List failed");
  });

  test("Should return empty array when no transactions are found", async () => {
    ddbMock.on(ScanCommand).resolvesOnce({ Items: [] });
    await expect(listTransactions()).resolves.toEqual([]);
  });

  afterEach(() => {
    ddbMock.reset();
  });
});
