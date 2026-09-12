import { z } from "zod";

export const initiateOnlinePaymentSchema = z.object({
  transaksiId: z
    .string({ message: "Transaksi wajib dipilih" })
    .min(1, { message: "Transaksi tidak boleh kosong" }),
  paymentMethodCode: z
    .string({ message: "Metode pembayaran wajib dipilih" })
    .min(1, { message: "Metode pembayaran tidak boleh kosong" }),
});

export type InitiateOnlinePayment = z.infer<typeof initiateOnlinePaymentSchema>;
