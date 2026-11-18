import "dotenv/config";
import app from "./app.js";
import { pool } from './config/pgDatabase.js';

pool.query('SELECT NOW()')
    .then(() => console.log('PostgreSQL connection successful'))
    .catch((error) => console.error('PostgreSQL connection failed:', error));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});