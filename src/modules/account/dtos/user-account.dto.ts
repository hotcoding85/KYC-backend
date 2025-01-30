export class UserAccountDto {
  id: string;
  icon: string;
  assetType: string;
  asset: string;
  ticker: string;
  network: Record<string, any>;
  network_icon: string;
  address: string;
  marketCap: string;
  price: string;
  priceChange: string;
  balance: string;
  balanceUSD: string;
  portfolioPercent: string;
  valueUSD: string;
  transactions: Record<string, any>;

  constructor(data: {
    id: string;
    icon: string;
    assetType: string;
    asset: string;
    ticker: string;
    network: Record<string, any>;
    network_icon: string;
    address: string;
    marketCap: string;
    price: string;
    priceChange: string;
    balance: string;
    balanceUSD: string;
    portfolioPercent: string;
    valueUSD: string;
    transactions: Record<string, any>;
  }) {
    this.id = data.id;
    this.icon = data.icon;
    this.assetType = data.assetType;
    this.asset = data.asset;
    this.ticker = data.ticker;
    this.network = data.network;
    this.network_icon = data.network_icon;
    this.address = data.address;
    this.marketCap = data.marketCap;
    this.price = data.price;
    this.priceChange = data.priceChange;
    this.balance = data.balance;
    this.balanceUSD = data.balanceUSD;
    this.portfolioPercent = data.portfolioPercent;
    this.valueUSD = data.valueUSD;
    this.transactions = data.transactions;
  }
}
