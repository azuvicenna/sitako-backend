import { z } from "zod";

import { fineTypeEnum, calculationTypeEnum } from "@/db/schema";

export const createFineSchema = z.object({
  bukuId: z
    .string({ message: "Buku wajib dipilih" })
    .min(1, { message: "Buku tidak boleh kosong" }),
  jenisDenda: z
    .enum(fineTypeEnum.enumValues, { message: "Jenis denda tidak valid" })
    .default("Terlambat"),
  hargaDenda: z
    .number({ message: "Harga denda wajib diisi angka" })
    .int({ message: "Harga denda harus angka bulat" })
    .nonnegative({ message: "Harga denda tidak boleh minus" }),
  metodePerhitungan: z
    .enum(calculationTypeEnum.enumValues, { message: "Metode perhitungan tidak valid" })
    .default("Akumulasi"),
});

export const updateFineSchema = createFineSchema.partial();

export type CreateFine = z.infer<typeof createFineSchema>;
export type UpdateFine = z.infer<typeof updateFineSchema>;
