import { Plugin, TFile, Notice, requestUrl } from "obsidian";
import {
  GitHubAssignmentsSettings,
  DEFAULT_SETTINGS,
} from "./settings";
import { GitHubAssignmentsSettingTab } from "./settingsTab";

interface GitHubLabel {
  name: string;
}

interface GitHubItem {
  id: string;
  number: number;
  title: string;
  url: string;
  __typename: string;
  repository: {
    nameWithOwner: string;
  };
  labels?: { nodes: GitHubLabel[] };
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
  settings!: GitHubAssignmentsSettings;

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
    const queries: string[] = [
      `assignee:${this.settings.username} is:open`,
    ];

    if (this.settings.includeReviewRequested) {
      queries.push("type:pr review-requested:@me");
    }
    if (this.settings.includeAuthored) {
      queries.push("author:@me");
    }
    if (this.settings.includeMentioned) {
      queries.push("mentions:@me");
    }

    const allItems: GitHubItem[] = [];

    for (const q of queries) {
      const items = await this.runSearchQuery(q);
      allItems.push(...items);
    }

    const merged = this.mergeItems(allItems);
    return this.filterItems(merged);
  }

  private async runSearchQuery(query: string): Promise<GitHubItem[]> {
    const graphqlQuery = `
      query {
        search(query: "${query}", type: ISSUE, first: 50) {
          nodes {
            ... on Issue {
              id
              number
              title
              url
              __typename
              repository { nameWithOwner }
              labels(first: 10) {
                nodes { name }
              }
            }
            ... on PullRequest {
              id
              number
              title
              url
              __typename
              repository { nameWithOwner }
              labels(first: 10) {
                nodes { name }
              }
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
      body: JSON.stringify({ query: graphqlQuery }),
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

  mergeItems(items: GitHubItem[]): GitHubItem[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  filterItems(items: GitHubItem[]): GitHubItem[] {
    return items.filter((item) => {
      if (item.__typename === "Issue" && !this.settings.includeIssues) return false;
      if (item.__typename === "PullRequest" && !this.settings.includePullRequests) return false;
      if (this.settings.includeRepos.trim()) {
        const allowedRepos = this.settings.includeRepos.split(",").map((r) => r.trim().toLowerCase());
        if (!allowedRepos.includes(item.repository.nameWithOwner.toLowerCase())) return false;
      }
      return true;
    });
  }

  buildTask(item: GitHubItem): string {
    const isPR = item.__typename === "PullRequest";
    const verb = isPR ? this.settings.pullRequestVerb : this.settings.issueVerb;
    const repo = item.repository.nameWithOwner;
    const suffix = this.settings.taskSuffix ? ` ${this.settings.taskSuffix}` : "";
    const checkbox = this.settings.inProgressCheckbox ? "- [/]" : "- [ ]";
    let taskLine = `${checkbox} ${verb} [${repo}#${item.number}](${item.url}) ${item.title}${suffix}`;

    if (this.settings.includeLabels && item.labels?.nodes?.length) {
      const prefix = this.settings.labelPrefix;
      const labelStr = item.labels.nodes.map((l: GitHubLabel) => {
        const sanitized = l.name.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        return `${prefix}${sanitized}`;
      }).join(" ");
      taskLine += ` ${labelStr}`;
    }

    const today = window.moment().format('YYYY-MM-DD');

    if (this.settings.addCreatedDate) {
      taskLine += ` [created:: ${today}]`;
    }
    return taskLine;
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
    // If the file already ends with a newline, insert there instead of adding a blank gap.
    if (newTasks.length > 0) {
      const separator = content.endsWith("\n") ? "" : "\n";
      const newContent = content + separator + newTasks.join("\n");
      await this.app.vault.modify(file, newContent);
    }
  }

}
