declare module 'uuid' {
  interface UUIDFunction {
    (): string
  }

  interface UUIDNamespace extends UUIDFunction {
    v1: UUIDFunction
    v2: UUIDFunction
    v3: UUIDFunction
    v4: UUIDFunction
  }
  const uuid: UUIDNamespace

  export = uuid
}