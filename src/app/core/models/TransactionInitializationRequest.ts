import { DCQL } from './dcql/DCQL';

export type TransactionInitializationRequest = {
  nonce: string;
  request_uri_method: 'get' | 'post';
  dcql_query: DCQL;
  issuer_chain?: string;
  jar_mode: string;
};

export type PresentationQuery = DCQL;

export type TransactionInitializationRequestState = {
  scheme: string;
  transactionInitializationRequest: TransactionInitializationRequest;
};
