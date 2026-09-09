import {
  insertStack,
  updateStackById,
  findStack,
  removeStackById,
  findStacksWithPagination,
  StackInsert,
} from "@/repositories/librarian/stack.repository";
import { CreateStack, UpdateStack } from "@/validations/librarian/stack.schema";

export const getStacksWithPagination = async (
  shelfId: string,
  page: number,
  limit: number,
  search: string,
) => {
  return await findStacksWithPagination(shelfId, page, limit, search);
};

export const getStackById = async (id: string) => {
  return await findStack(id);
};

export const createNewStack = async (payload: CreateStack) => {
  const stackData: StackInsert = { ...payload } as any;
  return await insertStack(stackData);
};

export const updateExistingStack = async (id: string, payload: UpdateStack) => {
  const existingStack = await findStack(id);
  if (!existingStack) return null;

  if (Object.keys(payload).length === 0) {
    return existingStack;
  }

  const updateData: Partial<StackInsert> = { ...payload } as any;
  return await updateStackById(id, updateData);
};

export const deleteExistingStack = async (id: string) => {
  return await removeStackById(id);
};
