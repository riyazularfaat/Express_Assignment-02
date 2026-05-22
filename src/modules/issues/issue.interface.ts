export const ISSUE_STATUSES = ["open", "in_progress", "resolved"] as const;
export const ISSUE_TYPES = ["bug", "feature_request"] as const;
export const ISSUE_SORTS = ["newest", "oldest"] as const;


export type TIssueStatus = typeof ISSUE_STATUSES[number];
export type TIssueType = typeof ISSUE_TYPES[number];

export interface IIssue {
  title: string;
  description: string;
  type: TIssueType;
  status?: TIssueStatus;
}