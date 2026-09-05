import { getStaticUser } from "../repositories/user-repository";

export const fetchUsers = async () => {
  const users = await getStaticUser();
  return users;
};
