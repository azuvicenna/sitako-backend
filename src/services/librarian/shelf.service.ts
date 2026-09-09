import {
  insertShelf,
  updateShelfById,
  findShelf,
  removeShelfById,
  findShelvesWithPagination,
  ShelfInsert,
} from "@/repositories/librarian/shelf.repository";
import { CreateShelf, UpdateShelf } from "@/validations/librarian/shelf.schema";

export const getShelvesWithPagination = async (
  page: number,
  limit: number,
  search: string,
) => {
  return await findShelvesWithPagination(page, limit, search);
};

export const getShelfById = async (id: string) => {
  return await findShelf(id);
};

export const createNewShelf = async (payload: CreateShelf) => {
  const shelfData: ShelfInsert = { ...payload } as any;
  return await insertShelf(shelfData);
};

export const updateExistingShelf = async (id: string, payload: UpdateShelf) => {
  const existingShelf = await findShelf(id);
  if (!existingShelf) return null;

  if (Object.keys(payload).length === 0) {
    return existingShelf;
  }

  const updateData: Partial<ShelfInsert> = { ...payload } as any;
  return await updateShelfById(id, updateData);
};

export const deleteExistingShelf = async (id: string) => {
  return await removeShelfById(id);
};
