import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import {
  insertLibrarian,
  updateLibrarianById,
  findLibrarianById,
  findLibrarianRawById,
  removeLibrarianById,
  findLibrariansWithPagination,
  LibrarianInsert,
} from "@/repositories/librarian/librarian.repository";
import { deleteFile, uploadFile } from "@/utils/services/file-upload";
import { CreateLibrarian, UpdateLibrarian } from "@/validations/librarian/librarian.schema";
import logger from "@/utils/core/logger";

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
  payload: CreateLibrarian,
  fotoFile?: Express.Multer.File,
) => {
  let fotoUrl = "";

  if (fotoFile) {
    const ext = fotoFile.originalname.split(".").pop();
    fotoUrl = await uploadFile("profiles", fotoFile, `${uuidv4()}.${ext}`);
  }

  const hashedPassword = await bcrypt.hash(payload.password as string, 10);

  const librarianData: LibrarianInsert = {
    nama: payload.nama,
    nip: payload.nip,
    email: payload.email,
    password: hashedPassword,
    telepon: payload.telepon,
    foto: fotoUrl,
    // status_aktif sudah di-transform oleh Zod schema menjadi boolean
    status_aktif: payload.status_aktif ?? true,
  };

  try {
    const created = await insertLibrarian(librarianData);
    const { password, ...resultWithoutPassword } = created;
    return resultWithoutPassword;
  } catch (error) {
    if (fotoUrl) {
      await deleteFile(extractFileKey(fotoUrl)).catch((err) =>
        logger.error(
          `Failed to delete orphaned file ${fotoUrl}: ${err.message}`,
        ),
      );
    }
    throw error;
  }
};

export const updateExistingLibrarian = async (
  id: string,
  payload: UpdateLibrarian,
  fotoFile?: Express.Multer.File,
) => {
  const existingLibrarian = await findLibrarianRawById(id);
  if (!existingLibrarian) return null;

  const updateData: Partial<LibrarianInsert> = { ...payload };

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
  }

  if (Object.keys(updateData).length === 0) {
    return existingLibrarian;
  }

  try {
    const updated = await updateLibrarianById(id, updateData);
    if (!updated) return null;

    if (fotoFile && existingLibrarian.foto) {
      await deleteFile(extractFileKey(existingLibrarian.foto)).catch((err) =>
        logger.error(`Failed to delete old profile file: ${err.message}`),
      );
    }

    const { password, ...resultWithoutPassword } = updated;
    return resultWithoutPassword;
  } catch (error) {
    if (fotoFile && updateData.foto) {
      await deleteFile(extractFileKey(updateData.foto)).catch((err) =>
        logger.error(
          `Failed to delete orphaned file ${updateData.foto}: ${err.message}`,
        ),
      );
    }
    throw error;
  }
};

export const deleteExistingLibrarian = async (id: string) => {
  const librarian = await findLibrarianRawById(id);
  if (!librarian) return null;

  const deleted = await removeLibrarianById(id);

  if (deleted && librarian.foto) {
    await deleteFile(extractFileKey(librarian.foto)).catch((err) =>
      logger.error(`Failed to delete profile file on delete: ${err.message}`),
    );
  }

  return deleted;
};
