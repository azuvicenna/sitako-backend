import {
  findFinePaymentsWithPagination,
  findFinePayment,
} from "@/repositories/member/fine-payment.repository";

export const getFinePaymentsWithPagination = async (
  anggotaId: string,
  page: number,
  limit: number,
  search: string,
) => {
  return await findFinePaymentsWithPagination(anggotaId, page, limit, search);
};

export const getFinePaymentById = async (id: string, anggotaId: string) => {
  return await findFinePayment(id, anggotaId);
};
