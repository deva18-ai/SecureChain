import * as t from "io-ts";
export declare const rpcLogAddress: t.UnionC<[t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>, t.ArrayC<t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>>]>;
export type RpcLogAddress = t.TypeOf<typeof rpcLogAddress>;
export declare const optionalRpcLogAddress: t.Type<Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>[] | undefined, Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>[] | undefined, unknown>;
export type OptionalRpcLogAddress = t.TypeOf<typeof optionalRpcLogAddress>;
//# sourceMappingURL=logAddress.d.ts.map