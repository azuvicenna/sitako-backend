import { v4 as uuidv4 } from "uuid";
import {
  insertBook,
  updateBookById,
  findBook,
  removeBookById,
  findBooksWithPagination,
  BookInsert,
} from "@/repositories/librarian/book.repository";
import { deleteFile, uploadFile } from "@/utils/services/storage";
import { CreateBook, UpdateBook } from "@/validations/librarian/book.schema";
import logger from "@/utils/core/logger";

const extractFileKey = (url: string) => url.split("/").slice(-2).join("/");

export const getBooksWithPagination = async (
  bookType: string,
  page: number,
  limit: number,
  search: string,
) => {
  return await findBooksWithPagination(bookType, page, limit, search);
};

export const getBookById = async (id: string) => {
  return await findBook(id);
};

export const createNewBook = async (
  payload: CreateBook,
  bookTypeParam: string,
  coverFile?: Express.Multer.File,
  pdfFile?: Express.Multer.File,
) => {
  let cover = "";
  let file: string | null = null;

  if (coverFile) {
    const ext = coverFile.originalname.split(".").pop();
    cover = await uploadFile("covers", coverFile, `${uuidv4()}.${ext}`);
  }

  if (bookTypeParam.toLowerCase() === "digital" && pdfFile) {
    const ext = pdfFile.originalname.split(".").pop();
    file = await uploadFile("books", pdfFile, `${uuidv4()}.${ext}`);
  }

  const bookData: BookInsert = {
    ...payload,
    tipeBuku: (payload.tipeBuku || bookTypeParam) as NonNullable<
      BookInsert["tipeBuku"]
    >,
    cover,
    file,
  };

  try {
    return await insertBook(bookData);
  } catch (error) {
    if (cover) {
      await deleteFile(extractFileKey(cover)).catch((err) =>
        logger.error(
          `Failed to delete orphaned cover file ${cover}: ${err.message}`,
        ),
      );
    }
    if (file) {
      await deleteFile(extractFileKey(file)).catch((err) =>
        logger.error(
          `Failed to delete orphaned book file ${file}: ${err.message}`,
        ),
      );
    }
    throw error;
  }
};

export const updateExistingBook = async (
  id: string,
  payload: UpdateBook,
  coverFile?: Express.Multer.File,
  pdfFile?: Express.Multer.File,
) => {
  const existingBook = await findBook(id);
  if (!existingBook) return null;

  const updateData = { ...payload } as Partial<BookInsert>;

  if (coverFile) {
    const ext = coverFile.originalname.split(".").pop();
    updateData.cover = await uploadFile(
      "covers",
      coverFile,
      `${uuidv4()}.${ext}`,
    );
  }

  if (pdfFile) {
    const ext = pdfFile.originalname.split(".").pop();
    updateData.file = await uploadFile("books", pdfFile, `${uuidv4()}.${ext}`);
  }
  if (payload.tipeBuku === "Fisik" && existingBook.file && !pdfFile) {
    updateData.file = null;
  }

  if (Object.keys(updateData).length === 0) {
    return existingBook;
  }

  try {
    const updated = await updateBookById(id, updateData);

    if (coverFile && existingBook.cover) {
      await deleteFile(extractFileKey(existingBook.cover)).catch((err) =>
        logger.error(`Failed to delete old cover file: ${err.message}`),
      );
    }

    if (pdfFile && existingBook.file) {
      await deleteFile(extractFileKey(existingBook.file)).catch((err) =>
        logger.error(`Failed to delete old book file: ${err.message}`),
      );
    }

    if (payload.tipeBuku === "Fisik" && existingBook.file && !pdfFile) {
      await deleteFile(extractFileKey(existingBook.file)).catch((err) =>
        logger.error(`Failed to delete old physical book file: ${err.message}`),
      );
    }

    return updated;
  } catch (error) {
    if (coverFile && updateData.cover) {
      await deleteFile(extractFileKey(updateData.cover)).catch((err) =>
        logger.error(`Failed to delete orphaned cover file: ${err.message}`),
      );
    }
    if (pdfFile && updateData.file) {
      await deleteFile(extractFileKey(updateData.file)).catch((err) =>
        logger.error(`Failed to delete orphaned book file: ${err.message}`),
      );
    }
    throw error;
  }
};

export const deleteExistingBook = async (id: string) => {
  const book = await findBook(id);
  if (!book) return null;

  const deletedBook = await removeBookById(id);

  if (deletedBook) {
    if (book.cover) {
      await deleteFile(extractFileKey(book.cover)).catch((err) =>
        logger.error(`Failed to delete cover file on delete: ${err.message}`),
      );
    }

    if (book.file) {
      await deleteFile(extractFileKey(book.file)).catch((err) =>
        logger.error(`Failed to delete book file on delete: ${err.message}`),
      );
    }
  }

  return deletedBook;
};
