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
const router = Router();

router.get('/login', getLogin);
router.post('/login',    validateLogin,
    handleValidationErrors,
    postLogin
 );
router.post('/logout', logout);

export default router;