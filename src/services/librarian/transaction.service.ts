import {
  insertTransaction,
  updateTransactionById,
  findTransaction,
  removeTransactionById,
  findTransactionsWithPagination,
  TransactionInsert,
} from "@/repositories/librarian/transaction.repository";
import {
  CreateTransaction,
  UpdateTransaction,
} from "@/validations/librarian/transaction.schema";

export const getTransactionsWithPagination = async (
  status: string,
  page: number,
  limit: number,
  search: string,
) => {
  return await findTransactionsWithPagination(status, page, limit, search);
};

export const getTransactionById = async (id: string) => {
  return await findTransaction(id);
};

export const createNewTransaction = async (payload: CreateTransaction) => {
  const transactionData = { ...payload } as TransactionInsert;
  return await insertTransaction(transactionData);
};

export const updateExistingTransaction = async (
  id: string,
  payload: UpdateTransaction,
) => {
  const existingTransaction = await findTransaction(id);
  if (!existingTransaction) return null;

  if (Object.keys(payload).length === 0) {
    return existingTransaction;
  }

  const updateData = { ...payload } as Partial<TransactionInsert>;
  return await updateTransactionById(id, updateData);
};

export const deleteExistingTransaction = async (id: string) => {
  return await removeTransactionById(id);
};
