## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy (Base mainnet example)

`--broadcast` requires a **real signer**. Without `--private-key` (or a configured account), Forge uses the default anvil sender and exits with:

`Error: You seem to be using Foundry's default sender. Be sure to set your own --sender.`

```shell
export RPC_URL=https://mainnet.base.org
# Use a funded deployer key — never commit it
export PRIVATE_KEY=0x...

forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --private-key "$PRIVATE_KEY" \
  -vvvv
```

Same for `script/DeployCheckIn.s.sol:DeployCheckIn`. Optional: `--sender 0x...` if you use a different signing setup; with `--private-key`, the sender is derived automatically.

**Deployed (Base mainnet, chain 8453):** `CheckIn` at `0x5ddBB86b4B6504BA81598e6B6069dc50d11E7238` — set `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` in the web app to this address.

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
