import * as t from "io-ts";
export declare const rpcCallRequest: t.TypeC<{
    from: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    to: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    gas: t.Type<bigint | undefined, bigint | undefined, unknown>;
    gasPrice: t.Type<bigint | undefined, bigint | undefined, unknown>;
    value: t.Type<bigint | undefined, bigint | undefined, unknown>;
    data: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    accessList: t.Type<{
        address: Buffer<ArrayBufferLike>;
        storageKeys: Buffer<ArrayBufferLike>[] | null;
    }[] | undefined, {
        address: Buffer<ArrayBufferLike>;
        storageKeys: Buffer<ArrayBufferLike>[] | null;
    }[] | undefined, unknown>;
    maxFeePerGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
    maxPriorityFeePerGas: t.Type<bigint | undefined, bigint | undefined, unknown>;
    blobs: t.Type<Buffer<ArrayBufferLike>[] | undefined, Buffer<ArrayBufferLike>[] | undefined, unknown>;
    blobVersionedHashes: t.Type<Buffer<ArrayBufferLike>[] | undefined, Buffer<ArrayBufferLike>[] | undefined, unknown>;
}>;
export type RpcCallRequest = t.TypeOf<typeof rpcCallRequest>;
export declare const stateProperties: t.RecordC<t.Type<string, string, unknown>, t.Type<bigint, bigint, unknown>>;
export declare const stateOverrideOptions: t.TypeC<{
    balance: t.Type<bigint | undefined, bigint | undefined, unknown>;
    nonce: t.Type<bigint | undefined, bigint | undefined, unknown>;
    code: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    state: t.Type<{
        [x: string]: bigint;
    } | undefined, {
        [x: string]: bigint;
    } | undefined, unknown>;
    stateDiff: t.Type<{
        [x: string]: bigint;
    } | undefined, {
        [x: string]: bigint;
    } | undefined, unknown>;
}>;
export declare const stateOverrideSet: t.RecordC<t.Type<string, string, unknown>, t.TypeC<{
    balance: t.Type<bigint | undefined, bigint | undefined, unknown>;
    nonce: t.Type<bigint | undefined, bigint | undefined, unknown>;
    code: t.Type<Buffer<ArrayBufferLike> | undefined, Buffer<ArrayBufferLike> | undefined, unknown>;
    state: t.Type<{
        [x: string]: bigint;
    } | undefined, {
        [x: string]: bigint;
    } | undefined, unknown>;
    stateDiff: t.Type<{
        [x: string]: bigint;
    } | undefined, {
        [x: string]: bigint;
    } | undefined, unknown>;
}>>;
export declare const optionalStateOverrideSet: t.Type<{
    [x: string]: {
        balance: bigint | undefined;
        nonce: bigint | undefined;
        code: Buffer<ArrayBufferLike> | undefined;
        state: {
            [x: string]: bigint;
        } | undefined;
        stateDiff: {
            [x: string]: bigint;
        } | undefined;
    };
} | undefined, {
    [x: string]: {
        balance: bigint | undefined;
        nonce: bigint | undefined;
        code: Buffer<ArrayBufferLike> | undefined;
        state: {
            [x: string]: bigint;
        } | undefined;
        stateDiff: {
            [x: string]: bigint;
        } | undefined;
    };
} | undefined, unknown>;
export type StateProperties = t.TypeOf<typeof stateProperties>;
export type StateOverrideOptions = t.TypeOf<typeof stateOverrideOptions>;
export type StateOverrideSet = t.TypeOf<typeof stateOverrideSet>;
export type OptionalStateOverrideSet = t.TypeOf<typeof optionalStateOverrideSet>;
//# sourceMappingURL=callRequest.d.ts.map