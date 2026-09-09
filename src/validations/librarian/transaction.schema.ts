import { z } from "zod";

const STATUS_TRANSAKSI = [
  "Menunggu Persetujuan",
  "Dibatalkan",
  "Menunggu Diambil",
  "Dipinjam",
  "Dikembalikan",
  "Terlambat",
  "Tidak Mengembalikan",
] as const;

export const createTransactionSchema = z.object({
  bukuId: z
    .string({ message: "Buku wajib dipilih" })
    .min(1, { message: "Buku tidak boleh kosong" }),
  pustakawanId: z
    .string({ message: "Pustakawan pemberi izin wajib dipilih" })
    .min(1, { message: "Pustakawan pemberi izin tidak boleh kosong" }),
  anggotaId: z
    .string({ message: "Anggota yang meminjam wajib dipilih" })
    .min(1, { message: "Anggota yang meminjam tidak boleh kosong" }),
  tglPinjam: z.coerce
    .date({ message: "Format tanggal pinjam tidak valid" })
    .optional(),
  tglKembali: z.coerce
    .date({ message: "Format tanggal kembali tidak valid" })
    .optional(),
  status: z
    .enum(STATUS_TRANSAKSI, { message: "Status transaksi tidak valid" })
    .default("Menunggu Persetujuan"),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransaction = z.infer<typeof createTransactionSchema>;
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;
