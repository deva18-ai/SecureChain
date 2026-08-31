import * as t from "io-ts";
declare const rpcAuthorizationListTuple: t.TypeC<{
    chainId: t.Type<bigint, bigint, unknown>;
    address: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    nonce: t.Type<bigint, bigint, unknown>;
    yParity: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    r: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    s: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
}>;
export declare const rpcAuthorizationList: t.ArrayC<t.TypeC<{
    chainId: t.Type<bigint, bigint, unknown>;
    address: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    nonce: t.Type<bigint, bigint, unknown>;
    yParity: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    r: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
    s: t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>;
}>>;
export type RpcAuthorizationListTuple = t.TypeOf<typeof rpcAuthorizationListTuple>;
export type RpcAuthorizationList = t.TypeOf<typeof rpcAuthorizationList>;
export {};
//# sourceMappingURL=authorization-list.d.ts.map