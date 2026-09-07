import { z } from "zod";

export const createShelfSchema = z.object({
  namaRak: z
    .string({ message: "Nama rak wajib diisi" })
    .min(1, { message: "Nama rak tidak boleh kosong" }),
});

export const updateShelfSchema = createShelfSchema.partial();

export type CreateShelf = z.infer<typeof createShelfSchema>;
export type UpdateShelf = z.infer<typeof updateShelfSchema>;
