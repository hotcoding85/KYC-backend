//------------------------------------User role-------------
export enum ROLE {
  SUPER_ADMINISTRATOR = 'SUPER_ADMINISTRATOR',
  SUPER_USER = 'SUPER_USER',
  COMPANY_ADMINISTRATOR = 'COMPANY_ADMINISTRATOR',
  COMPANY_USER = 'COMPANY_USER',
  END_USER = 'END_USER',
}
//ONLY 1 SUPER ADMIN 

//------------------------------------Company Account Type-------------
export enum COMPANY_ACCOUNT_TYPE {
  HOLDING = 'HOLDING',
  WEB3 = 'WEB3',
  BANKING = 'BANKING',
}

//------------------------------------Assets-------------
export enum ASSET_TYPE {
  NFT = 'NFT',
  TOKEN = 'TOKEN',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  FIAT = 'FIAT',
}

export enum EOA_SCHEDULE {
  Daily = 'Daily',
  GasPrice = 'GasPrice'
}

//------------------------------------Card-------------
export enum CARD_TYPE {
  VIRTUAL = 'VIRTUAL',
  PHYSICAL = 'PHYSICAL'
}

//------------------------------------Node-------------
export enum NODE_NETWORK_TYPE {
  MAIN_NET = 'MAIN_NET',
  TEST_NET = 'TEST_NET',
}
//-----------------------------------------------------

//--------------------------------Fee Scheme--------------
export enum FEE_SCHEME_ACTIVITY {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  BUY = 'BUY',
  SELL = 'SELL',
  EXCHANGE = 'EXCHANGE',
}

export enum FEE_SCHEME_FEE_TYPE {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
}

export enum FEE_SCHEME_GAS_PRICE_TYPE {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
}

export enum FEE_SCHEME_CRITERIA_TYPE {
  AMOUNT = 'AMOUNT',
  DATE = 'DATE',
  DAY = 'DAY',
  COUNTRY = 'COUNTRY',
}

export enum FEE_SCHEME_CRITERIA_COMPARASION {
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
  EQUALS = 'EQUALS',
  GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL',
  LESS_THAN_EUQAL = 'LESS_THAN_EUQAL'
}
//----------------------------------------------------------

export enum VENDOR_TYPE {
  LIQUIDITY = 'LIQUIDITY',
  ACCOUNT = 'ACCOUNT',
}
