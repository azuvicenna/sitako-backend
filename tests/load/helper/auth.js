import http from 'k6/http';
import { check } from 'k6';
import { config } from '../k6.config.js';

/**
 * Fungsi untuk melakukan login dan mengembalikan cookie/token.
 */
export function login(identifier, password) {
  const url = `${config.BASE_URL}/auth/login`;
  
  // Trik bypass CAPTCHA:
  // Berdasarkan kode Anda, server mengecek kecocokan req.body.captcha dengan req.cookies.captcha_token
  // Jadi kita bisa menyuntikkan cookie buatan sendiri dan mengirimkannya di body!
  const fakeCaptcha = 'bypass_k6';

  const payload = JSON.stringify({
    identifier: identifier,
    password: password,
    captcha: fakeCaptcha
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // Menyuntikkan cookie captcha secara manual
      'Cookie': `captcha_token=${fakeCaptcha}`
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'login berhasil (status 200)': (r) => r.status === 200,
    'mendapatkan cookie token': (r) => r.cookies && r.cookies.token !== undefined,
  });

  return res;
}
