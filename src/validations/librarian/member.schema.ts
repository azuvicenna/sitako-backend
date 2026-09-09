import { z } from "zod";

export const createMemberSchema = z.object({
  nama: z
    .string({ message: "Nama anggota wajib diisi" })
    .min(1, { message: "Nama anggota tidak boleh kosong" }),
  nis: z
    .string({ message: "NIS wajib diisi" })
    .min(1, { message: "NIS tidak boleh kosong" }),
  email: z
    .string({ message: "Email wajib diisi" })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "Format email tidak valid",
    }),
  password: z
    .string({ message: "Password wajib diisi" })
    .min(1, { message: "Password tidak boleh kosong" }),
  telepon: z
    .string({ message: "Nomor telepon wajib diisi" })
    .min(1, { message: "Nomor telepon tidak boleh kosong" }),
  status_aktif: z
    .union([z.boolean(), z.string()])
    .default(true)
    .transform((val) => val === true || val === "true"),
});

export const updateMemberSchema = createMemberSchema.partial().extend({
  status_aktif: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) =>
      val !== undefined ? val === true || val === "true" : undefined,
    ),
});

export type CreateMember = z.infer<typeof createMemberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;
