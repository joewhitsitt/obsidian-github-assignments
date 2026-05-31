import { App, PluginSettingTab, Setting } from "obsidian";
import GitHubAssignmentsPlugin from "./main";

export class GitHubAssignmentsSettingTab extends PluginSettingTab {
  plugin: GitHubAssignmentsPlugin;

  constructor(app: App, plugin: GitHubAssignmentsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("GitHub token")
      .setDesc("Create a personal access token at https://github.com/settings/tokens")
      .addText((text) =>
        text
          .setPlaceholder("Ghp_...")
          .setValue(this.plugin.settings.githubToken)
          .onChange(async (value) => {
            this.plugin.settings.githubToken = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("GitHub username")
      .setDesc("Your GitHub username")
      .addText((text) =>
        text
          .setPlaceholder("Octocat")
          .setValue(this.plugin.settings.username)
          .onChange(async (value) => {
            this.plugin.settings.username = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl).setName('Task formatting').setHeading();

    new Setting(containerEl)
      .setName("Issue verb")
      .setDesc("Prefix for GitHub issues (e.g., 'work on', 'fix', 'implement')")
      .addText((text) =>
        text
          .setPlaceholder("Work on")
          .setValue(this.plugin.settings.issueVerb)
          .onChange(async (value) => {
            this.plugin.settings.issueVerb = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Pull request verb")
      .setDesc("Prefix for GitHub pull requests (e.g., 'review', 'merge', 'check')")
      .addText((text) =>
        text
          .setPlaceholder("Review")
          .setValue(this.plugin.settings.pullRequestVerb)
          .onChange(async (value) => {
            this.plugin.settings.pullRequestVerb = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Task suffix")
      .setDesc("Optional text to append to each task (e.g., 'due:: tomorrow' or '#urgent')")
      .addText((text) =>
        text
          .setPlaceholder("")
          .setValue(this.plugin.settings.taskSuffix)
          .onChange(async (value) => {
            this.plugin.settings.taskSuffix = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName('Add created date')
      .setDesc('Append [created:: YYYY-MM-DD] to each task')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.addCreatedDate)
        .onChange(async (value) => {
          this.plugin.settings.addCreatedDate = value;
          await this.plugin.saveData(this.plugin.settings);
        }));

    new Setting(containerEl)
      .setName('Use in-progress checkbox')
      .setDesc('Use - [/] instead of - [ ] for tasks')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.inProgressCheckbox)
        .onChange(async (value) => {
          this.plugin.settings.inProgressCheckbox = value;
          await this.plugin.saveData(this.plugin.settings);
        }));

    new Setting(containerEl)
      .setName("Include labels")
      .setDesc("Append GitHub issue/PR labels as tags to each task")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeLabels)
        .onChange(async (value) => {
          this.plugin.settings.includeLabels = value;
          await this.plugin.saveData(this.plugin.settings);
          this.display();
        }));

    new Setting(containerEl)
      .setName("Label prefix")
      .setDesc("Character to prefix each label (e.g., # for Obsidian tags, @ for mentions, or leave blank)")
      .addText((text) =>
        text
          .setPlaceholder("#")
          .setValue(this.plugin.settings.labelPrefix)
          .onChange(async (value) => {
            this.plugin.settings.labelPrefix = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl).setName('Workflows & filtering').setHeading();

    new Setting(containerEl)
      .setName('Include review-requested PRs')
      .setDesc('Include pull requests where you are listed as a reviewer')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeReviewRequested)
        .onChange(async (value) => {
          this.plugin.settings.includeReviewRequested = value;
          await this.plugin.saveData(this.plugin.settings);
        }));

    new Setting(containerEl)
      .setName('Include authored items')
      .setDesc('Include issues and pull requests you authored')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeAuthored)
        .onChange(async (value) => {
          this.plugin.settings.includeAuthored = value;
          await this.plugin.saveData(this.plugin.settings);
        }));

    new Setting(containerEl)
      .setName('Include mentioned items')
      .setDesc('Include items where you are mentioned')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeMentioned)
        .onChange(async (value) => {
          this.plugin.settings.includeMentioned = value;
          await this.plugin.saveData(this.plugin.settings);
        }));

    new Setting(containerEl)
      .setName('Include issues')
      .setDesc('Include GitHub issues in assignments')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeIssues)
        .onChange(async (value) => {
          this.plugin.settings.includeIssues = value;
          await this.plugin.saveData(this.plugin.settings);
        }));

    new Setting(containerEl)
      .setName('Include pull requests')
      .setDesc('Include GitHub pull requests in assignments')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includePullRequests)
        .onChange(async (value) => {
          this.plugin.settings.includePullRequests = value;
          await this.plugin.saveData(this.plugin.settings);
        }));

    new Setting(containerEl)
      .setName('Repository filter')
      .setDesc('Only include items from these repos (comma-separated `owner/repo`). Leave empty to include all.')
      .addText((text) =>
        text
          .setPlaceholder("owner/repo1, owner/repo2 — empty = all")
          .setValue(this.plugin.settings.includeRepos)
          .onChange(async (value) => {
            this.plugin.settings.includeRepos = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );
  }
}
