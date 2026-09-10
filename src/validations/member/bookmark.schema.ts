import { z } from "zod";

export const createBookmarkSchema = z.object({
  bukuId: z
    .string({ message: "Buku wajib dipilih" })
    .min(1, { message: "Buku tidak boleh kosong" }),
  anggotaId: z
    .string({ message: "Anggota wajib dipilih" })
    .min(1, { message: "Anggota tidak boleh kosong" }),
});

export type CreateBookmark = z.infer<typeof createBookmarkSchema>;
