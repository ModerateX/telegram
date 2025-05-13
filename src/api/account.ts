
import { cheqdApi } from ".";

export type GetAccountResponse = {
  customer: {
    customerId: string,
    name: string
  },
  "paymentAccount": {
    "mainnet": string,
    "testnet": string,
  }

}

export const getAccount = async () => {

  try {

    const req = await cheqdApi.get<GetAccountResponse>('/account',);
    const response = req.data

    console.log({ response })
    return req.data
  } catch (error) {
    console.log("Error getting account", error)
  }

}
export type CreateAccountPayload = {
  name: string,
  id: string,
}

export const createAccount = async ({ name, id }: CreateAccountPayload) => {
  try {
    const req = await cheqdApi.post('/account/create', {
      name,
      primaryEmail: id
    });
    const response = req.data

    console.log({ response })
    return req.data
  } catch (error) {
    console.log("Error creating account", error)
  }
}
