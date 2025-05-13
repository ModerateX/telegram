import { cheqdApi } from ".";

export const createKey = async () => {
  try {

    const req = await cheqdApi.post<{ publicKeyHex: string }>('/key/create');

    return req.data.publicKeyHex
  } catch (error) {
    console.log("Error creating Key", error)
  }

}
