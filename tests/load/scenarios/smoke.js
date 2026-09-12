import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from '../helper/auth.js';
import { config } from '../k6.config.js';

export const options = {
  // Smoke test: beban sangat ringan untuk memastikan sistem berjalan
  vus: 1, 
  duration: '30s', 
  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% request harus di bawah 1 detik
    http_req_failed: ['rate<0.01'],    // Error rate harus di bawah 1%
  },
};

export default function () {
  // 1. Lakukan Login
  const user = config.users.member;
  login(user.identifier, user.password);

  // 2. Akses halaman Browse Books
  const booksRes = http.get(`${config.BASE_URL}/books?page=1&limit=10`);
  check(booksRes, {
    'get books berhasil (status 200)': (r) => r.status === 200,
  });

  sleep(1);
}
