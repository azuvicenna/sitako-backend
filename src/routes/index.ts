import { Router } from "express";

import bookRoutes from "./book-routes";
import shelfRoutes from "./shelf-routes";
import librarianRoutes from "./librarian-routes";
import memberRoutes from "./member-routes";
import finePaymentRoutes from "./fine-payment-routes";
import transactionRoutes from "./transaction-routes";

const router = Router();

router.use("/books", bookRoutes);
router.use("/shelves", shelfRoutes);
router.use("/user/librarians", librarianRoutes);
router.use("/user/members", memberRoutes);
router.use("/fine-payments", finePaymentRoutes);
router.use("/transactions", transactionRoutes);

export default router;
