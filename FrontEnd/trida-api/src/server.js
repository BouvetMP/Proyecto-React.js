import dotenv from 'dotenv';
import { app } from './app.js';
import { checkDbConnection } from './config/db.js';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

try {
  await checkDbConnection();
  console.log('✅ Conexión a PostgreSQL correcta');

  app.listen(PORT, () => {
    console.log(`🚀 TriDa API escuchando en http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('❌ No se pudo conectar a PostgreSQL');
  console.error(err);
  process.exit(1);
}
