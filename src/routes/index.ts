import { Router } from "express";

import bookRoutes from "./librarian-routes/book";
import shelfRoutes from "./librarian-routes/shelf";
import librarianRoutes from "./librarian-routes/librarian";
import memberRoutes from "./librarian-routes/member";
import finePaymentRoutes from "./librarian-routes/fine-payment";
import transactionRoutes from "./librarian-routes/transaction";

const router = Router();

// librarian routes
router.use("/books", bookRoutes);
router.use("/shelves", shelfRoutes);
router.use("/user/librarians", librarianRoutes);
router.use("/user/members", memberRoutes);
router.use("/fine-payments", finePaymentRoutes);
router.use("/transactions", transactionRoutes);

export default router;
