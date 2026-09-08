import { eq } from "drizzle-orm";
import { db } from "@/db";
import { librarians, members } from "@/db/schema";

export const findLibrarianByNip = async (nip: string) => {
  const result = await db
    .select()
    .from(librarians)
    .where(eq(librarians.nip, nip));
  return result[0];
};

export const findMemberByNis = async (nis: string) => {
  const result = await db.select().from(members).where(eq(members.nis, nis));
  return result[0];
};
