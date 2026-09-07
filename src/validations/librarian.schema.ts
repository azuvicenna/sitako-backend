import { z } from "zod";

export const createLibrarianSchema = z.object({
  nama: z
    .string({ message: "Nama pustakawan wajib diisi" })
    .min(1, { message: "Nama pustakawan tidak boleh kosong" }),
  nip: z
    .string({ message: "NIP wajib diisi" })
    .min(1, { message: "NIP tidak boleh kosong" }),
  email: z
    .string({ message: "Email wajib diisi" })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "Format email tidak valid",
    }),
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

export const updateLibrarianSchema = createLibrarianSchema.partial();

export type CreateLibrarian = z.infer<typeof createLibrarianSchema>;
export type UpdateLibrarian = z.infer<typeof updateLibrarianSchema>;
