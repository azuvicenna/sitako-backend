import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from '../helper/auth.js';
import { config } from '../k6.config.js';

export const options = {
  // Stress test: Mendorong sistem melewati batasnya (sangat agresif)
  stages: [
    { duration: '2m', target: 100 }, 
    { duration: '2m', target: 200 }, 
    { duration: '2m', target: 300 }, // Mencapai 300 concurrent user
    { duration: '2m', target: 0 },   // Turun
  ],
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
