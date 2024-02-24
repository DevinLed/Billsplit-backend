import * as db from '../database/transactions'; 
import { Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

export async function createTransaction(transaction: Transaction): Promise<Transaction> {
    try {
        const id = uuidv4();
        return await db.createTransaction({ ...transaction, TransactionId: id });
    } catch (error) {
        throw error;
    }
}

export async function listTransactions(): Promise<Transaction[]> {
  try {
      return await db.listTransactions();
  } catch (error) {
      throw error;
  }
}
