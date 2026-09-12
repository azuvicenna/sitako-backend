// Mock global untuk @/middlewares/upload.middleware
// Membuat upload.fields() dan upload.single() menjadi no-op middleware
const uploadMock = {
  fields: jest.fn(() => (req: any, res: any, next: any) => next()),
  single: jest.fn(() => (req: any, res: any, next: any) => next()),
  array: jest.fn(() => (req: any, res: any, next: any) => next()),
  none: jest.fn(() => (req: any, res: any, next: any) => next()),
};

export const upload = uploadMock;
