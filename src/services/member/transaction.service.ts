import {
  insertTransaction,
  findTransaction,
  findTransactionsWithPagination,
  TransactionInsert,
} from "@/repositories/member/transaction.repository";
import { CreateTransaction } from "@/validations/member/transaction.schema";
import { generateTransactionCode } from "@/utils/generators/transaction-code";

export const getTransactionsWithPagination = async (
  anggotaId: string,
  status: string,
  page: number,
  limit: number,
  search: string,
) => {
  return await findTransactionsWithPagination(anggotaId, status, page, limit, search);
};

export const getTransactionById = async (id: string, anggotaId: string) => {
  return await findTransaction(id, anggotaId);
};

export const createNewTransaction = async (
  anggotaId: string,
  payload: CreateTransaction,
) => {
  const kdTransaksi = generateTransactionCode();
  
  const transactionData = { 
    ...payload, 
    anggotaId,
    kdTransaksi 
  } as TransactionInsert;

  return await insertTransaction(transactionData);
};