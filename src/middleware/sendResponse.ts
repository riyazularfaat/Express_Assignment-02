import type { Response } from "express";
import type { SendResponse } from "../types";

const sendResponse = <T>(res: Response, data: SendResponse<T>) => { 
    res.status(data.statusCode ?? 200).json({
        success: data.success,
        message: data.message,
        data: data.data,
        error: data.error
    });
}


export default sendResponse;