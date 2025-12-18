import { TransactionInitializationRequestState } from '@core/models/TransactionInitializationRequest';
import { InitializedTransaction } from '@core/models/InitializedTransaction';

export type ActiveTransaction = {
  initialized_transaction: InitializedTransaction;
  initialization_request_state: TransactionInitializationRequestState;
};
