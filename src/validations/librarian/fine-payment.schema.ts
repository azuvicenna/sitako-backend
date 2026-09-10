import { z } from "zod";

import { paymentMethodEnum } from "@/db/schema";

export const createFinePaymentSchema = z.object({
  pustakawanId: z
    .string({ message: "Pustakawan wajib dipilih" })
    .min(1, { message: "Pustakawan tidak boleh kosong" }),
  anggotaId: z
    .string({ message: "Anggota wajib dipilih" })
    .min(1, { message: "Anggota tidak boleh kosong" }),
  transaksiId: z
    .string({ message: "Transaksi wajib dipilih" })
    .min(1, { message: "Transaksi tidak boleh kosong" }),
  hargaDenda: z
    .number({ message: "Harga denda wajib diisi angka" })
    .int({ message: "Harga denda harus angka bulat" })
    .nonnegative({ message: "Harga denda tidak boleh minus" }),
  totalDenda: z
    .number({ message: "Total denda wajib diisi angka" })
    .int({ message: "Total denda harus angka bulat" })
    .nonnegative({ message: "Total denda tidak boleh minus" }),
  tglBayar: z.coerce
    .date({ message: "Format tanggal bayar tidak valid" })
    .optional(),
  metodePembayaran: z
    .enum(paymentMethodEnum.enumValues, { message: "Metode pembayaran tidak valid" })
    .default("Tunai"),
});

export const updateFinePaymentSchema = createFinePaymentSchema.partial();

export type CreateFinePayment = z.infer<typeof createFinePaymentSchema>;
export type UpdateFinePayment = z.infer<typeof updateFinePaymentSchema>;
