import express, { type Application, type Response } from "express";
import type { Request } from "express";
import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issues/issue.route";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app:Application = express();

app.get("/", (req: Request, res: Response) => {
    res.status(201).json({
        message: "Welcome To Assignment - 02",
        projectName: "Internal Tech Issue & Feature Tracker",
        description: "A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.",
    });
});

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoute);
app.use('/api/issues', issueRoute);



app.use(globalErrorHandler);


export default app;
