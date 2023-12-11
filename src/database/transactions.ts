import * as core from '../core/transactions'; 
import { Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

export async function createTransaction(transaction: Transaction): Promise<Transaction> {
    try {
        const id = uuidv4();
        return await core.createTransaction({ ...transaction, TransactionId: id });
    } catch (error) {
        throw error;
    }
}

export async function updateTransaction(transaction: Transaction): Promise<Transaction> {
    try {
        return await core.updateTransaction(transaction);
    } catch (error) {
        throw error;
    }
}

