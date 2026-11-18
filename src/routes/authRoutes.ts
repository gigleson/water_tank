import { Router } from 'express';
import {
    getLogin,
    postLogin,
    logout,
} from '../controllers/authController.js';
import {
    validateLogin,
    handleValidationErrors
} from "../middleware/validation.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
const router = Router();

router.get('/login', getLogin);
router.post('/login',    validateLogin,loginLimiter,
    handleValidationErrors,
    postLogin
 );
router.post('/logout', logout);

export default router;