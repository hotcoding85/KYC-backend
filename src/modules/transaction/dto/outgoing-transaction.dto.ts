import { UserAccountDto } from 'src/modules/account/dtos/user-account.dto';
import { BeneficiaryAccount } from 'src/modules/beneficiary/entities/beneficiary-account.entity';
import { Beneficiary } from 'src/modules/beneficiary/entities/beneficiary.entity';

export class OutgoingTransactionDto {
  account: UserAccountDto;
  beneficiary: Beneficiary;
  beneficiaryAccount: BeneficiaryAccount;
  amount: number;
  note: string;
}
