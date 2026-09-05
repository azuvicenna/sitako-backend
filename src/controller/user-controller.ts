import { Request, Response } from "express";
import { fetchUsers } from "../services/user-service";

export const getUserHandler = async (req: Request, res: Response) => {
  try {
    const data = await fetchUsers();
    res.status(200).json({
      success: true,
      message: "Data Berhasil Diambil!",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi Kesalahan Server",
    });
  }
};
