import { cheqdApi } from ".";
import type { CreateCredentialPayload, Credential } from "../types/credential";


export const createCredential = async (paylaod: CreateCredentialPayload) => {
  try {

    const req = await cheqdApi.post<Credential>('/credential/issue', {
      "issuerDid": paylaod.issuerDid,
      "subjectDid": `did:key:${paylaod.subjectDid}`,
      "attributes": {
        "groupID": paylaod.groupId,
        "userID": paylaod.userId,
      },
      "type": [
        "Join"
      ],
      "format": "jwt",
      "credentialStatus": {
        "statusPurpose": "revocation",
        "statusListName": "members-credentials",
        "statusListIndex": 10
      }
    });

    return req.data
  } catch (error) {
    console.log("Error issueing credential", error)
  }

}
