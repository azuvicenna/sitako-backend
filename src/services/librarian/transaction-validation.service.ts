import { db } from "@/db";
import { transactions, books, finePayments } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

export const validateTransactionCreation = async (
  anggotaId: string,
  bukuId: string,
) => {
  // 1. Cek status denda (Terlambat, Tidak Mengembalikan)
  const penaltyTransactions = await db
    .select({ id: transactions.id, status: transactions.status })
    .from(transactions)
    .where(
      and(
        eq(transactions.anggotaId, anggotaId),
        inArray(transactions.status, ["Terlambat", "Tidak Mengembalikan"]),
      ),
    );

  if (penaltyTransactions.length > 0) {
    for (const trx of penaltyTransactions) {
      if (trx.status === "Terlambat") {
        // Jika terlambat, maka harus selalu diblokir sampai pustakawan
        // mengonfirmasi pengembalian fisik dengan mengubah status ke "Dikembalikan".
        return {
          success: false,
          message:
            "Member memiliki buku yang terlambat dikembalikan (fisik belum dikonfirmasi)",
        };
      }

      if (trx.status === "Tidak Mengembalikan") {
        // Jika buku hilang, cek apakah dendanya sudah lunas
        const payment = await db
          .select({ id: finePayments.id })
          .from(finePayments)
          .where(
            and(
              eq(finePayments.transaksiId, trx.id),
              eq(finePayments.paymentStatus, "PAID"),
            ),
          )
          .limit(1);

        if (payment.length === 0) {
          return {
            success: false,
            message:
              "Member memiliki denda buku hilang yang belum dibayar lunas",
          };
        }
      }
    }
  }

  // 2. Cek ketersediaan buku
  const bookData = await db
    .select({ jumlahStok: books.jumlahStok })
    .from(books)
    .where(eq(books.id, bukuId))
    .limit(1);

  if (bookData.length === 0) {
    return { success: false, message: "Buku tidak ditemukan" };
  }
  const jumlahStok = bookData[0].jumlahStok;

  const borrowedBooksQuery = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.bukuId, bukuId),
        inArray(transactions.status, [
          "Menunggu Diambil",
          "Dipinjam",
          "Terlambat",
          "Tidak Mengembalikan",
        ]),
      ),
    );

  const totalBorrowed = Number(borrowedBooksQuery[0]?.count || 0);

  if (jumlahStok <= totalBorrowed) {
    return { success: false, message: "Stok buku habis" };
  }

  // 3. Cek maksimum pinjam
  const activeTransactionsQuery = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.anggotaId, anggotaId),
        inArray(transactions.status, [
          "Menunggu Persetujuan",
          "Menunggu Diambil",
          "Dipinjam",
        ]),
      ),
    );

  const activeTransactionsCount = Number(
    activeTransactionsQuery[0]?.count || 0,
  );

  if (activeTransactionsCount >= 3) {
    return {
      success: false,
      message: "Maksimum pinjam tercapai (maksimal 3 transaksi aktif)",
    };
  }

  return { success: true };
};
