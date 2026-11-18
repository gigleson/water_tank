import "dotenv/config";
import http from "http";

import app from "./app.js";
import { pool } from "./config/pgDatabase.js";
import { initializeSocket } from "./config/socket.js";

const httpServer = http.createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Check PostgreSQL connection
pool.query("SELECT NOW()")
    .then(() => console.log("PostgreSQL connection successful"))
    .catch((error) => console.error("PostgreSQL connection failed:", error));

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});