import type { NextFunction, Request, Response } from "express";
import sendResponse from "../../middleware/sendResponse";
import { issueService } from "./issue.service";
import type { AuthRequest } from "../../middleware/auth";


const createIssueReport = async (req: AuthRequest, res: Response, next: NextFunction) => { 
    try {
        if (!req.user) {
            throw {
                statusCode: 401,
                message: "Unauthorized",
                errors: "No authenticated user found"
            };
        }

        const result = await issueService.createBugReportIntoDB(req.body, req.user.id);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

const getAllIssues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sort, type, status } = req.query;
    
    const issues = await issueService.getAllIssuesFromDB(sort as string, type as string, status as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

const getSingleIssue = async (req: Request, res: Response, next: NextFunction) => { 
    try {
        const issueId = Number(req.params.id);

        if (!Number.isInteger(issueId)) {
        throw { 
            statusCode: 400, 
            message: "Bad Request!", 
            errors: "Issue ID must be a valid number" 
        };
        }
        const result = await issueService.getSingleIssueFromDB(issueId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

const updateIssue = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const issueId = Number(req.params.id);

        if (!Number.isInteger(issueId)) {
            throw {
                statusCode: 400,
                message: "Bad Request",
                errors: "Invalid Issue ID"
            };
        }

        if (!req.user) {
            throw {
                statusCode: 401,
                message: "Unauthorized",
                errors: "No authenticated user found"
            };
        }

        const issue = await issueService.updateIssueInDB(issueId, req.body, req.user!);
        
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue updated successfully",
            data: issue
        });
    } catch (error) {
        next(error);
    }
};

const deleteIssue = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const issueId = Number(req.params.id);

        if (!Number.isInteger(issueId)) {
            throw {
                statusCode: 400,
                message: "Bad Request!",
                errors: "Invalid Issue ID"
            };
        }

        if (!req.user) {
            throw {
                statusCode: 401,
                message: "Unauthorized",
                errors: "No authenticated user found"
            };
        }

        await issueService.deleteIssueFromDB(issueId, req.user);
        
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const issueController = {
    createIssueReport,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue,
}
