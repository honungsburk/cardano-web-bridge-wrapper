import type {
  TransactionWitnessSet,
  TransactionUnspentOutput,
  Value,
  BaseAddress,
  RewardAddress,
  Transaction,
  Address,
} from '@emurgo/cardano-serialization-lib-nodejs';
import * as CardanoSerializationLib from '@emurgo/cardano-serialization-lib-nodejs';
import * as CIP30 from './CIP30';
import * as Errors from './errors';
import { CustomError } from 'ts-custom-error';

import { Buffer } from 'buffer';

export type NetworkID = 'Mainnet' | 'Testnet';

export class Wallet<T, W> {
  private initAPI: CIP30.InitalAPI<T>;
  private enabledAPI: CIP30.EnabledAPI<T>;
  private _experimental: W;
  private lib: typeof CardanoSerializationLib;

  constructor(
    initAPI: CIP30.InitalAPI<T>,
    enabledAPI: CIP30.EnabledAPI<T>,
    experimentalWrapperBuilder: (ex: T) => W,
    lib: typeof CardanoSerializationLib,
  ) {
    this.lib = lib;
    this.initAPI = initAPI;
    this.enabledAPI = enabledAPI;
    this._experimental = experimentalWrapperBuilder(enabledAPI.experimental);
  }

  /**
   * Get the experimental API fro this wallet
   */
  experimental(): W {
    return this._experimental;
  }

  /**
   * The version number of the API that the wallet supports.
   */
  apiVersion(): string {
    return this.initAPI.apiVersion;
  }

  /**
   * A URI image (e.g. data URI base64 or other) for img src for the wallet which
   * can be used inside of the dApp for the purpose of asking the user which
   * wallet they would like to connect with.
   */
  name(): string {
    return this.initAPI.name;
  }

  /**
   * A URI image.
   */
  icon(): string {
    return this.initAPI.icon;
  }

  /**
   * Will ask the user to give access to requested website. If access is given, this function will return true,
   * otherwise throws an error. If the user calls this function again with already having permission to the
   * requested website, it will simply return true.
   *
   * Errors: APIError | UnknownError
   *
   * @returns a Cip30FullAPI
   */
  async enable(): Promise<CIP30.EnabledAPI<T>> {
    return this.enabledAPI;
  }

  /**
   * Returns true if wallet has access to requested website, false otherwise.
   *
   * Errors: APIError | UnknownError
   *
   * @returns a boolean
   */
  async isEnabled(): Promise<boolean> {
    try {
      const val = await this.initAPI.isEnabled();
      return val;
    } catch (err: any) {
      throw firstDefinedWithDefault([toAPIError(err)], err);
    }
  }

  /**
   * Returns 0 if on testnet, otherwise 1 if on mainnet.
   *
   * Errors: APIError | UnknownError
   *
   * @returns
   */
  async getNetworkId(): Promise<NetworkID> {
    try {
      const netID = await this.enabledAPI.getNetworkId();
      return netID === 1 ? 'Mainnet' : 'Testnet';
    } catch (err: any) {
      throw firstDefinedWithDefault([toAPIError(err)], err);
    }
  }

  /**
   * Errors: APIError | UnknownError
   *
   * Get the total balance of the wallet.
   */
  async getBalance(): Promise<Value> {
    try {
      const valueCBOR: CIP30.ValueCBOR = await this.enabledAPI.getBalance();
      const value: Value = this.lib.Value.from_bytes(Buffer.from(valueCBOR, 'hex'));
      return value;
    } catch (err: any) {
      throw firstDefinedWithDefault([toAPIError(err)], err);
    }
  }

  /**
   * Amount and paginate are optional parameters.
   * They are meant to filter the overall utxo set of a user's wallet.
   *
   * Errors: UnknownError | APIError | CIP30.PaginateError
   *
   * @param amount the total value of all the assets all the utxos must be over
   * @param paginate
   */
  async getUtxos(amount?: Value, paginate?: { page: number; limit: number }): Promise<TransactionUnspentOutput[]> {
    try {
      let amountCBOR: CIP30.ValueCBOR | undefined;
      if (amount) {
        amountCBOR = Buffer.from(amount.to_bytes()).toString('hex');
      }
      const utxos: CIP30.TransactionUnspentOutputCBOR[] = await this.enabledAPI.getUtxos(amountCBOR, paginate);
      const parsedUtxos = utxos.map((utxoCBOR) => {
        const utxo: TransactionUnspentOutput = this.lib.TransactionUnspentOutput.from_bytes(
          Buffer.from(utxoCBOR, 'hex'),
        );
        return utxo;
      });
      return parsedUtxos;
    } catch (err: any) {
      throw firstDefinedWithDefault([toAPIError(err), toPaginateError(err)], err);
    }
  }

  /**
   *
   * Erros: APIError | UnknownError | WalletWrapperError
   *
   * @returns The address to which we should return any change
   */
  async getChangeAddress(): Promise<BaseAddress> {
    try {
      const CBORAddress = await this.enabledAPI.getChangeAddress();
      const changeAddress: Address = this.lib.Address.from_bytes(Buffer.from(CBORAddress, 'hex'));
      const baseAddress = this.lib.BaseAddress.from_address(changeAddress);

      if (baseAddress) {
        return baseAddress;
      } else {
        throw new Error('Could not parse the change address');
      }
    } catch (err: any) {
      throw firstDefinedWithDefault([toAPIError(err)], err);
    }
  }

  /**
   * Erros: APIError | UnknownError
   *
   * @returns All address that this wallet has used
   */
  async getUsedAddresses(): Promise<BaseAddress[]> {
    try {
      const usedAddresses = await this.enabledAPI.getUsedAddresses();
      const values = usedAddresses
        .map((CBORAddress) => {
          const address: Address = this.lib.Address.from_bytes(Buffer.from(CBORAddress, 'hex'));
          return this.lib.BaseAddress.from_address(address);
        })
        .filter((v) => v !== undefined);

      return values as BaseAddress[];
    } catch (err) {
      throw firstDefinedWithDefault([toAPIError(err)], err);
    }
  }

  /**
   * Erros: APIError | UnknownError
   *
   * @returns All address that this wallet has not used
   */
  async getUnusedAddresses(): Promise<BaseAddress[]> {
    try {
      const usedAddresses = await this.enabledAPI.getUnusedAddresses();
      const values = usedAddresses
        .map((CBORAddress) => {
          const address: Address = this.lib.Address.from_bytes(Buffer.from(CBORAddress, 'hex'));
          return this.lib.BaseAddress.from_address(address);
        })
        .filter((v) => v !== undefined);

      return values as BaseAddress[];
    } catch (err) {
      throw firstDefinedWithDefault([toAPIError(err)], err);
    }
  }

  /**
   *
   * @returns the reward address
   */
  async getRewardAddress(): Promise<RewardAddress> {
    try {
      const rewardAddressCBOR = await this.enabledAPI.getRewardAddress();
      const address: Address = this.lib.Address.from_bytes(Buffer.from(rewardAddressCBOR, 'hex'));
      const rewardAddress: RewardAddress | undefined = this.lib.RewardAddress.from_address(address);

      if (rewardAddress) {
        return rewardAddress;
      } else {
        throw new Error('Could not parse the reward address');
      }
    } catch (err) {
      throw firstDefinedWithDefault([toAPIError(err)], err);
    }
  }

  /**
   *
   * @param tx the transaction to be signed
   * @param partialSign weather or not all signatures must be provided by the wallet
   * @returns
   */
  async signTx(tx: Transaction, partialSign?: boolean): Promise<TransactionWitnessSet> {
    const CBORTx: string = Buffer.from(tx.to_bytes()).toString('hex');
    try {
      const txWitnessSetCBOR: CIP30.TransactionWitnessSetCBOR = await this.enabledAPI.signTx(CBORTx, partialSign);
      const txWitnessSet: TransactionWitnessSet = this.lib.TransactionWitnessSet.from_bytes(
        Buffer.from(txWitnessSetCBOR, 'hex'),
      );
      return txWitnessSet;
    } catch (err) {
      throw firstDefinedWithDefault([toAPIError(err), toSignError(err)], err);
    }
  }

  /**
   * NOTE: The string that is returned is CBOR string and not an object. I have
   * not used this endpoint in any of my own projects so I took the simplest
   * approach.
   *
   * Errors: APIError, DataSignError
   *
   * @param addr the address (pubkey) used to sign the payload
   * @param payload the payload to be signed
   * @returns the signed CBOR
   */
  async signData(addr: Address, payload: string): Promise<string> {
    const addressCBOR: string = Buffer.from(addr.to_bytes()).toString('hex');
    try {
      return await this.enabledAPI.signData(addressCBOR, payload);
    } catch (err) {
      throw firstDefinedWithDefault([toAPIError(err), toDataSignError(err)], err);
    }
  }

  /**
   *
   * Errors: APIError, TxSendError
   *
   * @param tx the transaction to submit
   * @returns
   */
  async submitTx(tx: Transaction): Promise<CIP30.hash32> {
    const CBORTx: string = Buffer.from(tx.to_bytes()).toString('hex');
    try {
      return await this.enabledAPI.submitTx(CBORTx);
    } catch (err) {
      throw firstDefinedWithDefault([toAPIError(err), toTxSendError(err)], err);
    }
  }
}

function firstDefinedWithDefault<A, B>(values: A[], or: B): A | B {
  for (const val of values) {
    if (val) {
      return val;
    }
  }

  return or;
}

/****************** APIError ****************/

function toAPIError(err: any): Errors.APIError | undefined {
  if (CIP30.isApiError(err)) {
    return new Errors.APIError(err.code, err.info);
  } else {
    return undefined;
  }
}

/****************** PaginateError ****************/

function toPaginateError(err: any): Errors.PaginateError | undefined {
  if (CIP30.isPaginateError(err)) {
    return new Errors.PaginateError(err.maxSize, '');
  } else {
    return undefined;
  }
}

/****************** DataSignError ****************/

function toDataSignError(err: any): Errors.DataSignError | undefined {
  if (CIP30.isDataSignError(err)) {
    return new Errors.DataSignError(err.code, err.info);
  } else {
    return undefined;
  }
}

/****************** TxSendError ****************/

function toTxSendError(err: any): Errors.TxSendError | undefined {
  if (CIP30.isTxSendError(err)) {
    return new Errors.TxSendError(err.code, err.message !== undefined ? err.message : err.info);
  } else {
    return undefined;
  }
}

/****************** TxSignError ****************/

export function toSignError(err: any): Errors.TxSignError | undefined {
  if (CIP30.isTxSignError(err)) {
    return new Errors.TxSignError(err.code, err.info);
  } else {
    return undefined;
  }
}
