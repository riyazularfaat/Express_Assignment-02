import { pool } from "../../db";
import type { IIssue } from "./issue.interface";
import { ISSUE_SORTS, ISSUE_STATUSES, ISSUE_TYPES } from "./issue.interface";

const formatIssueWithReporter = (issue: any, users: any[]) => {
    const reporter = users.find(user => user.id === issue.reporter_id);
    const { reporter_id, created_at, updated_at, ...issueData } = issue;

    return {
        ...issueData,
        reporter: reporter ?? null,
        created_at,
        updated_at
    };
}

const createBugReportIntoDB = async (payload: IIssue, reportedId: number) => { 
    const { title, description, type, status} = payload;
    const issue = await pool.query(`
        INSERT INTO issues(title, description, type, status, reporter_id) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,[title, description, type, status, reportedId]);

    return issue.rows[0];
}

const getAllIssuesFromDB = async (sort: string = "newest", type?: string, status?: string) => {
    let query = "SELECT * FROM issues";
    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (status && !ISSUE_STATUSES.includes(status as any)) {
      throw { 
        statusCode: 400, 
        message: "Validation Error!",
        error: `Invalid status filter. Allowed values: ${ISSUE_STATUSES.join(", ")}` 
      };
    }

    if (type && !ISSUE_TYPES.includes(type as any)) {
      throw { 
        statusCode: 400, 
        message: "Validation Error!",
        error: `Invalid type filter. Allowed values: ${ISSUE_TYPES.join(", ")}` 
      };
    }

    if (sort && !ISSUE_SORTS.includes(sort as any)) {
      throw { 
        statusCode: 400, 
        message: "Validation Error!",
        error: `Invalid sort value. Allowed values: ${ISSUE_SORTS.join(", ")}`
        
      };
    }

    if (type) {
        queryParams.push(type);
        conditions.push(`type = $${queryParams.length}`);
    }
    if (status) {
        queryParams.push(status);
        conditions.push(`status = $${queryParams.length}`);
    }
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(" AND ");
    }

    query += sort === "oldest" ? " ORDER BY created_at ASC" : " ORDER BY created_at DESC";

    const { rows: issues } = await pool.query(query, queryParams);

    if (issues.length === 0) { 
        throw {
            statusCode: 404, 
            message: "Issue Not Found!",
            error: "No issue is found in the database."
        }
    }

    
    const reporterIds = [...new Set(issues.map(issue => issue.reporter_id))];
    
    const { rows: users } = await pool.query(
        "SELECT id, name, role FROM users WHERE id = ANY($1::int[])",
        [reporterIds]
    );

    return issues.map(issue => formatIssueWithReporter(issue, users));
};


const getSingleIssueFromDB = async (id: number) => {

    const { rows: issues } = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        `, [id]);
    const issue = issues[0];
    
    
    if (!issue) {
        throw {
            statusCode: 404,
            message: "Not Found",
            errors: `No issue found with ID ${id}`
        };
    }

    const { rows: users } = await pool.query(`
        SELECT id, name, role FROM users WHERE id = $1
        `,[issue.reporter_id]);

    return formatIssueWithReporter(issue, users);
};

const updateIssueInDB = async (id: number, payload: Partial<IIssue>, user: { id: number, role: string }) => {
    const { title, description, type, status } = payload;
    const { rows: issues } = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        `, [id]);
    const issue = issues[0];

    if (!issue) {
        throw {
            statusCode: 404,
            message: "Issue not found",
            errors: `No issue found with ID ${id}`
        };
    }

    if (user.role !== "maintainer") {
        if (issue.reporter_id !== user.id) {
            throw {
                statusCode: 403,
                message: "Forbidden",
                error: "You can only edit your own issues"
            };
        }
        if (issue.status !== "open") {
            throw {
                statusCode: 409,
                message: "Conflict!",
                error: "Only open issues can be edited by contributors"
            };
        }
    }

    if (status && !ISSUE_STATUSES.includes(status as any)) {
        throw {
            statusCode: 400,
            message: "Validation Error",
            errors: `Invalid status. Allowed values: ${ISSUE_STATUSES.join(", ")}`
        };
    }

    if (type && !ISSUE_TYPES.includes(type as any)) {
        throw {
            statusCode: 400,
            message: "Validation Error",
            errors: `Invalid type. Allowed values: ${ISSUE_TYPES.join(", ")}`
        };
    }

    const result = await pool.query(
        `UPDATE issues
        SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 RETURNING *`,
        [title, description, type,status, id]
    );
    const updatedIssue = result.rows[0];
    const { rows: users } = await pool.query(`
        SELECT id, name, role FROM users WHERE id = $1
        `,[updatedIssue.reporter_id]);

    return formatIssueWithReporter(updatedIssue, users);
};

const deleteIssueFromDB = async (id: number, user: { id: number, role: string }) => { 
    if (user.role !== "maintainer") {
        throw {
            statusCode: 403,
            message: "Forbidden",
            error: "Only maintainers can delete issues"
        };
    }

    const result = await pool.query(`
        DELETE FROM issues WHERE id=$1 RETURNING *
    `, [id])

    if (result.rows.length === 0) {
        throw {
            statusCode: 404,
            message: "Issue not found",
            errors: `No issue found with ID ${id}`
        };
    }

    return result.rows[0];
}

export const issueService = {
    createBugReportIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueInDB,
    deleteIssueFromDB,
}
