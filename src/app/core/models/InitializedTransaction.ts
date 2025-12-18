export type InitializedTransactionByReference = {
  client_id: string;
  request_uri: string;
  request_uri_method: 'get' | 'post';
  transaction_id: string;
};

export type InitializedTransactionByValue = {
  client_id: string;
  request: string;
  transaction_id: string;
};

export type InitializedTransaction =
  | InitializedTransactionByReference
  | InitializedTransactionByValue;
