export interface GitHubAssignmentsSettings {
  githubToken: string;
  username: string;
  issueVerb: string;
  pullRequestVerb: string;
  taskSuffix: string;
  addCreatedDate: boolean;
}

export const DEFAULT_SETTINGS: GitHubAssignmentsSettings = {
  githubToken: "",
  username: "",
  issueVerb: "Work on",
  pullRequestVerb: "Review",
  taskSuffix: "",
  addCreatedDate: false,
};