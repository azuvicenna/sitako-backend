export const config = {
  // Gunakan env var untuk BASE_URL, fallback ke localhost:5000 jika tidak ada
  BASE_URL: __ENV.BASE_URL || 'http://localhost:5000',
  
  // Data user dummy untuk pengujian. 
  // Pastikan Anda mengubahnya dengan data kredensial yang valid di database test Anda.
  users: {
    member: {
      identifier: '11111', // Contoh NIS
      password: 'password123'
    },
    librarian: {
      identifier: '99999', // Contoh NIP
      password: 'password123'
    }
  }
};
