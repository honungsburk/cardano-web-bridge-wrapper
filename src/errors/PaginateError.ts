import { CustomError } from 'ts-custom-error';
import { WebBridgeError } from './WebBridgeError';

/**
 * NOTE: 'PaginateError' is technically not a valid error code, but it is usefull
 * for pretty error messages.
 *
 * {maxSize} is the maximum size for pagination and if the dApp tries to
 * request pages outside of this boundary this error is thrown.
 */
export class PaginateError extends CustomError implements WebBridgeError {
  maxSize: number;
  info: string;

  public constructor(maxSize: number, info: string) {
    super();
    this.maxSize = maxSize;
    this.info = info;
  }
  stringCode(): string {
    return 'PaginateError';
  }
}
