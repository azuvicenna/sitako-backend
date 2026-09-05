import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

export const verifyToken = (payload: string): any => {
  try {
    return jwt.verify(payload, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
