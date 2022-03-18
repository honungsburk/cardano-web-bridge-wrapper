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

export function isWebBridgeError(x: any): x is WebBridgeError {
  return x.info && x.stringCode;
}
