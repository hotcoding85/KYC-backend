export class SenderDetailsDto {
  RoutingNumber: string;
  AccountNumber: string;
  Name: string;
  AddressLine1?: string | null;
  AddressLine2?: string | null;
  AddressLine3?: string | null;
}

export class DataDto {
  AccountsId: number;
  TransactionsId: number;
  OriginalTransactionsId?: number | null;
  Reference: string;
  SenderDetails: SenderDetailsDto;
  Amount: number;
  Imad?: string | null;
  Date: string; // ISO string for date
  bReversal: boolean;
  bFlagged: boolean;
}

export class IncomingTransactionDto {
  Id: string; // UUID
  Type: string; // Enum or string for type
  Data: DataDto;
}
