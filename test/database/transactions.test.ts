import "aws-sdk-client-mock-jest";

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { createTransaction, updateTransaction, listTransactions } from "../../src/database/transactions";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("Transactions Operations", () => {
  const transactionParams = {
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
    Email: "email@example.com",
    UserEmail: "user@example.com",
    Name: "Name",
    ReceiptTotal: "100",
    Username: "username",
  };

  const updatedTransaction = {
    ...transactionParams,
    Merchant: "updated-merchant",
  };

  test("Should create transaction database item", async () => {
    ddbMock.on(PutCommand).resolvesOnce({});
    await expect(createTransaction(transactionParams)).resolves.toEqual(transactionParams);
    expect(ddbMock).toHaveReceivedCommandTimes(PutCommand, 1);
    expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
      TableName: "Transactions",
      Item: transactionParams,
    });
  });

  test("Should throw error on create transaction failure", async () => {
    ddbMock.on(PutCommand).rejectsOnce();
    await expect(createTransaction(transactionParams)).rejects.toThrow();
    expect(ddbMock).toHaveReceivedCommandTimes(PutCommand, 1);
  });

  test("Should update transaction database item", async () => {
    ddbMock.on(UpdateCommand).resolvesOnce({
      Attributes: updatedTransaction
    });
    await expect(updateTransaction(updatedTransaction)).resolves.toEqual(updatedTransaction);
    expect(ddbMock).toHaveReceivedCommandTimes(UpdateCommand, 1);
  });

  test("Should throw error on update transaction failure", async () => {
    ddbMock.on(UpdateCommand).rejectsOnce(new Error("Update failed"));
    await expect(updateTransaction(updatedTransaction)).rejects.toThrow("Update failed");
    expect(ddbMock).toHaveReceivedCommandTimes(UpdateCommand, 1);
  });

  test("Should return list of transactions", async () => {
    const transactionsList = [transactionParams, updatedTransaction];
    ddbMock.on(ScanCommand).resolvesOnce({
      Items: transactionsList
    });
    await expect(listTransactions()).resolves.toEqual(transactionsList);
    expect(ddbMock).toHaveReceivedCommandTimes(ScanCommand, 1);
  });

  test("Should throw error on list transactions failure", async () => {
    ddbMock.on(ScanCommand).rejectsOnce(new Error("Failed to retrieve transactions"));
    await expect(listTransactions()).rejects.toThrow("Failed to retrieve transactions");
    expect(ddbMock).toHaveReceivedCommandTimes(ScanCommand, 1);
  });

  afterEach(() => {
    ddbMock.reset();
  });
});
