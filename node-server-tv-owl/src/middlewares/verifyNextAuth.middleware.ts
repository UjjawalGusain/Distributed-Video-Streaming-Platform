import { Request, Response, NextFunction } from "express";
import { NEXTAUTH_SECRET } from "../config";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const verifyNextAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const h = req.headers.authorization;
    if (!h) return res.status(401).json({ message: "Missing token" });
    const token = h.split(" ")[1];
    try {
        const decoded = jwt.verify(token, NEXTAUTH_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
