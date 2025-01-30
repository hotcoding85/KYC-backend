export class DataDto {
  ManageesId: number;
  RejectReason?: string | null;
  RejectDate?: string | null;
  VerificationStatus?: string | null;
  AcceptDate: string; // ISO string for date
}

export class ApproveUserDto {
  Id: string; // UUID
  Type: string; // Enum or string for type
  Data: DataDto;
}
