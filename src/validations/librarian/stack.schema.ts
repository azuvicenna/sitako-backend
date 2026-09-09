import { z } from "zod";

export const createStackSchema = z.object({
  rakId: z
    .string({ message: "Rak wajib dipilih" })
    .min(1, { message: "Rak tidak boleh kosong" }),
  bukuId: z
    .string({ message: "Buku wajib dipilih" })
    .min(1, { message: "Buku tidak boleh kosong" }),
  kdSusunan: z
    .string({ message: "Kode susunan wajib diisi" })
    .min(1, { message: "Kode susunan tidak boleh kosong" }),
  nomorSusunan: z
    .number({ message: "Nomor susunan wajib diisi angka" })
    .int({ message: "Nomor susunan harus angka bulat" })
    .nonnegative({ message: "Nomor susunan tidak boleh minus" }),
});

export const updateStackSchema = createStackSchema.partial();

export type CreateStack = z.infer<typeof createStackSchema>;
export type UpdateStack = z.infer<typeof updateStackSchema>;
