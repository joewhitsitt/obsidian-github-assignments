export interface GitHubAssignmentsSettings {
  githubToken: string;
  username: string;
  issueVerb: string;
  pullRequestVerb: string;
  taskSuffix: string;
  inProgressCheckbox: boolean;
  addCreatedDate: boolean;
  includeLabels: boolean;
  labelPrefix: string;
  includeReviewRequested: boolean;
  includeAuthored: boolean;
  includeMentioned: boolean;
  includeRepos: string;
  includeIssues: boolean;
  includePullRequests: boolean;
}

export const DEFAULT_SETTINGS: GitHubAssignmentsSettings = {
  githubToken: "",
  username: "",
  issueVerb: "Work on",
  pullRequestVerb: "Review",
  taskSuffix: "",
  inProgressCheckbox: false,
  addCreatedDate: false,
  includeLabels: false,
  labelPrefix: "#",
  includeReviewRequested: false,
  includeAuthored: false,
  includeMentioned: false,
  includeRepos: "",
  includeIssues: true,
  includePullRequests: true,
};