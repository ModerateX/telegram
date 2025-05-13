
export interface CreateDIDDocResponse {
  didDoc: DidDoc
  key: Key
}

export interface DidDoc {
  id: string
  controller: string[]
  verificationMethod: VerificationMethod[]
  authentication: string[]
}

export interface VerificationMethod {
  id: string
  type: string
  controller: string
  publicKeyMultibase: string
}

export interface Key {
  kid: string
  publicKeyHex: string
}
