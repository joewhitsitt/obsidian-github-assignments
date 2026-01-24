import { Plugin, TFile, Notice, requestUrl } from "obsidian";
import {
  GitHubAssignmentsSettings,
  DEFAULT_SETTINGS,
} from "./settings";
import { GitHubAssignmentsSettingTab } from "./settingsTab";

interface GitHubItem {
  id: string;
  number: number;
  title: string;
  url: string;
  __typename: string;
  repository: {
    nameWithOwner: string;
  };
}

interface GraphQLResponse {
  data?: {
    search: {
      nodes: GitHubItem[];
    };
  };
  errors?: Array<{ message: string }>;
}

export default class GitHubAssignmentsPlugin extends Plugin {
  settings: GitHubAssignmentsSettings;

  async onload() {
    const data = await this.loadData() as Partial<GitHubAssignmentsSettings>;
    this.settings = { ...DEFAULT_SETTINGS, ...data };

    this.addSettingTab(new GitHubAssignmentsSettingTab(this.app, this));

    this.addCommand({
      id: "fetch-assignments",
      name: "Fetch assignments",
      callback: () => this.sync(),
    });
  }

  async sync() {
    try {
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        new Notice("No active note. Please open a note first.");
        return;
      }

      const items = await this.fetchAssignments();
      if (!items || items.length === 0) {
        new Notice("No assignments found.");
        return;
      }

      await this.insertTasks(activeFile, items);
      new Notice(`Added ${items.length} assignments.`);
    } catch (error) {
      console.error("Error syncing assignments:", error);
      new Notice("Error fetching assignments. Check your token and username.");
    }
  }

  async fetchAssignments(): Promise<GitHubItem[]> {
    const query = `
      query {
        search(query: "assignee:${this.settings.username} is:open", type: ISSUE, first: 50) {
          nodes {
            ... on Issue {
              id
              number
              title
              url
              __typename
              repository { nameWithOwner }
            }
            ... on PullRequest {
              id
              number
              title
              url
              __typename
              repository { nameWithOwner }
            }
          }
        }
      }
    `;

    const response = await requestUrl({
      url: "https://api.github.com/graphql",
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.settings.githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const json = JSON.parse(response.text) as GraphQLResponse;

    if (Array.isArray(json.errors) && json.errors.length > 0) {
      const firstError = json.errors[0];

      if (
        firstError &&
        typeof firstError === "object" &&
        "message" in firstError &&
        typeof (firstError as { message: unknown }).message === "string"
      ) {
        throw new Error(`GraphQL error: ${(firstError as { message: string }).message}`);
      }
    }


    return json.data?.search.nodes ?? [];
  }

  buildTask(item: GitHubItem): string {
    const isPR = item.__typename === "PullRequest";
    const verb = isPR ? this.settings.pullRequestVerb : this.settings.issueVerb;
    const repo = item.repository.nameWithOwner;
    const suffix = this.settings.taskSuffix ? ` ${this.settings.taskSuffix}` : "";

    return `- [ ] ${verb} [${repo}#${item.number}](${item.url}) ${item.title}${suffix}`;
  }

  async insertTasks(file: TFile, items: GitHubItem[]) {
    let content = await this.app.vault.read(file);

    // Deduplicate and filter new items.
    const newTasks: string[] = [];

    for (const item of items) {
      const identifier = `${item.repository.nameWithOwner}#${item.number}`;
      // Check if the identifier already exists in the file or URL.
      if (content.includes(identifier) || content.includes(item.url)) {
        continue;
      }

      const task = this.buildTask(item);
      newTasks.push(task);
    }

    // Append new tasks to the end of the file.
    if (newTasks.length > 0) {
      const newContent = content + "\n" + newTasks.join("\n");
      await this.app.vault.modify(file, newContent);
    }
  }

}
