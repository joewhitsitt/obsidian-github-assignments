# GitHub Assignments

Lightweight Obsidian plugin to append assigned GitHub issues and pull requests to your current note.

## Features

- Fetch currently assigned GitHub issues and pull requests.
- Avoids duplication within the note.
- Optional prefixes for issues ("Work on") and pull requests ("Review")
- Optional suffix for issues and pull requests.
- Works with any note structure (daily notes, project notes, etc.)

## Installation

1. Install this plugin from the Obsidian Community Plugins directory
2. Enable the plugin in Settings > Community Plugins
3. Configure your GitHub token and username in plugin settings

## Configuration

### Required
- **GitHub Token**: Create a [personal access token](https://github.com/settings/tokens) with `repo` and `read:user` scopes
- **GitHub Username**: Your GitHub username

### Optional
- **Issue Verb**: Text prefix for issues (default: "Work on")
- **Pull Request Verb**: Text prefix for PRs (default: "Review")
- **Task Suffix**: Append custom text to each task (e.g., `due:: today` for Tasks plugin, or `#urgent`)

## Usage

1. Open any note in Obsidian
3. Run the "Fetch GitHub assignments" command
4. Assigned Github issues and pull requests will be appended as checkbox items

## Example Output

```markdown
- [ ] Work on [owner/repo#123](https://github.com/owner/repo/issues/123) Fix the bug due:: today
- [ ] Review [owner/repo#456](https://github.com/owner/repo/pull/456) Add new feature
```

## Development

```bash
npm install
npm run build
```