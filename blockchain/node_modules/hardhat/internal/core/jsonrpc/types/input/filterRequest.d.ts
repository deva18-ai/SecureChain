import * as t from "io-ts";
export declare const rpcFilterRequest: t.TypeC<{
    fromBlock: t.Type<bigint | "pending" | "latest" | "earliest" | "safe" | "finalized" | undefined, bigint | "pending" | "latest" | "earliest" | "safe" | "finalized" | undefined, unknown>;
    toBlock: t.Type<bigint | "pending" | "latest" | "earliest" | "safe" | "finalized" | undefined, bigint | "pending" | "latest" | "earliest" | "safe" | "finalized" | undefined, unknown>;
    address: t.Type<Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>[] | undefined, Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>[] | undefined, unknown>;
    topics: t.Type<(Buffer<ArrayBufferLike> | (Buffer<ArrayBufferLike> | null)[] | null)[] | undefined, (Buffer<ArrayBufferLike> | (Buffer<ArrayBufferLike> | null)[] | null)[] | undefined, unknown>;
    blockHash: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
}>;
export type RpcFilterRequest = t.TypeOf<typeof rpcFilterRequest>;
export declare const optionalRpcFilterRequest: t.Type<{
    fromBlock: bigint | "pending" | "latest" | "earliest" | "safe" | "finalized" | undefined;
    toBlock: bigint | "pending" | "latest" | "earliest" | "safe" | "finalized" | undefined;
    address: Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>[] | undefined;
    topics: (Buffer<ArrayBufferLike> | (Buffer<ArrayBufferLike> | null)[] | null)[] | undefined;
    blockHash: Buffer<ArrayBufferLike> | undefined;
} | undefined, {
    fromBlock: bigint | "pending" | "latest" | "earliest" | "safe" | "finalized" | undefined;
    toBlock: bigint | "pending" | "latest" | "earliest" | "safe" | "finalized" | undefined;
    address: Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>[] | undefined;
    topics: (Buffer<ArrayBufferLike> | (Buffer<ArrayBufferLike> | null)[] | null)[] | undefined;
    blockHash: Buffer<ArrayBufferLike> | undefined;
} | undefined, unknown>;
export type OptionalRpcFilterRequest = t.TypeOf<typeof optionalRpcFilterRequest>;
//# sourceMappingURL=filterRequest.d.ts.map