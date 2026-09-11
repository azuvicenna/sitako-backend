import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { fines } from "@/db/schema";
import {
  findTransaction,
  updateTransactionStatus,
} from "@/repositories/member/transaction.repository";

/** Jumlah milidetik dalam satu hari */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Hitung selisih hari antara due date dan sekarang.
 * Minimal 1 hari agar tidak ada denda 0 ketika baru terlambat beberapa jam.
 */
const hitungHariTerlambat = (tglKembali: Date, sekarang: Date): number => {
  const diff = sekarang.getTime() - tglKembali.getTime();
  return Math.max(1, Math.floor(diff / ONE_DAY_MS));
};

/**
 * Ambil aturan denda untuk buku tertentu berdasarkan jenis denda.
 * Mengembalikan null jika tidak ada aturan denda yang terdaftar.
 */
const getAturanDenda = async (
  bukuId: string,
  jenisDenda: "Terlambat" | "Hilang",
) => {
  const result = await db
    .select()
    .from(fines)
    .where(and(eq(fines.bukuId, bukuId), eq(fines.jenisDenda, jenisDenda)))
    .limit(1);

  return result[0] || null;
};

/**
 * Status yang valid untuk memulai proses pengembalian.
 */
const STATUS_BISA_DIKEMBALIKAN: ReadonlyArray<string> = [
  "Dipinjam",
  "Terlambat",
];

/**
 * Proses pengembalian buku oleh anggota.
 *
 * Alur sesuai diagram:
 * 1. Cek Denda Terlambat → Tidak: status "Dikembalikan" (menunggu konfirmasi fisik librarian)
 * 2. Ya (terlambat) → Cek Buku Hilang
 *    - Ya (hilang) → status "Tidak Mengembalikan", hitung denda kehilangan
 *    - Tidak (terlambat saja) → status "Terlambat", hitung denda terlambat
 *
 * Fine payment (pembayaran denda) tetap diproses oleh Pustakawan via endpoint terpisah,
 * karena membutuhkan `pustakawanId`. Member hanya mengubah status & mendapat info kalkulasi denda.
 */
export const kembalikanBuku = async (
  transactionId: string,
  anggotaId: string,
  isBukuHilang: boolean,
) => {
  // Cari transaksi — otomatis scoped by anggotaId (ownership guard)
  const transaksi = await findTransaction(transactionId, anggotaId);
  if (!transaksi) return null;

  // Hanya transaksi aktif yang bisa dikembalikan
  if (!STATUS_BISA_DIKEMBALIKAN.includes(transaksi.status)) {
    const err = new Error(
      `Transaksi dengan status "${transaksi.status}" tidak dapat dikembalikan`,
    );
    (err as any).statusCode = 422;
    throw err;
  }

  const sekarang = new Date();
  const tglKembali = transaksi.tglKembali ? new Date(transaksi.tglKembali) : null;

  // ─── CEK DENDA TERLAMBAT ────────────────────────────────────────────────────
  const isTerlambat = tglKembali ? sekarang > tglKembali : false;

  if (!isTerlambat) {
    // [Tidak] → Tidak ada denda → ubah status ke "Dikembalikan" (Menunggu Konfirmasi fisik)
    await updateTransactionStatus(transactionId, "Dikembalikan");

    return {
      status: "Dikembalikan" as const,
      isTerlambat: false,
      isBukuHilang: false,
      denda: null,
      pesan:
        "Pengembalian berhasil diajukan. Menunggu konfirmasi fisik dari pustakawan.",
    };
  }

  const hariTerlambat = hitungHariTerlambat(tglKembali!, sekarang);

  // ─── CEK BUKU HILANG ────────────────────────────────────────────────────────
  if (isBukuHilang) {
    // [Ya] → Buku hilang → ubah status, hitung denda kehilangan
    await updateTransactionStatus(transactionId, "Tidak Mengembalikan");

    const aturanDenda = await getAturanDenda(transaksi.bukuId, "Hilang");

    let totalDenda = 0;
    if (aturanDenda) {
      totalDenda =
        aturanDenda.metodePerhitungan === "Akumulasi"
          ? aturanDenda.hargaDenda * hariTerlambat
          : aturanDenda.hargaDenda;
    }

    return {
      status: "Tidak Mengembalikan" as const,
      isTerlambat: true,
      isBukuHilang: true,
      denda: aturanDenda
        ? {
            jenisDenda: "Hilang" as const,
            hargaDenda: aturanDenda.hargaDenda,
            metodePerhitungan: aturanDenda.metodePerhitungan,
            hariTerlambat,
            totalDenda,
          }
        : null,
      pesan:
        "Buku dilaporkan hilang. Menunggu konfirmasi dan pembayaran denda dari pustakawan.",
    };
  }

  // ─── TERLAMBAT, TIDAK HILANG ────────────────────────────────────────────────
  // [Tidak] → Terlambat, bukan hilang → ubah status, hitung denda terlambat
  await updateTransactionStatus(transactionId, "Terlambat");

  const aturanDenda = await getAturanDenda(transaksi.bukuId, "Terlambat");

  let totalDenda = 0;
  if (aturanDenda) {
    totalDenda =
      aturanDenda.metodePerhitungan === "Akumulasi"
        ? aturanDenda.hargaDenda * hariTerlambat
        : aturanDenda.hargaDenda;
  }

  return {
    status: "Terlambat" as const,
    isTerlambat: true,
    isBukuHilang: false,
    denda: aturanDenda
      ? {
          jenisDenda: "Terlambat" as const,
          hargaDenda: aturanDenda.hargaDenda,
          metodePerhitungan: aturanDenda.metodePerhitungan,
          hariTerlambat,
          totalDenda,
        }
      : null,
    pesan:
      "Pengembalian berhasil diajukan. Terdapat denda keterlambatan yang menunggu konfirmasi pembayaran dari pustakawan.",
  };
};
