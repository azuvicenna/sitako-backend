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
  foto: z
    .instanceof(File, { message: "Foto wajib diupload" })
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "Ukuran foto maksimal 2MB",
    })
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      { message: "Format foto harus JPG, PNG, atau WEBP" },
    ),
  status_aktif: z
    .boolean({ message: "Status aktif tidak valid" })
    .default(true),
});

export const updateMemberSchema = createMemberSchema.partial();

export type CreateMember = z.infer<typeof createMemberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;
