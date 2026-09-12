import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from '../helper/auth.js';
import { config } from '../k6.config.js';

export const options = {
  // Load test: Menguji sistem pada level traffic normal/ekspektasi
  stages: [
    { duration: '1m', target: 50 }, // Ramp-up perlahan ke 50 user selama 1 menit
    { duration: '3m', target: 50 }, // Tahan di 50 user selama 3 menit
    { duration: '1m', target: 0 },  // Ramp-down ke 0 user selama 1 menit
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'], // 95% request < 500ms
    http_req_failed: ['rate<0.05'], // Error rate ditoleransi maksimal 5%
  },
};

export default function () {
  const user = config.users.member;
  login(user.identifier, user.password);

  const booksRes = http.get(`${config.BASE_URL}/books?page=1&limit=10`);
  check(booksRes, {
    'get books berhasil (status 200)': (r) => r.status === 200,
  });
  
  sleep(1);
}
