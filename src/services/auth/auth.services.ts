import bcrypt from "bcrypt";
import {
  findLibrarianByNip,
  findMemberByNis,
} from "@/repositories/auth/auth.repository";
import { generateToken } from "@/utils/auth/jwt";

export const authenticateUser = async (identifier: string, pass: string) => {
  let user: any = await findLibrarianByNip(identifier);
  let role = "Pustakawan";

  if (!user) {
    user = await findMemberByNis(identifier);
    role = "Anggota";
  }

  if (!user) return null;

  const isValid = await bcrypt.compare(pass, user.password);
  if (!isValid) return null;

  const token = generateToken({ id: user.id, role });
  return { user, token };
};
