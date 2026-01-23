export interface GitHubAssignmentsSettings {
  githubToken: string;
  username: string;
  issueVerb: string;
  pullRequestVerb: string;
  taskSuffix: string;
}

export const DEFAULT_SETTINGS: GitHubAssignmentsSettings = {
  githubToken: "",
  username: "",
  issueVerb: "Work on",
  pullRequestVerb: "Review",
  taskSuffix: "",
};