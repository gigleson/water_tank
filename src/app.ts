
import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";

import deliveryRoutes from "./routes/deliveryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sessionMiddleware } from "./config/session.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(helmet());


const allowedOrigins = (
    process.env.CORS_ORIGINS || ""
)
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Reject CORS permission without throwing a server error.
        return callback(null, false);
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
}));
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
app.use(userRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
