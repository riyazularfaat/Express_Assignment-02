import { Router } from "express";
import { issueController } from "./issue.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.post("/", authenticate, issueController.createIssueReport);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch("/:id", authenticate, issueController.updateIssue);
router.delete("/:id", authenticate, issueController.deleteIssue);


export const issueRoute = router;
