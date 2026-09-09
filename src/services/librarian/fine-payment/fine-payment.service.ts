import {
  insertFinePayment,
  updateFinePaymentById,
  findFinePayment,
  removeFinePaymentById,
  findFinePaymentsWithPagination,
  FinePaymentInsert,
} from "@/repositories/librarian/fine-payment/fine-payment.repository";
import {
  CreateFinePayment,
  UpdateFinePayment,
} from "@/validations/fine-payment.schema";

export const getFinePaymentsWithPagination = async (
  page: number,
  limit: number,
  search: string,
) => {
  return await findFinePaymentsWithPagination(page, limit, search);
};

export const getFinePaymentById = async (id: string) => {
  return await findFinePayment(id);
};

export const createNewFinePayment = async (payload: CreateFinePayment) => {
  const paymentData: FinePaymentInsert = { ...payload } as any;
  return await insertFinePayment(paymentData);
};

export const updateExistingFinePayment = async (
  id: string,
  payload: UpdateFinePayment,
) => {
  const existingPayment = await findFinePayment(id);
  if (!existingPayment) return null;

  if (Object.keys(payload).length === 0) {
    return existingPayment;
  }

  const updateData: Partial<FinePaymentInsert> = { ...payload } as any;
  return await updateFinePaymentById(id, updateData);
};

export const deleteExistingFinePayment = async (id: string) => {
  return await removeFinePaymentById(id);
};
