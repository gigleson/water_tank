import type { Request, Response, NextFunction } from 'express';

export const requireRole = (...allowedRoles: ('ADMIN' | 'STAFF')[]) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        if (!req.session.user) {
            res.redirect('/login');
            return;
        }

        if (!allowedRoles.includes(req.session.user.role)) {
            res.status(403).send('Access denied. You do not have permission.');
            return;
        }

        next();
    };
};