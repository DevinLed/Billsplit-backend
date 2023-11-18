// import { v4 as uuid } from 'uuid';
import * as db from '../database/transactions';
import { Transaction } from '../types';

export async function createTransaction(transaction: Transaction): Promise<Transaction> {
    const id = Math.random() * 1000000;
    // const data: User = {
    //     ...user,
    //     // itemId: uuid()
    //     itemId: String(id)
    // }
    
    return await db.createTransaction(transaction);
}

export async function updateTransaction(transaction: Transaction) {

    return await db.updateTransaction(transaction)
}

export async function getTransaction() {

}
