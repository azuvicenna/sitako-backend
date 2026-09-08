import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import {
  insertMember,
  updateMemberById,
  findMemberById,
  findMemberRawById,
  removeMemberById,
  findMembersWithPagination,
} from "@/repositories/librarian/user/member.repository";
import { deleteFile, uploadFile } from "@/utils/services/file-upload";
import { UpdateMember } from "@/validations/member.schema";

const extractFileKey = (url: string) => url.split("/").slice(-2).join("/");

export const getMembersWithPagination = async (
  statusActive: string,
  page: number,
  limit: number,
  search: string,
) => {
  return await findMembersWithPagination(statusActive, page, limit, search);
};

export const getMemberById = async (id: string) => {
  return await findMemberById(id);
};

export const createNewMember = async (
  payload: any,
  fotoFile?: Express.Multer.File,
) => {
  let fotoUrl = "";

  if (fotoFile) {
    const ext = fotoFile.originalname.split(".").pop();
    fotoUrl = await uploadFile("profiles", fotoFile, `${uuidv4()}.${ext}`);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const memberData = {
    nama: payload.nama,
    nis: payload.nis,
    email: payload.email,
    password: hashedPassword,
    telepon: payload.telepon,
    foto: fotoUrl,
    status_aktif:
      payload.status_aktif !== undefined
        ? payload.status_aktif === "true" || payload.status_aktif === true
        : true,
  };

  const created = await insertMember(memberData);
  const { password, ...resultWithoutPassword } = created;
  return resultWithoutPassword;
};

export const updateExistingMember = async (
  id: string,
  payload: UpdateMember,
  fotoFile?: Express.Multer.File,
) => {
  const existingMember = await findMemberRawById(id);
  if (!existingMember) return null;

  const updateData: any = { ...payload };

  if (payload.password) {
    updateData.password = await bcrypt.hash(payload.password, 10);
  }

  if (fotoFile) {
    const ext = fotoFile.originalname.split(".").pop();
    updateData.foto = await uploadFile(
      "profiles",
      fotoFile,
      `${uuidv4()}.${ext}`,
    );

    if (existingMember.foto) {
      await deleteFile(extractFileKey(existingMember.foto)).catch(
        console.error,
      );
    }
  }

  if (Object.keys(updateData).length === 0) {
    return existingMember;
  }

  const updated = await updateMemberById(id, updateData);
  if (!updated) return null;

  const { password, ...resultWithoutPassword } = updated;
  return resultWithoutPassword;
};

export const deleteExistingMember = async (id: string) => {
  const member = await findMemberRawById(id);
  if (!member) return null;

  const deleted = await removeMemberById(id);

  if (deleted && member.foto) {
    await deleteFile(extractFileKey(member.foto)).catch(console.error);
  }

  return deleted;
};
