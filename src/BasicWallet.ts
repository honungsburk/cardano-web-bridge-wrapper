import { Wallet } from './Wallet';
import * as CardanoSerializationLib from '@emurgo/cardano-serialization-lib-nodejs';
import * as CIP30 from './CIP30';

export class BasicWallet extends Wallet<unknown, undefined> {
  /**
   * Build a basic wallet without any experimental API:s
   *
   * You must also provide it the serialization library
   * https://www.npmjs.com/package/@emurgo/cardano-serialization-lib-browser
   *
   * @param {CIP30.InitalAPI<unknown>} initAPI      inital API injected into window.cardano
   * @param {CIP30.EnabledAPI<unknown>} enabledAPI  the enabled API retrieved from the initital API
   * @param {CardanoSerializationLib} lib           the serialization lib (wasm or asmjs)
   */
  constructor(
    initAPI: CIP30.InitalAPI<unknown>,
    enabledAPI: CIP30.EnabledAPI<unknown>,
    lib: typeof CardanoSerializationLib,
  ) {
    super(initAPI, enabledAPI, () => undefined, lib);
  }
}
