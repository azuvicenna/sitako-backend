import { db } from "@/db";
import { BookSelect } from "../librarian/book.repository";
import { bookmarks, books } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type BookmarkInsert = typeof bookmarks.$inferInsert;
export type BookmarkSelect = typeof bookmarks.$inferSelect;

export async function findBook(bookId: string): Promise<BookSelect | null> {
  const result = await db
    .select()
    .from(books)
    .where(eq(books.id, bookId))
    .limit(1);

  return result[0] || null;
}

export async function findDigitalBook(
  bookId: string,
): Promise<Pick<BookSelect, "id" | "cover" | "file" | "createdAt"> | null> {
  const result = await db
    .select({
      id: books.id,
      cover: books.cover,
      file: books.file,
      createdAt: books.createdAt,
    })
    .from(books)
    .where(and(eq(books.id, bookId), eq(books.tipeBuku, "Digital")))
    .limit(1);

  return result[0] || null;
}

export const insertBookmark = async (
  data: BookmarkInsert,
): Promise<BookmarkSelect> => {
  const result = await db.insert(bookmarks).values(data).returning();

  return result[0];
};

export const removeBookmarkById = async (
  bookmarkId: string,
): Promise<BookmarkSelect | null> => {
  const result = await db
    .delete(bookmarks)
    .where(eq(bookmarks.id, bookmarkId))
    .returning();

  return result[0] || null;
};
