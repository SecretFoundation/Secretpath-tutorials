# Cosmos gRPC

Generates ultralight, tree-shakable TypeScript APIs from the `.proto` files of any blockchain built using the Cosmos-SDK. Intended for use in a Web environment.

Generated code is strongly-typed, self-contained, and dependency-free.

The generated module includes:
 - gRPC REST clients compatible with [Cosmos REST endpoints](https://docs.cosmos.network/v0.45/core/grpc_rest.html#grpc-gateway-rest-routes) (via [gRPC-gateway](https://grpc-ecosystem.github.io/grpc-gateway/))
 - Protobuf message encoders & decoders, including for strongly-typed `google.protobuf.Any` interfaces
 - Positional destructors for the JSON serialization of messages (e.g., those returned by gRPC-gateway)

Some goals for this project include:
 - adding Amino transcoders


## Motivation

Other generated clients use protoc plugins that end up producing extremely bloated code with many unused functions, hefty classes, and poor tree-shakability, leading to large bundles. Part of the reason is due to how those protoc plugins map Messages to classes, support a variety of transports, and import bulky dependencies for encoding/decoding.

This project implements its own ultralight protobuf encoder & decoder, exports every operation as its own ESM function (for optimal tree-shaking), and focusses solely on Cosmos-SDK's gRPC-gateway REST endpoints for transport.


## Using in a project

```shell
yarn add @solar-republic/cosmos-grpc
```


## Contributing
```shell
yarn install
yarn build
```
