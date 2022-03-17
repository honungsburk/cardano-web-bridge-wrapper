import { BasicWallet } from "../BasicWallet"
import {
  Address,
  AssetName,
  BigNum,
  ScriptHash,
  TransactionBody,
  Value,
  RewardAddress,
  StakeCredential,
  TransactionWitnessSet,
  Transaction,
} from "@emurgo/cardano-serialization-lib-nodejs";
import { Buffer } from "buffer";
import * as lib from "@emurgo/cardano-serialization-lib-nodejs";
import * as CIP30 from "../CIP30"
import * as Errors from "../errors"

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

function fakeWalletEnableAPI(): CIP30.EnabledAPI<undefined>{
  return {
    getBalance: async () => "",
    getUtxos: async () => [],
    getNetworkId: async () => 0,
    getRewardAddress: async () => "",
    getChangeAddress: async () => "",
    getUsedAddresses: async () => [],
    getUnusedAddresses: async () => [],
    signTx: async () => "",
    signData: async () => "",
    submitTx: async () => "",
    experimental: undefined,
  }
}


function fakeWalletInitalAPI<T>(fullAPI: CIP30.EnabledAPI<T>): CIP30.InitalAPI<T> {
  return {
    enable: async () => fullAPI,
    isEnabled: async () => true,
    apiVersion: "0.1.0",
    name: "Fake Wallet",
    icon: "not an actual image",
  }
}

function createWallet(fn: (api: CIP30.EnabledAPI<undefined>) => void): BasicWallet{
  const walletEnabledAPI = fakeWalletEnableAPI()
  fn(walletEnabledAPI)
  const walletInitialAPI = fakeWalletInitalAPI(walletEnabledAPI)
  return new BasicWallet(walletInitialAPI, walletEnabledAPI, lib)
}

////////////////////////////////////////////////////////////////////////////////
// getNetworkId
////////////////////////////////////////////////////////////////////////////////

test('getNetworkId when on mainnet', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getNetworkId = async () => 1
  })
  const id = await wallet.getNetworkId()
  expect(id).toBe("Mainnet");
});

test('getNetworkId when on testnet', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getNetworkId = async () => 0
  })
  const id = await wallet.getNetworkId()
  expect(id).toBe("Testnet");
});

test('getNetworkId handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getNetworkId = async () => {
      throw apiError
    }
  })

  try {
    await wallet.getNetworkId()
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});

////////////////////////////////////////////////////////////////////////////////
// getBalance
////////////////////////////////////////////////////////////////////////////////

test('getBalance with empty value', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getBalance = async () => toHex(Value.zero().to_bytes())
  })
  const value = await wallet.getBalance()
  expect(value.compare(Value.zero())).toBe(0);
});

test('getBalance handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getBalance = async () => {
      throw apiError
    }
  })

  try {
    await wallet.getBalance()
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});


////////////////////////////////////////////////////////////////////////////////
// getUtxos
////////////////////////////////////////////////////////////////////////////////

test('getUtxos with no utxos', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getUtxos = async () => []
  })
  const utxos = await wallet.getUtxos()
  expect(utxos.length).toBe(0);
});

test('getUtxos with no utxo', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getUtxos = async () => [toHex(mkUtxo(1, Value.new(BigNum.from_str("1000000"))).to_bytes())]
  })
  const utxos = await wallet.getUtxos()
  expect(utxos.length).toBe(1);
});

test('getUtxos handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getUtxos = async () => {
      throw apiError
    }
  })

  try {
    await wallet.getUtxos()
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});


////////////////////////////////////////////////////////////////////////////////
// getChangeAddress
////////////////////////////////////////////////////////////////////////////////

test('getChangeAddress can handle address', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getChangeAddress = async () => toHex(mkAddress(0).to_bytes())
  })
  const address = await wallet.getChangeAddress()
  expect(address !== undefined).toBe(true);
});

test('getChangeAddress handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getChangeAddress = async () => {
      throw apiError
    }
  })

  try {
    await wallet.getChangeAddress()
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});

////////////////////////////////////////////////////////////////////////////////
// getUsedAddresses
////////////////////////////////////////////////////////////////////////////////

test('getUsedAddresses can handle address', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getUsedAddresses = async () => [toHex(mkAddress(0).to_bytes())]
  })
  const addresses = await wallet.getUsedAddresses()
  expect(addresses.length).toBe(1);
});

test('getUsedAddresses handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getUsedAddresses = async () => {
      throw apiError
    }
  })

  try {
    await wallet.getUsedAddresses()
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});


////////////////////////////////////////////////////////////////////////////////
// getUnusedAddresses
////////////////////////////////////////////////////////////////////////////////

test('getUnusedAddresses can handle address', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getUnusedAddresses = async () => [toHex(mkAddress(0).to_bytes())]
  })
  const addresses = await wallet.getUnusedAddresses()
  expect(addresses.length).toBe(1);
});

test('getUnusedAddresses handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getUnusedAddresses = async () => {
      throw apiError
    }
  })

  try {
    await wallet.getUnusedAddresses()
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});


////////////////////////////////////////////////////////////////////////////////
// getRewardAddress
////////////////////////////////////////////////////////////////////////////////

test('getRewardAddress can handle address', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getRewardAddress = async () => toHex(RewardAddress.new(0, StakeCredential.from_scripthash(mkScriptHash(1))).to_address().to_bytes())
  })
  const address = await wallet.getRewardAddress()
  expect(address !== undefined).toBe(true);
});

test('getRewardAddress handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.getRewardAddress = async () => {
      throw apiError
    }
  })

  try {
    await wallet.getRewardAddress()
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});


////////////////////////////////////////////////////////////////////////////////
// signTx
////////////////////////////////////////////////////////////////////////////////



test('signTx can handle address', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.signTx = async () => toHex(TransactionWitnessSet.new().to_bytes())
  })
  const witnessSet = await wallet.signTx(emptyTransaction())
  expect(witnessSet !== undefined).toBe(true);
});

test('signTx handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.signTx = async () => {
      throw apiError
    }
  })

  try {
    await wallet.signTx(emptyTransaction())
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});


test('signTx handles APIError', async () => {
  const apiError: CIP30.TxSignError = {
    code: 1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.signTx = async () => {
      throw apiError
    }
  })

  try {
    await wallet.signTx(emptyTransaction())
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.TxSignError)
  }
});

////////////////////////////////////////////////////////////////////////////////
// submitTx
////////////////////////////////////////////////////////////////////////////////

test('submitTx can handle address', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.submitTx = async () => "this is a fake string"
  })
  const fakehash = await wallet.submitTx(emptyTransaction())
  expect(fakehash !== undefined).toBe(true);
});

test('submitTx handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.submitTx = async () => {
      throw apiError
    }
  })

  try {
    await wallet.submitTx(emptyTransaction())
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});

test('submitTx handles APIError', async () => {
  const apiError: CIP30.TxSendError = {
    code: 1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.submitTx = async () => {
      throw apiError
    }
  })

  try {
    await wallet.submitTx(emptyTransaction())
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.TxSendError)
  }
});


////////////////////////////////////////////////////////////////////////////////
// signData
////////////////////////////////////////////////////////////////////////////////

test('signData can getting the signed data', async () => {
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.signData = async () => "this is some fake signed data"
  })
  const fakeSignedData = await wallet.signData(mkAddress(0), "this is some fake to be signed data")
  expect(fakeSignedData !== undefined).toBe(true);
});

test('signData handles APIError', async () => {
  const apiError: CIP30.APIError = {
    code: -1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.signData = async () => {
      throw apiError
    }
  })

  try {
    await wallet.signData(mkAddress(0), "this is some fake to be signed data")
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.APIError)
  }
});

test('signData handles APIError', async () => {
  const apiError: CIP30.DataSignError = {
    code: 1,
    info: "Test error"
  }
  const wallet = createWallet(walletEnabledAPI => {
    walletEnabledAPI.signData = async () => {
      throw apiError
    }
  })

  try {
    await wallet.signData(mkAddress(0), "this is some fake to be signed data")
    expect(false).toBe(true)
  } catch(err){
    expect(err).toBeInstanceOf(Errors.DataSignError)
  }
});

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

function emptyTransaction(): Transaction {
  return Transaction.new(mkEmptyTxBody(), TransactionWitnessSet.new())
}

/**
 *
 * @param {UInt8Array} s
 * @returns Decoded as a string
 */
 export function toHex(s: Uint8Array): string {
  return Buffer.from(s).toString("hex");
}

/**
 *
 * @param {string} s
 * @returns string
 */
 export function hexEncode(s: string): string {
  return Buffer.from(s).toString("hex");
}

export const toAssetName = (hexString: string) => {
    const assetName: Uint8Array = Uint8Array.from(
      Buffer.from(hexString, "hex")
    );
    return lib.AssetName.new(assetName);
  };


/**
 *
 * @param scriptNumber the "identifier" of the script
 * @returns a scripthash
 */
export const mkScriptHash = (scriptNumber: number) => {
    const script = lib.NativeScript.new_timelock_start(
      lib.TimelockStart.new(scriptNumber)
    ).hash(0);
    return lib.ScriptHash.from_bech32(script.to_bech32("script"));
  };

/**
 *
 * @param name the name of the asset
 * @returns
 */
export const mkAssetName = (name: string) => {
    return toAssetName(hexEncode(name));
  };

export function mkEmptyTxBody(): TransactionBody {
  const inputs = lib.TransactionInputs.new();
  const outputs = lib.TransactionOutputs.new();
  const fee = lib.BigNum.from_str("1000000");
  return lib.TransactionBody.new(inputs, outputs, fee);
}

/**
 *
 * @param index the index of the address to choose (1-10)
 * @returns an address
 */
export const mkAddress =
  (index = 0) => {
    const addresses = [
      "addr1q93tlhhe36k036324sdknm37g5dwnqrus3ys0ag7sxu0svy9cd647v42hwf5vsl0xmevqmsc4s3j3g0g2xte63ewc6qqtsqgll",
      "addr1q9320pzskwdlrz0wys9y90rmc00feumgxf4acq78rea0fdcgp26p574gwne5twv7e0p2nl863qt3vuyge0nu4tv4hgusgrchfy",
      "addr1q9rld6p4r0d2sg4t79faxyevudpxr3y3dvccr3uy5pymy4a725au6rywrnmnfk4fk8t0hmggz02r7upt42p9hprywxfsx8fzdg",
      "addr1q9lsgyjgunk86hp8p6w20fcnarh8a72xj70479h2a2lqxceh8cy3w9x486seavjf2h9xnulhwdnwa59654tmhm4gc5us09xeyt",
      "addr1qxsx929sx2h7yau7nnjw9lc8zty2lwl7z09jyj0z75eqw5u4s8cut0e2umzxkqfh7mt72uysc5nw30k52d80hj9dg2qqnumugg",
      "addr1q925vdz23wuh0hgl5m8jdzs0l9u5ppna4p86e3wmm4gse006f7m938xmjas2z63qetyhx3uk3zgly5825t48srmzt7gsn7dwfx",
      "addr1qxww7y0zelpst3u4ndzxuje6xvdgjg4hfxm8733krtgxv4083nr6rhgplqw5fw7pcj98dllawqtve4svyf3dgm57d6yqyx2td3",
      "addr1q94exnkdj95z5zl9w8wn304jlha7p7chkus988xt83axhdscdmzpkuej93ykh2upm8ua6xpa806zxsu7jcjmm7u9uw9sefurqe",
      "addr1qxsekzsh3wf4snmw5zr3svlk33qdsq6mej64jct4wrexhv6477fjatjdvw865ws473gqndexeca7gwwudepa03qhk62qe8lj7c",
      "addr1q8nyh27fgptgmwwpe8hvggw4s7hq8j7xefzjtwepexpz3cenpc68y8azuns9c9apv33pfjfd957r5vg4l9uy854n22zq9khz0x",
    ];

    return lib.Address.from_bech32(addresses[index]);
  };

export type SimpleNativeAssets = {
  hash: ScriptHash;
  assets: { assetName: AssetName; amount: BigNum }[];
}[];

export const mkValue =
  (ada: BigNum, nativeAssets: SimpleNativeAssets) => {
    const value = lib.Value.new(ada);
    const mulAssets = lib.MultiAsset.new();
    nativeAssets.forEach((asset) => {
      const assets = lib.Assets.new();
      asset.assets.forEach((namedAsset) =>
        assets.insert(namedAsset.assetName, namedAsset.amount)
      );
      mulAssets.insert(asset.hash, assets);
    });
    value.set_multiasset(mulAssets);
    return value;
  };

export const mkUtxo =
  (
    id: number,
    value: Value,
    address: Address = lib.Address.from_bech32(
      "addr1qxpyd7ysyec5x886p59mwzghj565z6pp4neur6rrdfq4jt248zrr9fdwgehqh6nxx9y5svnghj4385m04cd5w64wxycslr5396"
    )
  ) => {
    const txHash = lib.hash_transaction(mkEmptyTxBody());
    const input = lib.TransactionInput.new(txHash, id);
    const output = lib.TransactionOutput.new(address, value);
    return lib.TransactionUnspentOutput.new(input, output);
  };
