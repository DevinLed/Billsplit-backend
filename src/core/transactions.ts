import { v4 as uuidv4 } from 'uuid';
import * as db from '../database/transactions';
import { Transaction } from '../types';

export async function createTransaction(transaction: Transaction): Promise<Transaction> {

    const id = uuidv4();
    return await db.createTransaction(transaction);
}

export async function updateTransaction(transaction: Transaction) {

    return await db.updateTransaction(transaction)
}

export async function getTransaction() {

}
