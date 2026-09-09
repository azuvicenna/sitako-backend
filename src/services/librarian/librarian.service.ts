import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import {
  insertLibrarian,
  updateLibrarianById,
  findLibrarianById,
  findLibrarianRawById,
  removeLibrarianById,
  findLibrariansWithPagination,
} from "@/repositories/librarian/librarian.repository";
import { deleteFile, uploadFile } from "@/utils/services/file-upload";
import { UpdateLibrarian } from "@/validations/librarian/librarian.schema";

const extractFileKey = (url: string) => url.split("/").slice(-2).join("/");

export const getLibrariansWithPagination = async (
  statusActive: string,
  page: number,
  limit: number,
  search: string,
) => {
  return await findLibrariansWithPagination(statusActive, page, limit, search);
};

export const getLibrarianById = async (id: string) => {
  return await findLibrarianById(id);
};

export const createNewLibrarian = async (
  payload: any,
  fotoFile?: Express.Multer.File,
) => {
  let fotoUrl = "";

  if (fotoFile) {
    const ext = fotoFile.originalname.split(".").pop();
    fotoUrl = await uploadFile("profiles", fotoFile, `${uuidv4()}.${ext}`);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const librarianData = {
    nama: payload.nama,
    nip: payload.nip,
    email: payload.email,
    password: hashedPassword,
    telepon: payload.telepon,
    foto: fotoUrl,
    status_aktif:
      payload.status_aktif !== undefined
        ? payload.status_aktif === "true" || payload.status_aktif === true
        : true,
  };

  const created = await insertLibrarian(librarianData);
  const { password, ...resultWithoutPassword } = created;
  return resultWithoutPassword;
};

export const updateExistingLibrarian = async (
  id: string,
  payload: UpdateLibrarian,
  fotoFile?: Express.Multer.File,
) => {
  const existingLibrarian = await findLibrarianRawById(id);
  if (!existingLibrarian) return null;

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

    if (existingLibrarian.foto) {
      await deleteFile(extractFileKey(existingLibrarian.foto)).catch(
        console.error,
      );
    }
  }

  if (Object.keys(updateData).length === 0) {
    return existingLibrarian;
  }

  const updated = await updateLibrarianById(id, updateData);
  if (!updated) return null;

  const { password, ...resultWithoutPassword } = updated;
  return resultWithoutPassword;
};

export const deleteExistingLibrarian = async (id: string) => {
  const librarian = await findLibrarianRawById(id);
  if (!librarian) return null;

  const deleted = await removeLibrarianById(id);

  if (deleted && librarian.foto) {
    await deleteFile(extractFileKey(librarian.foto)).catch(console.error);
  }

  return deleted;
};
