import request from "supertest";
import app from "@/app";
import { memberToken } from "../helpers/auth.helper";

const mockBookmark = {
  id: "bm-id-001",
  bukuId: "book-id-001",
  anggotaId: "member-id-001",
};

const mockBook = {
  id: "book-id-001",
  judul: "Laskar Pelangi",
  tipeBuku: "Digital",
  urlFile: "https://storage.example.com/books/laskar-pelangi.pdf",
};

jest.mock("@/controllers/member/library.controller", () => ({
  showBook: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: mockBook })
  ),
  readDigitalBook: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { url: mockBook.urlFile } })
  ),
  createBookmark: jest.fn((req, res) =>
    res.status(201).json({ success: true, data: mockBookmark, message: "Bookmark berhasil ditambahkan" })
  ),
  deleteBookmark: jest.fn((req, res) =>
    res.status(200).json({ success: true, message: "Bookmark berhasil dihapus" })
  ),
}));

describe("Member Library & Bookmark Endpoints", () => {
  let token: string;

  beforeAll(() => {
    token = memberToken();
  });

  // ─── GET /api/book/detail/:id ────────────────────────────────────────────
  describe("GET /api/book/detail/:id", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/book/detail/book-id-001");
      expect(res.status).toBe(401);
    });

    it("should return book detail with status 200", async () => {
      const res = await request(app)
        .get("/api/book/detail/book-id-001")
        .set("Cookie", `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("judul");
    });
  });

  // ─── GET /api/book/digital/read/:id ─────────────────────────────────────
  describe("GET /api/book/digital/read/:id", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/book/digital/read/book-id-001");
      expect(res.status).toBe(401);
    });

    it("should return digital book URL with status 200", async () => {
      const res = await request(app)
        .get("/api/book/digital/read/book-id-001")
        .set("Cookie", `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("url");
    });
  });

  // ─── POST /api/book/bookmark/:id ────────────────────────────────────────
  describe("POST /api/book/bookmark/:id", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).post("/api/book/bookmark/book-id-001");
      expect(res.status).toBe(401);
    });

    it("should return 201 with valid data", async () => {
      const res = await request(app)
        .post("/api/book/bookmark/book-id-001")
        .set("Cookie", `token=${token}`)
        .send({
          bukuId: "book-id-001",
          anggotaId: "member-id-001",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/book/bookmark/book-id-001")
        .set("Cookie", `token=${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ─── DELETE /api/book/bookmark/delete/:bookmarkId ────────────────────────
  describe("DELETE /api/book/bookmark/delete/:bookmarkId", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).delete("/api/book/bookmark/delete/bm-id-001");
      expect(res.status).toBe(401);
    });

    it("should return 200 when deleting a bookmark", async () => {
      const res = await request(app)
        .delete("/api/book/bookmark/delete/bm-id-001")
        .set("Cookie", `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
