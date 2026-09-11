import { Router } from "express";

import authRoutes from "./auth/auth";
import dashboardRoutes from "./librarian/dashboard";
import bookRoutes from "./librarian/book";
import shelfRoutes from "./librarian/shelf";
import librarianRoutes from "./librarian/librarian";
import memberRoutes from "./librarian/member";
import finePaymentRoutes from "./librarian/fine-payment";
import transactionRoutes from "./librarian/transaction";
import libraryRoutes from "./member/library";
import memberTransactionRoutes from "./member/transaction";
import memberFinePaymentRoutes from "./member/fine-payment";
import profileRoutes from "./profile/profile";

const router = Router();

// auth routes
router.use("/auth", authRoutes);

// librarian routes
router.use("/dashboard", dashboardRoutes);
router.use("/books", bookRoutes);
router.use("/shelves", shelfRoutes);
router.use("/user/librarians", librarianRoutes);
router.use("/user/members", memberRoutes);
router.use("/fine-payments", finePaymentRoutes);
router.use("/transactions", transactionRoutes);

// member routes
router.use("/book", libraryRoutes);
router.use("/member/transactions", memberTransactionRoutes);
router.use("/member/fine-payments", memberFinePaymentRoutes);

// profile routes
router.use("/profile", profileRoutes);

export default router;

