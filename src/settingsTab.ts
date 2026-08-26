import { App, PluginSettingTab } from "obsidian";
import type { SettingDefinitionItem } from "obsidian";
import GitHubAssignmentsPlugin from "./main";

export class GitHubAssignmentsSettingTab extends PluginSettingTab {
  plugin: GitHubAssignmentsPlugin;

  constructor(app: App, plugin: GitHubAssignmentsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      // Credentials (no group heading).
      {
        name: "GitHub token",
        desc: "Create a personal access token at https://github.com/settings/tokens",
        control: { type: "text", key: "githubToken", placeholder: "Ghp_..." },
      },
      {
        name: "GitHub username",
        desc: "Your GitHub username",
        control: { type: "text", key: "username", placeholder: "Octocat" },
      },
      {
        type: "group",
        heading: "Task formatting",
        items: [
          {
            name: "Issue verb",
            desc: "Prefix for GitHub issues (e.g., 'work on', 'fix', 'implement')",
            control: { type: "text", key: "issueVerb", placeholder: "Work on" },
          },
          {
            name: "Pull request verb",
            desc: "Prefix for GitHub pull requests (e.g., 'review', 'merge', 'check')",
            control: { type: "text", key: "pullRequestVerb", placeholder: "Review" },
          },
          {
            name: "Task suffix",
            desc: "Optional text to append to each task (e.g., 'due:: tomorrow' or '#urgent')",
            control: { type: "text", key: "taskSuffix", placeholder: "" },
          },
          {
            name: "Add created date",
            desc: "Append a created date with the date to each task",
            control: { type: "toggle", key: "addCreatedDate" },
          },
          {
            name: "Use in-progress checkbox",
            desc: "Use - [/] instead of - [ ] for tasks",
            control: { type: "toggle", key: "inProgressCheckbox" },
          },
          {
            name: "Include labels",
            desc: "Append GitHub issues and pull request labels as tags to each task",
            control: { type: "toggle", key: "includeLabels" },
          },
          {
            name: "Label prefix",
            desc: "Character to prefix each label (e.g., # for Obsidian tags, @ for mentions, or leave blank)",
            control: { type: "text", key: "labelPrefix", placeholder: "#" },
          },
        ],
      },
      {
        type: "group",
        heading: "Workflows & filtering",
        items: [
          {
            name: "Include review-requested pull requests",
            desc: "Include pull requests where you are listed as a reviewer",
            control: { type: "toggle", key: "includeReviewRequested" },
          },
          {
            name: "Include authored items",
            desc: "Include issues and pull requests you authored",
            control: { type: "toggle", key: "includeAuthored" },
          },
          {
            name: "Include mentioned items",
            desc: "Include items where you are mentioned",
            control: { type: "toggle", key: "includeMentioned" },
          },
          {
            name: "Include issues",
            desc: "Include GitHub issues in assignments",
            control: { type: "toggle", key: "includeIssues" },
          },
          {
            name: "Include pull requests",
            desc: "Include GitHub pull requests in assignments",
            control: { type: "toggle", key: "includePullRequests" },
          },
          {
            name: "Repository filter",
            desc: "Only include items from these repos (comma-separated `owner/repo`). Leave empty to include all.",
            control: {
              type: "text",
              key: "includeRepos",
              placeholder: "Owner/repo1, owner/repo2 — empty = all",
            },
          },
        ],
      },
    ];
  }

  private get settingsRecord(): Record<string, unknown> {
    return this.plugin.settings as unknown as Record<string, unknown>;
  }

  getControlValue(key: string): unknown {
    return this.settingsRecord[key];
  }

  setControlValue(key: string, value: unknown): void {
    this.settingsRecord[key] = value;
    void this.plugin.saveData(this.plugin.settings);
  }
}