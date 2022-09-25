/****************** CIP30 API ****************/

/**
 * As given by the specs in
 * https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030
 *
 *
 */
export type CardanoWallets = {
  [x: string]: InitalAPI<unknown>;
  // nami?: InitalAPI<NamiAPI>
};

/************ Experimental APIs *********/

export type NamiAPI = {
  onAccountChange: (arg0: (addresses: [BaseAddressCBOR]) => void) => Promise<void>;
  onNetworkChange: (arg0: (network: number) => void) => Promise<void>;
  getCollateral(): TransactionUnspentOutputCBOR[];
};

/************ Full API *********/

/**
 * They are all hexencoded bytes strings
 */
export type RewardAddressCBOR = string;
export type BaseAddressCBOR = string;
export type TransactionCBOR = string;
export type hash32 = string;
export type TransactionWitnessSetCBOR = string;
export type ValueCBOR = string;
export type CoinCBOR = string;
export type TransactionUnspentOutputCBOR = string;

export type InitalAPI<T> = {
  enable: () => Promise<EnabledAPI<T>>;
  isEnabled: () => Promise<boolean>;
  apiVersion: string;
  name: string;
  icon: string;
};

export function isInitalAPI(x: any): x is InitalAPI<any> {
  return typeof x.icon === 'string' && typeof x.name === 'string' && typeof x.apiVersion === 'string';
}

export type EnabledAPI<T> = {
  getBalance: () => Promise<ValueCBOR>;
  getUtxos: (
    amount?: ValueCBOR,
    paginate?: { page: number; limit: number },
  ) => Promise<TransactionUnspentOutputCBOR[] | null>;
  getNetworkId: () => Promise<number>;
  getRewardAddress: () => Promise<RewardAddressCBOR>;
  getChangeAddress: () => Promise<BaseAddressCBOR>;
  getUsedAddresses: () => Promise<BaseAddressCBOR[]>;
  getUnusedAddresses: () => Promise<BaseAddressCBOR[]>;
  signTx: (tx: TransactionCBOR, partialSign?: boolean) => Promise<TransactionWitnessSetCBOR>;
  signData: (addr: BaseAddressCBOR, payload: string) => Promise<string>;
  submitTx: (tx: TransactionCBOR) => Promise<hash32>;
  getCollateral: (params: { amount: CoinCBOR }) => Promise<TransactionUnspentOutputCBOR[] | null>;
  experimental: T;
};

/****************** APIError ****************/
export type APIErrorCode = -1 | -2 | -3 | -4;
export type APIError = {
  code: APIErrorCode;
  info: string;
};

export function isApiError(x: any): x is APIError {
  return x.code === -1 || x.code === -2 || x.code === -3 || x.code === -4;
}

/****************** DataSignError ****************/

export type DataSignErrorCode = 1 | 2 | 3 | 4;
export type DataSignError = {
  code: DataSignErrorCode;
  info: string;
};

export function isDataSignError(x: any): x is DataSignError {
  return x.code === 1 || x.code === 2 || x.code === 3 || x.code === 4;
}

/****************** PaginateError ****************/

export type PaginateError = {
  maxSize: number;
};

export function isPaginateError(x: any): x is PaginateError {
  return typeof x.maxSize === 'number';
}

/****************** TxSendError ****************/

export type TxSendErrorCode = 1 | 2;
export type TxSendError = {
  code: TxSendErrorCode;
  info: string;
  message?: string; // Nami does this outside of spec
};

export function isTxSendError(x: any): x is TxSendError {
  return x.code === 1 || x.code === 2;
}

/****************** TxSignError ****************/

export type TxSignErrorCode = 1 | 2;
export type TxSignError = {
  code: TxSignErrorCode;
  info: string;
};

export function isTxSignError(x: any): x is TxSignError {
  return x.code === 1 || x.code === 2;
}
