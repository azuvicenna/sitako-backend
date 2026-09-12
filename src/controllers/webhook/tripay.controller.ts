import { Request, Response } from "express";
import crypto from "crypto";
import { findPaymentByTripayReference, updateFinePaymentById } from "@/repositories/librarian/fine-payment.repository";

export const tripayWebhook = async (req: Request, res: Response) => {
  try {
    const tripaySignature = req.headers["x-callback-signature"] as string;
    const jsonString = JSON.stringify(req.body);
    
    const privateKey = process.env.TRIPAY_PRIVATE_KEY as string;
    const signature = crypto.createHmac("sha256", privateKey).update(jsonString).digest("hex");

    if (signature !== tripaySignature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    if (req.body.event !== "payment_status") {
      return res.status(200).json({ success: true, message: "Event not handled" });
    }

    const { reference, status } = req.body;

    const payment = await findPaymentByTripayReference(reference);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (status === "PAID") {
      await updateFinePaymentById(payment.id, {
        paymentStatus: "PAID",
        tglBayar: new Date(),
      });
    } else if (status === "EXPIRED" || status === "FAILED") {
      await updateFinePaymentById(payment.id, {
        paymentStatus: status,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
