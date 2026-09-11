import bcrypt from "bcrypt";
import {
  findLibrarianByNip,
  findMemberByNis,
} from "@/repositories/auth/auth.repository";
import { LibrarianSelect } from "@/repositories/librarian/librarian.repository";
import { MemberSelect } from "@/repositories/librarian/member.repository";
import { generateToken } from "@/utils/auth/jwt";

export const authenticateUser = async (identifier: string, pass: string) => {
  let rawUser: LibrarianSelect | MemberSelect | null =
    await findLibrarianByNip(identifier);
  let role = "Pustakawan";

  if (!rawUser) {
    rawUser = await findMemberByNis(identifier);
    role = "Anggota";
  }

  if (!rawUser) return null;

  const isValid = await bcrypt.compare(pass, rawUser.password);
  if (!isValid) return null;

  const token = generateToken({ id: rawUser.id, role });

  // Strip password sebelum mengembalikan data user ke controller
  const { password, ...user } = rawUser;
  return { user, token };
};
