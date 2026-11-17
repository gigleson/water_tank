import type { Request, Response, NextFunction } from 'express';

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    next();
};