import { z } from "zod";

const TIPE_BUKU = ["Fisik", "Digital"] as const;

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
  genre: z
    .array(z.string(), { message: "Genre wajib dipilih" })
    .min(1, { message: "Minimal pilih satu genre" }),
  tipeBuku: z
    .enum(TIPE_BUKU, { message: "Tipe buku tidak valid" })
    .default("Fisik"),
  tahunTerbit: z
    .number({ message: "Tahun terbit wajib diisi angka" })
    .int({ message: "Tahun terbit harus angka bulat" }),
  jumlahStok: z
    .number({ message: "Jumlah stok wajib diisi angka" })
    .int({ message: "Jumlah stok harus angka bulat" })
    .nonnegative({ message: "Jumlah stok tidak boleh minus" }),
  cover: z
    .instanceof(File, { message: "Cover wajib diupload" })
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "Ukuran cover maksimal 5MB",
    })
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      { message: "Format cover harus JPG, PNG, atau WEBP" },
    ),
  file: z
    .instanceof(File, { message: "File digital tidak valid" })
    .optional()
    .refine((file) => !file || file.size <= 20 * 1024 * 1024, {
      message: "Ukuran file maksimal 20MB",
    })
    .refine((file) => !file || file.type === "application/pdf", {
      message: "Format file harus PDF",
    }),
});

export type CreateBook = z.infer<typeof createBookSchema>;

export const updateBookSchema = createBookSchema.partial();

export type UpdateBook = z.infer<typeof updateBookSchema>;
