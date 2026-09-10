import {
  BookmarkInsert,
  findBook,
  findDigitalBook,
  insertBookmark,
  removeBookmarkById,
} from "@/repositories/member/library.repository";
import { CreateBookmark } from "@/validations/member/bookmark.schema";

export const getBookById = async (bookId: string) => {
  return await findBook(bookId);
};

export const getDigitalBookById = async (bookId: string) => {
  return await findDigitalBook(bookId);
};

export const createNewBookmark = async (payload: CreateBookmark) => {
  const bookmarkData = { ...payload } as BookmarkInsert;
  return await insertBookmark(bookmarkData);
};

export const deleteExistingBookmark = async (bookmarkId: string) => {
  return await removeBookmarkById(bookmarkId);
};
