
import express from "express";
import path from "path";

import deliveryRoutes from "./routes/deliveryRoutes";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Set EJS as template engine
app.set("view engine", "ejs");

// Set views directory
app.set("views", path.join(__dirname, "../views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom logger middleware
app.use(logger);

// Serve static files
app.use(express.static(path.join(process.cwd(), "public")));

// Application routes
app.use("/", deliveryRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
