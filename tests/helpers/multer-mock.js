// Mock untuk multer — digunakan oleh upload.middleware.ts
const multerMock = jest.fn(() => ({
  single: jest.fn(() => (req, res, next) => next()),
  array: jest.fn(() => (req, res, next) => next()),
  fields: jest.fn(() => (req, res, next) => next()),
  none: jest.fn(() => (req, res, next) => next()),
}));

multerMock.memoryStorage = jest.fn(() => ({}));
multerMock.diskStorage = jest.fn(() => ({}));

module.exports = multerMock;
