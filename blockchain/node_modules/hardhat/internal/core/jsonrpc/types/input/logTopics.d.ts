import * as t from "io-ts";
export declare const rpcLogTopics: t.ArrayC<t.UnionC<[t.NullC, t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>, t.ArrayC<t.UnionC<[t.NullC, t.Type<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>, unknown>]>>]>>;
export type RpcLogTopics = t.TypeOf<typeof rpcLogTopics>;
export declare const optionalRpcLogTopics: t.Type<(Buffer<ArrayBufferLike> | (Buffer<ArrayBufferLike> | null)[] | null)[] | undefined, (Buffer<ArrayBufferLike> | (Buffer<ArrayBufferLike> | null)[] | null)[] | undefined, unknown>;
export type OptionalRpcLogTopics = t.TypeOf<typeof optionalRpcLogTopics>;
//# sourceMappingURL=logTopics.d.ts.map