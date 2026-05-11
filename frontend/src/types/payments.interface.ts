export interface ITransaction {
  id: string;
  userName: string;
  transactionId: string;
  mobileNumber: string;
  serviceName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string | Date;
}


export interface IOtherTransaction {
  id: string;
  transactionId: string;
  service: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface ITransactionDetails {
  id: string;
  userName: string;
  transactionId: string;
  mobileNumber: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  currency: string;
  paymentType: string;
  paymentMethod: string;
  dateTime: string;
  otherTransactions: IOtherTransaction[];
}
