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
          .setPlaceholder("ghp_...")
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
          .setPlaceholder("octocat")
          .setValue(this.plugin.settings.username)
          .onChange(async (value) => {
            this.plugin.settings.username = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Issue Verb")
      .setDesc("Prefix for GitHub issues (e.g., 'Work on', 'Fix', 'Implement')")
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
      .setName("Pull Request Verb")
      .setDesc("Prefix for GitHub pull requests (e.g., 'Review', 'Merge', 'Check')")
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
      .setName("Task Suffix")
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
  }
}
