import type { NextFunction, Request, Response } from "express";
import sendResponse from "../../middleware/sendResponse";
import { authService } from "./auth.service";

const signUpUser = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        const result = await authService.registeredIntoDB(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
}

const loginUser = async (req: Request, res: Response, next: NextFunction) => { 
    try {
        const result = await authService.loginUserIntoDB(req.body);
        const { refreshToken } = result;
        res.cookie("refreshToken", refreshToken, {
            secure: false, 
            httpOnly: true,
            sameSite: "lax",
        })
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data: {
                token: result.accessToken,
                user: result.user
            }
        });
    } catch (error) {
        next(error);
    }
}


export const authController = {
    signUpUser,
    loginUser,
}
