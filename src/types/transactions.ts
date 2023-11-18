export interface Transaction {
    TransactionId: string;
    PayerId: string;
    DebtorId: string;
    TransactionItems: TransactionItem[];
}

export interface TransactionItem {
    Name: string;
    Price: number;
    Percentage: number;
}