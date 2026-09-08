import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string({ message: "NIP/NIS wajib diisi" })
    .min(1, { message: "NIP/NIS tidak boleh kosong" }),
  password: z
    .string({ message: "Password wajib diisi" })
    .min(1, { message: "Password tidak boleh kosong" }),
});
