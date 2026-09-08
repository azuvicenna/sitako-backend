import { z } from "zod";

export const imageFileSchema = z
  .custom<Express.Multer.File>((file) => !!file, {
    message: "Foto wajib diupload",
  })
  .refine((file) => file.size <= 2 * 1024 * 1024, {
    message: "Ukuran foto maksimal 2MB",
  })
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype),
    { message: "Format foto harus JPG, PNG, atau WEBP" },
  );

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

export const updateLibrarianSchema = createLibrarianSchema.partial().extend({
  status_aktif: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) =>
      val !== undefined ? val === true || val === "true" : undefined,
    ),
});

export type CreateLibrarian = z.infer<typeof createLibrarianSchema>;
export type UpdateLibrarian = z.infer<typeof updateLibrarianSchema>;
