import * as t from "io-ts";
export type RpcTransactionReceipt = t.TypeOf<typeof rpcTransactionReceipt>;
export declare const rpcTransactionReceipt: t.TypeC<{
    transactionHash: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    transactionIndex: t.Type<bigint, bigint, unknown>;
    blockHash: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    blockNumber: t.Type<bigint, bigint, unknown>;
    from: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    to: t.Type<Buffer<ArrayBufferLike> | null, Buffer<ArrayBufferLike> | null, unknown>;
    cumulativeGasUsed: t.Type<bigint, bigint, unknown>;
    gasUsed: t.Type<bigint, bigint, unknown>;
    contractAddress: t.Type<Buffer<ArrayBufferLike> | null, Buffer<ArrayBufferLike> | null, unknown>;
    logs: t.ArrayC<t.TypeC<{
        logIndex: t.Type<bigint | null, bigint | null, unknown>;
        transactionIndex: t.Type<bigint | null, bigint | null, unknown>;
        transactionHash: t.Type<Buffer<ArrayBufferLike> | null, Buffer<ArrayBufferLike> | null, unknown>;
        blockHash: t.Type<Buffer<ArrayBufferLike> | null, Buffer<ArrayBufferLike> | null, unknown>;
        blockNumber: t.Type<bigint | null, bigint | null, unknown>;
        address: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
        data: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
        topics: t.ArrayC<t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>>;
    }>>;
    logsBloom: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    status: t.Type<bigint | null | undefined, bigint | null | undefined, unknown>;
    root: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    type: t.Type<bigint | undefined, bigint | undefined, unknown>;
    effectiveGasPrice: t.Type<bigint | undefined, bigint | undefined, unknown>;
}>;
//# sourceMappingURL=receipt.d.ts.map