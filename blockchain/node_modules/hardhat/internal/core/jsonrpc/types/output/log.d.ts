import * as t from "io-ts";
export type RpcLog = t.TypeOf<typeof rpcLog>;
export declare const rpcLog: t.TypeC<{
    logIndex: t.Type<bigint | null, bigint | null, unknown>;
    transactionIndex: t.Type<bigint | null, bigint | null, unknown>;
    transactionHash: t.Type<Buffer<ArrayBufferLike> | null, Buffer<ArrayBufferLike> | null, unknown>;
    blockHash: t.Type<Buffer<ArrayBufferLike> | null, Buffer<ArrayBufferLike> | null, unknown>;
    blockNumber: t.Type<bigint | null, bigint | null, unknown>;
    address: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    data: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    topics: t.ArrayC<t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>>;
}>;
//# sourceMappingURL=log.d.ts.map