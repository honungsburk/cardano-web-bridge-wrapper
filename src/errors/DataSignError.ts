import { CustomError } from 'ts-custom-error';
import { WebBridgeError } from './WebBridgeError';

/**
 * - ProofGeneration - Wallet could not sign the data (e.g. does not have the secret key associated with the address)
 * - AddressNotPK - Address was not a P2PK address and thus had no SK associated with it.
 * - UserDeclined - User declined to sign the data
 * - InvalidFormat - If a wallet enforces data format requirements, this error signifies that
 * the data did not conform to valid formats.
 *
 * NOTE: I cna not find "InvalidFormat" in the spec but it might be used by some
 * wallets so I will not remove it until I'm sur eit is not used.
 */
export enum DataSignErrorCode {
  ProofGeneration = 1,
  AddressNotPK = 2,
  UserDeclined = 3,
  InvalidFormat = 4,
}
export class DataSignError extends CustomError implements WebBridgeError {
  code: DataSignErrorCode;
  info: string;

  public constructor(code: DataSignErrorCode, info: string) {
    super();
    this.code = code;
    this.info = info;
  }
  stringCode(): string {
    return DataSignErrorCode[this.code];
  }
}
