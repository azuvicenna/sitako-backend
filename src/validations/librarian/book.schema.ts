import { z } from "zod";

import { bookTypeEnum } from "@/db/schema";

export const bookCoverSchema = z
  .custom<Express.Multer.File>((file) => !!file, {
    message: "Cover buku wajib diupload",
  })
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Ukuran cover maksimal 5MB",
  })
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype),
    { message: "Format cover harus JPG, PNG, atau WEBP" },
  );

export const bookPdfSchema = z
  .custom<Express.Multer.File>()
  .optional()
  .refine((file) => !file || file.size <= 20 * 1024 * 1024, {
    message: "Ukuran file maksimal 20MB",
  })
  .refine((file) => !file || file.mimetype === "application/pdf", {
    message: "Format file harus PDF",
  });

export const createBookSchema = z.object({
  judul: z
    .string({ message: "Judul buku wajib diisi" })
    .min(1, { message: "Judul buku tidak boleh kosong" }),
  penulis: z
    .string({ message: "Nama penulis wajib diisi" })
    .min(1, { message: "Nama penulis tidak boleh kosong" }),
  isbn: z
    .string({ message: "ISBN wajib diisi" })
    .min(1, { message: "ISBN tidak boleh kosong" }),
  penerbit: z
    .string({ message: "Penerbit wajib diisi" })
    .min(1, { message: "Penerbit tidak boleh kosong" }),
  genre: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [val];
        }
      }
      return val;
    },
    z.array(z.string()).min(1, { message: "Minimal pilih satu genre" }),
  ),
  tipeBuku: z
    .enum(bookTypeEnum.enumValues, { message: "Tipe buku tidak valid" })
    .default("Fisik"),
  tahunTerbit: z.preprocess(
    (val) => (val !== undefined && val !== "" ? Number(val) : undefined),
    z
      .number({ message: "Tahun terbit wajib diisi angka" })
      .int({ message: "Tahun terbit harus angka bulat" }),
  ),
  jumlahStok: z.preprocess(
    (val) => (val !== undefined && val !== "" ? Number(val) : 0),
    z
      .number({ message: "Jumlah stok wajib diisi angka" })
      .int({ message: "Jumlah stok harus angka bulat" })
      .nonnegative({ message: "Jumlah stok tidak boleh minus" }),
  ),
});

export const updateBookSchema = createBookSchema.partial();

export type CreateBook = z.infer<typeof createBookSchema>;
export type UpdateBook = z.infer<typeof updateBookSchema>;
