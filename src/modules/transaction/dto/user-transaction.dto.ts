export class UserTransactionDto {
  id: string;
  asset: Record<string, any>;
  network: Record<string, any>;
  amount: string;
  usd_rate: string;
  fee_usd_rate: string | null;
  type: string;
  transactionType: string;
  blockchain: string;
  from_address: string;
  to_address: string;
  blockchain_tx_hash: string;
  blockchain_explorer: string;
  confirmations: number;
  chain_fee: string;
  platform_fee: string;
  company_fee: string;
  status: string;
  created_at: string;
  confirmed_at: string;

  constructor(data: {
    id: string;
    asset: Record<string, any>;
    network: Record<string, any>;
    amount: string;
    usd_rate: string;
    fee_usd_rate: string | null;
    type: string;
    transactionType: string;
    blockchain: string;
    from_address: string;
    to_address: string;
    blockchain_tx_hash: string;
    blockchain_explorer: string;
    confirmations: number;
    chain_fee: string;
    platform_fee: string;
    company_fee: string;
    status: string;
    created_at: string;
    confirmed_at: string;
  }) {
    this.id = data.id;
    this.amount = data.amount;
    this.asset = data.asset;
    this.network = data.network;
    this.usd_rate = data.usd_rate;
    this.fee_usd_rate = data.fee_usd_rate;
    this.type = data.type;
    this.transactionType = data.transactionType;
    this.blockchain = data.blockchain;
    this.from_address = data.from_address;
    this.to_address = data.to_address;
    this.blockchain_tx_hash = data.blockchain_tx_hash;
    this.blockchain_explorer = data.blockchain_explorer;
    this.confirmations = data.confirmations;
    this.chain_fee = data.chain_fee;
    this.platform_fee = data.platform_fee;
    this.company_fee = data.company_fee;
    this.status = data.status;
    this.created_at = data.created_at;
    this.confirmed_at = data.confirmed_at;
  }
}
