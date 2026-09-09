import { Router } from "express";

import authRoutes from "./auth/auth";
import bookRoutes from "./librarian/book";
import shelfRoutes from "./librarian/shelf";
import librarianRoutes from "./librarian/librarian";
import memberRoutes from "./librarian/member";
import finePaymentRoutes from "./librarian/fine-payment";
import transactionRoutes from "./librarian/transaction";

const router = Router();

// auth routes
router.use("/auth", authRoutes);

// librarian routes
router.use("/books", bookRoutes);
router.use("/shelves", shelfRoutes);
router.use("/user/librarians", librarianRoutes);
router.use("/user/members", memberRoutes);
router.use("/fine-payments", finePaymentRoutes);
router.use("/transactions", transactionRoutes);

export default router;
