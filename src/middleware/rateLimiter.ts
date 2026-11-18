
import rateLimit from "express-rate-limit";

// General application rate limiter
export const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    limit: 100,
    message: {
        message: "Too many requests. Please try again later."
    },
    standardHeaders: "draft-8",
    legacyHeaders: false
});

// Login-specific rate limiter
export const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    limit: 2,
    message: {
        message: "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders: "draft-8",
    legacyHeaders: false
});
