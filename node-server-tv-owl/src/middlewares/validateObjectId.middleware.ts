import { Request, Response, NextFunction } from "express";
export const validateObjectId = (req: Request, res: Response, next: NextFunction) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.videoId)) {
    return res.status(400).json({ error: "Invalid video id" });
  }
  next();
}
