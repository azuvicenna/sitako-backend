import {
  findFinePaymentsWithPagination,
  findFinePayment,
} from "@/repositories/member/fine-payment.repository";
import { insertFinePayment } from "@/repositories/librarian/fine-payment.repository";
import { db } from "@/db";
import { transactions, fines, members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createTransaction } from "@/utils/services/tripay";
import { generateTransactionCode } from "@/utils/generators/transaction-code";

export const getFinePaymentsWithPagination = async (
  anggotaId: string,
  page: number,
  limit: number,
  search: string,
) => {
  return await findFinePaymentsWithPagination(anggotaId, page, limit, search);
};

export const getFinePaymentById = async (id: string, anggotaId: string) => {
  return await findFinePayment(id, anggotaId);
};

export const initiateOnlinePayment = async (
  anggotaId: string,
  transaksiId: string,
  paymentMethodCode: string,
) => {
  // 1. Dapatkan detail transaksi
  const transaksi = await db.query.transactions.findFirst({
    where: and(
      eq(transactions.id, transaksiId),
      eq(transactions.anggotaId, anggotaId),
    ),
  });

  if (!transaksi) throw new Error("Transaksi tidak ditemukan");

  // 2. Hitung denda
  let jenisDenda: "Terlambat" | "Hilang" = "Terlambat";
  if (transaksi.status === "Tidak Mengembalikan") {
    jenisDenda = "Hilang";
  } else if (transaksi.status !== "Terlambat") {
    throw new Error("Tidak ada denda pada transaksi ini");
  }

  const aturanDenda = await db.query.fines.findFirst({
    where: and(
      eq(fines.bukuId, transaksi.bukuId),
      eq(fines.jenisDenda, jenisDenda),
    ),
  });

  if (!aturanDenda)
    throw new Error("Aturan denda tidak ditemukan untuk transaksi ini");

  const sekarang = new Date();
  const tglKembali = transaksi.tglKembali
    ? new Date(transaksi.tglKembali)
    : new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const diff = sekarang.getTime() - tglKembali.getTime();
  const hariTerlambat = Math.max(1, Math.floor(diff / ONE_DAY_MS));

  let totalDenda = aturanDenda.hargaDenda;
  if (aturanDenda.metodePerhitungan === "Akumulasi") {
    totalDenda = aturanDenda.hargaDenda * hariTerlambat;
  }

  // 3. Panggil Tripay
  const tripayRef = generateTransactionCode();

  const member = await db.query.members.findFirst({
    where: eq(members.id, anggotaId),
  });

  const tripayPayload = {
    method: paymentMethodCode,
    merchant_ref: tripayRef,
    amount: totalDenda,
    customer_name: member?.nama || "Member",
    customer_email: member?.email || "email@example.com",
    customer_phone: member?.telepon || "0800000000",
    order_items: [
      {
        sku: "DENDA",
        name: `Denda ${jenisDenda}`,
        price: totalDenda,
        quantity: 1,
      },
    ],
    return_url: `${process.env.APP_URL || "http://localhost:3000"}/member/payments`,
    expired_time: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 jam
  };

  const tripayResponse = await createTransaction(tripayPayload);

  if (!tripayResponse.success) {
    throw new Error(`Tripay Error: ${tripayResponse.message}`);
  }

  // 4. Simpan ke database finePayments
  const paymentRecord = await insertFinePayment({
    anggotaId,
    transaksiId,
    hargaDenda: aturanDenda.hargaDenda,
    totalDenda,
    metodePembayaran: "Non-Tunai",
    paymentStatus: "UNPAID",
    tripayReference: tripayResponse.data.reference,
    paymentMethodCode: paymentMethodCode,
    checkoutUrl: tripayResponse.data.checkout_url,
  });

  return paymentRecord;
};
