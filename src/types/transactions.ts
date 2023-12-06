export interface Transaction {
    TransactionId: string;
    PayerId: string;
    DebtorId: string;
    TransactionItems: TransactionItem[];
    Merchant: string;
    Date: Date;
}

export interface TransactionItem {
    Name: string;
    Price: number;
    Percentage: number;
}