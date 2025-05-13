export interface CreateCredentialPayload {
  issuerDid: string
  subjectDid: string
  groupId: string
  userId: string
}


export interface Credential {
  credentialSubject: CredentialSubject
  issuer: Issuer
  type: string[]
  credentialStatus: CredentialStatus
  "@context": string[]
  issuanceDate: string
  proof: Proof
}

export interface CredentialSubject {
  gender: string
  name: string
  id: string
}

export interface Issuer {
  id: string
}

export interface CredentialStatus {
  id: string
  type: string
  statusPurpose: string
  statusListIndex: string
}

export interface Proof {
  type: string
  jwt: string
}
