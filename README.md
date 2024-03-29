# cardano-web-bridge-wrapper

Convenience wrapper for the [cip30 wallet API](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0030/README.md)

## Why should you use this library?

The library adds three improvements over directly using the injected web bridges:

- Types
- Automatically convert to and from CBOR
- Proper error objects

## CBOR conversion library

You can use any of the available CBOR (de)serialization libraries
[Cardano serialization library](https://www.npmjs.com/package/@emurgo/cardano-serialization-lib-browser)

## Installation

`npm i cardano-web-bridge-wrapper`
