import { ulid } from "ulid";

export const generateId = (): string => {
  return ulid();
};
