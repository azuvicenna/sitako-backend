import crypto from "crypto";

export const generateTransactionCode = (length = 6): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = crypto.randomBytes(length);
  let randomString = "";

  for (let i = 0; i < length; i++) {
    randomString += characters[randomBytes[i] % characters.length];
  }

  return `TRX-${year}${month}${date}-${randomString}`;
};
