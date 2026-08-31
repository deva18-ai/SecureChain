import * as t from "io-ts";
export type RpcTransaction = t.TypeOf<typeof rpcTransaction>;
export declare const rpcTransaction: t.TypeC<{
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
}>;
//# sourceMappingURL=transaction.d.ts.map