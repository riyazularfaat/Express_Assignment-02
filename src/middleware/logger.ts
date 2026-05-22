import type { NextFunction, Request, Response } from "express";
import fs from "fs";

const logger = (req: Request, res: Response, next: NextFunction) => {
    const date: Date = new Date();
    const formatted_date: string = date.toLocaleString();
    const entry = `\nMethod -> ${req.method} \nURL -> ${req.url} \nTime -> ${formatted_date}\n`;

    fs.appendFile("logger.txt", entry, (err) => {
        next();
    });
};

export default logger;