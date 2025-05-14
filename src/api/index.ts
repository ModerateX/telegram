import axios from 'axios';

export const cheqdApi = axios.create({
  baseURL: 'https://studio-api.cheqd.net',
  headers: {
    'x-api-key': process.env.CHEQD_API_KEY,
    'Content-Type': 'application/json',
  },
});

export const veridaApi = axios.create({
  baseURL: 'https://api.verida.ai/api/rest/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export * as didApi from './did'
export * as keyApi from './key'
export * as credentialApi from './credential'
export * as accountApi from './account'
export * as agentApi from './agent'
