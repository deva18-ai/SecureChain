import * as t from "io-ts";
export type RpcBlock = t.TypeOf<typeof rpcBlock>;
export declare const rpcBlock: t.TypeC<{
    transactions: t.ArrayC<t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>>;
    number: t.Type<bigint | null, bigint | null, unknown>;
    hash: t.Type<Buffer<ArrayBufferLike> | null, Buffer<ArrayBufferLike> | null, unknown>;
    parentHash: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    nonce: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    sha3Uncles: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    logsBloom: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    transactionsRoot: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    stateRoot: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    receiptsRoot: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    miner: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    difficulty: t.Type<bigint, bigint, unknown>;
    totalDifficulty: t.Type<bigint | undefined, bigint | undefined, unknown>;
    extraData: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    size: t.Type<bigint, bigint, unknown>;
    gasLimit: t.Type<bigint, bigint, unknown>;
    gasUsed: t.Type<bigint, bigint, unknown>;
    timestamp: t.Type<bigint, bigint, unknown>;
    uncles: t.ArrayC<t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>>;
    mixHash: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    baseFeePerGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
    withdrawals: t.Type<{
        index: bigint;
        validatorIndex: bigint;
        address: Buffer<ArrayBufferLike>;
        amount: bigint;
    }[] | undefined, {
        index: bigint;
        validatorIndex: bigint;
        address: Buffer<ArrayBufferLike>;
        amount: bigint;
    }[] | undefined, unknown>;
    withdrawalsRoot: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    parentBeaconBlockRoot: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    blobGasUsed: t.Type<bigint | undefined, bigint | undefined, unknown>;
    excessBlobGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
}>;
export type RpcBlockWithTransactions = t.TypeOf<typeof rpcBlockWithTransactions>;
export declare const rpcBlockWithTransactions: t.TypeC<{
    transactions: t.ArrayC<t.TypeC<{
        blockHash: t.Type<Buffer<ArrayBufferLike> | null, Buffer<ArrayBufferLike> | null, unknown>;
        blockNumber: t.Type<bigint | null, bigint | null, unknown>;
        from: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
        gas: t.Type<bigint, bigint, unknown>;
        gasPrice: t.Type<bigint, bigint, unknown>;
        hash: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
        input: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
        nonce: t.Type<bigint, bigint, unknown>;
        to: t.Type<Buffer<ArrayBufferLike> | null | undefined, Buffer<ArrayBufferLike> | null | undefined, unknown>;
        transactionIndex: t.Type<bigint | null, bigint | null, unknown>;
        value: t.Type<bigint, bigint, unknown>;
        v: t.Type<bigint, bigint, unknown>;
        r: t.Type<bigint, bigint, unknown>;
        s: t.Type<bigint, bigint, unknown>;
        type: t.Type<bigint | undefined, bigint | undefined, unknown>;
        chainId: t.Type<bigint | null | undefined, bigint | null | undefined, unknown>;
        accessList: t.Type<{
            address: Buffer<ArrayBufferLike>;
            storageKeys: Buffer<ArrayBufferLike>[] | null;
        }[] | undefined, {
            address: Buffer<ArrayBufferLike>;
            storageKeys: Buffer<ArrayBufferLike>[] | null;
        }[] | undefined, unknown>;
        maxFeePerGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
        maxPriorityFeePerGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
    }>>;
    number: t.Type<bigint | null, bigint | null, unknown>;
    hash: t.Type<Buffer<ArrayBufferLike> | null, Buffer<ArrayBufferLike> | null, unknown>;
    parentHash: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    nonce: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    sha3Uncles: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    logsBloom: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    transactionsRoot: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    stateRoot: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    receiptsRoot: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    miner: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    difficulty: t.Type<bigint, bigint, unknown>;
    totalDifficulty: t.Type<bigint | undefined, bigint | undefined, unknown>;
    extraData: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    size: t.Type<bigint, bigint, unknown>;
    gasLimit: t.Type<bigint, bigint, unknown>;
    gasUsed: t.Type<bigint, bigint, unknown>;
    timestamp: t.Type<bigint, bigint, unknown>;
    uncles: t.ArrayC<t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>>;
    mixHash: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    baseFeePerGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
    withdrawals: t.Type<{
        index: bigint;
        validatorIndex: bigint;
        address: Buffer<ArrayBufferLike>;
        amount: bigint;
    }[] | undefined, {
        index: bigint;
        validatorIndex: bigint;
        address: Buffer<ArrayBufferLike>;
        amount: bigint;
    }[] | undefined, unknown>;
    withdrawalsRoot: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    parentBeaconBlockRoot: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    blobGasUsed: t.Type<bigint | undefined, bigint | undefined, unknown>;
    excessBlobGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
}>;
//# sourceMappingURL=block.d.ts.map