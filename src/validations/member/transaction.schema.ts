import { z } from "zod";
import { transactionStatusEnum } from "@/db/schema";

export const createTransactionSchema = z.object({
  bukuId: z
    .string({ message: "Buku wajib dipilih" })
    .min(1, { message: "Buku tidak boleh kosong" }),
  pustakawanId: z
    .string({ message: "Pustakawan wajib dipilih" })
    .min(1, { message: "Pustakawan tidak boleh kosong" }),
  tglPinjam: z.coerce
    .date({ message: "Format tanggal pinjam tidak valid" })
    .optional(),
  tglKembali: z.coerce
    .date({ message: "Format tanggal kembali tidak valid" })
    .optional(),
  status: z
    .enum(transactionStatusEnum.enumValues, { message: "Status transaksi tidak valid" })
    .default("Menunggu Persetujuan"),
});

export type CreateTransaction = z.infer<typeof createTransactionSchema>;
