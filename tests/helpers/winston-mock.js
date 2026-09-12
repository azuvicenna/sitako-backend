// Mock untuk winston — logging library
module.exports = {
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  })),
  format: {
    combine: jest.fn(() => ({})),
    timestamp: jest.fn(() => ({})),
    errors: jest.fn(() => ({})),
    json: jest.fn(() => ({})),
    colorize: jest.fn(() => ({})),
    printf: jest.fn(() => ({})),
    simple: jest.fn(() => ({})),
  },
  transports: {
    Console: jest.fn(() => ({})),
    File: jest.fn(() => ({})),
  },
};
