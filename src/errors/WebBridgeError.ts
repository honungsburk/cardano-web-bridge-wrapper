import { CustomError } from 'ts-custom-error';

export interface WebBridgeError {
  /**
   * The string representation of the error code
   */
  stringCode(): string;
  /**
   * Info string describing the error that occurred
   */
  info: string;
}
