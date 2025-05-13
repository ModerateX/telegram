import axios from "axios";
import { cheqdApi } from ".";
import type { CreateDIDDocResponse, DidDoc } from "../types/did";

const network = process.env.CHEQD_NETWORK
const publicKeyHex = process.env.CHEQD_PUBLIC_KEY

export const createDID = async (didDoc: DidDoc) => {


  try {

    const req = await cheqdApi.post<{ did: string }>('/did/create', {
      network,
      identifierFormatType: "uuid",
      "options": {
        "key": publicKeyHex,
        "verificationMethodType": "Ed25519VerificationKey2018"
      },
      "didDocument": didDoc
    });

    console.log({ req })
    return req.data.did
  } catch (error) {
    console.log("Error creating DID", error)
  }

}

export const createDIDDoc = async () => {

  const req = await axios.get<CreateDIDDocResponse>(`https://did-registrar.cheqd.net/1.0/did-document?verificationMethod=Ed25519VerificationKey2020&methodSpecificIdAlgo=uuid&network=${network}&publicKeyHex=${publicKeyHex}`)

  return req.data
}
