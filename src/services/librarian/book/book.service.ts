import { v4 as uuidv4 } from "uuid";
import {
  insertBook,
  updateBookById,
  findBook,
  removeBookById,
  findBooksWithPagination,
  BookInsert,
} from "@/repositories/librarian/book/book.repository";
import { deleteFile, uploadFile } from "@/utils/services/file-upload";
import { CreateBook, UpdateBook } from "@/validations/book.schema";

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
    tipeBuku: (payload.tipeBuku || bookTypeParam) as any,
    cover,
    file,
  };

  return await insertBook(bookData);
};

export const updateExistingBook = async (
  id: string,
  payload: UpdateBook,
  coverFile?: Express.Multer.File,
  pdfFile?: Express.Multer.File,
) => {
  const existingBook = await findBook(id);
  if (!existingBook) return null;

  const updateData: Partial<BookInsert> = { ...payload } as any;

  if (coverFile) {
    const ext = coverFile.originalname.split(".").pop();
    updateData.cover = await uploadFile(
      "covers",
      coverFile,
      `${uuidv4()}.${ext}`,
    );

    if (existingBook.cover) {
      await deleteFile(extractFileKey(existingBook.cover)).catch(console.error);
    }
  }

  if (pdfFile) {
    const ext = pdfFile.originalname.split(".").pop();
    updateData.file = await uploadFile("books", pdfFile, `${uuidv4()}.${ext}`);

    if (existingBook.file) {
      await deleteFile(extractFileKey(existingBook.file)).catch(console.error);
    }
  }

  if (payload.tipeBuku === "Fisik" && existingBook.file && !pdfFile) {
    await deleteFile(extractFileKey(existingBook.file)).catch(console.error);
    updateData.file = null;
  }

  if (Object.keys(updateData).length === 0) {
    return existingBook;
  }

  return await updateBookById(id, updateData);
};

export const deleteExistingBook = async (id: string) => {
  const book = await findBook(id);
  if (!book) return null;

  const deletedBook = await removeBookById(id);

  if (deletedBook) {
    if (book.cover) {
      await deleteFile(extractFileKey(book.cover)).catch(console.error);
    }

    if (book.file) {
      await deleteFile(extractFileKey(book.file)).catch(console.error);
    }
  }

  return deletedBook;
};
