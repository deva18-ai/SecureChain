import * as t from "io-ts";
export declare const rpcTransactionRequest: t.TypeC<{
    from: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    to: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    gas: t.Type<bigint | undefined, bigint | undefined, unknown>;
    gasPrice: t.Type<bigint | undefined, bigint | undefined, unknown>;
    value: t.Type<bigint | undefined, bigint | undefined, unknown>;
    nonce: t.Type<bigint | undefined, bigint | undefined, unknown>;
    data: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    accessList: t.Type<{
        address: Buffer<ArrayBufferLike>;
        storageKeys: Buffer<ArrayBufferLike>[] | null;
    }[] | undefined, {
        address: Buffer<ArrayBufferLike>;
        storageKeys: Buffer<ArrayBufferLike>[] | null;
    }[] | undefined, unknown>;
    chainId: t.Type<bigint | undefined, bigint | undefined, unknown>;
    maxFeePerGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
    maxPriorityFeePerGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
    blobs: t.Type<Buffer<ArrayBufferLike>[] | undefined, Buffer<ArrayBufferLike>[] | undefined, unknown>;
    blobVersionedHashes: t.Type<Buffer<ArrayBufferLike>[] | undefined, Buffer<ArrayBufferLike>[] | undefined, unknown>;
    authorizationList: t.Type<{
        chainId: bigint;
        address: Buffer<ArrayBufferLike>;
        nonce: bigint;
        yParity: Buffer<ArrayBufferLike>;
        r: Buffer<ArrayBufferLike>;
        s: Buffer<ArrayBufferLike>;
    }[] | undefined, {
        chainId: bigint;
        address: Buffer<ArrayBufferLike>;
        nonce: bigint;
        yParity: Buffer<ArrayBufferLike>;
        r: Buffer<ArrayBufferLike>;
        s: Buffer<ArrayBufferLike>;
    }[] | undefined, unknown>;
}>;
export interface RpcTransactionRequestInput {
    from: string;
    to?: string;
    gas?: string;
    gasPrice?: string;
    value?: string;
    nonce?: string;
    data?: string;
    accessList?: Array<{
        address: string;
        storageKeys: string[];
    }>;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    blobs?: string[];
    blobVersionedHashes?: string[];
    authorizationList?: Array<{
        chainId: string;
        address: string;
        nonce: string;
        yParity: string;
        r: string;
        s: string;
    }>;
}
export type RpcTransactionRequest = t.TypeOf<typeof rpcTransactionRequest>;
//# sourceMappingURL=transactionRequest.d.ts.map