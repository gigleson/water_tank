
import express from "express";
import path from "path";

import deliveryRoutes from "./routes/deliveryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sessionMiddleware } from "./config/session.js";

const app = express();

// Set EJS as template engine
app.set("view engine", "ejs");

// Set views directory
app.set("views", path.join(process.cwd(), "views"));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom logger middleware
app.use(logger);

// Serve static files
app.use(express.static(path.join(process.cwd(), "public")));

// Session middleware MUST come before accessing req.session
app.use(sessionMiddleware);

// Make logged-in user available in EJS
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// Application routes
app.use(authRoutes);
app.use("/", deliveryRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
