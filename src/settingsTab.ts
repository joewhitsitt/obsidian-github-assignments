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
    .setDesc('Add [created:: YYYY-MM-DD] to tasks for use with the `Tasks` plugin')
    .addToggle(toggle => toggle
        .setValue(this.plugin.settings.addCreatedDate)
        .onChange(async (value) => {
            this.plugin.settings.addCreatedDate = value;
            await this.plugin.saveData(this.plugin.settings);
        }));
  }
}
