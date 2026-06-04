/**
 * Smoke test for the GitHub Assignments plugin.
 *
 * Tests pure / extractable functions — specifically `buildTask()` —
 * by instantiating the Plugin class with mocked dependencies.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { resetMockState, requestUrl } from "./helpers/obsidian-mock";

// The plugin class is the default export of src/main.ts
import GitHubAssignmentsPlugin from "../src/main";

// ---------- Test-local types ----------

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

// ---------- Helpers ----------

/** Factory for minimal GitHubItems used in tests */
function makeItem(overrides: Partial<GitHubItem> & { __typename: string }, labels?: {nodes: GitHubLabel[]}): GitHubItem {
  return {
    id: "test-id",
    number: 42,
    title: "Test issue",
    url: "https://github.com/owner/repo/issues/42",
    repository: { nameWithOwner: "owner/repo" },
    ...overrides,
    ...(labels ? { labels } : {}),
  };
}

// ---------- Suite ----------

describe("GitHubAssignmentsPlugin", () => {
  let plugin: GitHubAssignmentsPlugin;

  beforeEach(() => {
    resetMockState();

    // Make `window` available (it exists in Electron/Obsidian but not in Node)
    if (typeof globalThis.window === "undefined") {
      (globalThis as Record<string, unknown>).window = globalThis;
    }

    // Mock window.moment so we get stable dates
    (globalThis.window as Record<string, unknown>).moment = () => ({
      format: (_fmt: string) => "2026-05-30",
    });

    // Create a plugin instance and manually set its settings
    // (onload() calls loadData() which returns {} so defaults are used)
    plugin = new GitHubAssignmentsPlugin();
    // onload normally initialises settings; we do it manually for test isolation
    plugin.settings = {
      githubToken: "",
      username: "",
      issueVerb: "Work on",
      pullRequestVerb: "Review",
      taskSuffix: "",
      addCreatedDate: false,
      includeLabels: false,
      labelPrefix: "#",
      includeReviewRequested: false,
      includeAuthored: false,
      includeMentioned: false,
      inProgressCheckbox: false,
      includeRepos: "",
      includeIssues: true,
      includePullRequests: true,
    };
  });

  describe("buildTask", () => {
    it("produces identical output when new settings are at defaults", () => {
      const item = makeItem({ __typename: "Issue" });
      const result = plugin.buildTask(item);

      expect(result).toBe(
        "- [ ] Work on [owner/repo#42](https://github.com/owner/repo/issues/42) Test issue",
      );
    });

    it("builds a task line for a GitHub Issue", () => {
      const item = makeItem({ __typename: "Issue" });
      const result = plugin.buildTask(item);

      expect(result).toBe(
        "- [ ] Work on [owner/repo#42](https://github.com/owner/repo/issues/42) Test issue",
      );
    });

    it("builds a task line for a Pull Request", () => {
      const item = makeItem({
        __typename: "PullRequest",
        title: "My PR",
        url: "https://github.com/owner/repo/pull/99",
        number: 99,
      });
      const result = plugin.buildTask(item);

      expect(result).toBe(
        "- [ ] Review [owner/repo#99](https://github.com/owner/repo/pull/99) My PR",
      );
    });

    it("uses custom verbs from settings", () => {
      plugin.settings.issueVerb = "Implement";
      plugin.settings.pullRequestVerb = "Merge";

      const issue = makeItem({ __typename: "Issue", title: "Bug fix" });
      const pr = makeItem({
        __typename: "PullRequest",
        title: "Feature branch",
        url: "https://github.com/owner/repo/pull/7",
        number: 7,
      });

      expect(plugin.buildTask(issue)).toContain("- [ ] Implement");
      expect(plugin.buildTask(pr)).toContain("- [ ] Merge");
    });

    it("appends taskSuffix when configured", () => {
      plugin.settings.taskSuffix = "#urgent";

      const item = makeItem({ __typename: "Issue", title: "Critical" });
      const result = plugin.buildTask(item);

      expect(result).toBe(
        "- [ ] Work on [owner/repo#42](https://github.com/owner/repo/issues/42) Critical #urgent",
      );
    });

    it("does not append taskSuffix when it is empty", () => {
      plugin.settings.taskSuffix = "";

      const item = makeItem({ __typename: "Issue" });
      const result = plugin.buildTask(item);

      // Should have no trailing whitespace or suffix
      expect(result).not.toMatch(/\s+$/);
      expect(result).not.toContain("undefined");
    });

    it("appends [created:: YYYY-MM-DD] when addCreatedDate is true", () => {
      plugin.settings.addCreatedDate = true;

      const item = makeItem({ __typename: "Issue" });
      const result = plugin.buildTask(item);

      expect(result).toContain("[created:: 2026-05-30]");
    });

    it("does not include created date when addCreatedDate is false", () => {
      plugin.settings.addCreatedDate = false;

      const item = makeItem({ __typename: "Issue" });
      const result = plugin.buildTask(item);

      expect(result).not.toContain("[created:: ");
    });

    it("handles repositories with complex names", () => {
      const item = makeItem({
        __typename: "Issue",
        repository: { nameWithOwner: "my-org/my-repo" },
        number: 123,
        url: "https://github.com/my-org/my-repo/issues/123",
        title: "Complex repo name test",
      });

      const result = plugin.buildTask(item);
      expect(result).toBe(
        "- [ ] Work on [my-org/my-repo#123](https://github.com/my-org/my-repo/issues/123) Complex repo name test",
      );
    });

    it("combines suffix and created date together", () => {
      plugin.settings.taskSuffix = "#review";
      plugin.settings.addCreatedDate = true;

      const item = makeItem({ __typename: "PullRequest", title: "PR with extras" });
      const result = plugin.buildTask(item);

      expect(result).toContain("#review");
      expect(result).toContain("[created:: 2026-05-30]");
      // Suffix should come before created date
      const suffixIdx = result.indexOf("#review");
      const createdIdx = result.indexOf("[created::");
      expect(createdIdx).toBeGreaterThan(suffixIdx);
    });

    it("does not include labels when includeLabels is false by default", () => {
      const item = makeItem({ __typename: "Issue" }, { nodes: [{ name: "bug" }] });
      const result = plugin.buildTask(item);
      expect(result).not.toContain("#bug");
    });

    it("appends labels as #tag when includeLabels is true", () => {
      plugin.settings.includeLabels = true;
      const item = makeItem({ __typename: "Issue" }, { nodes: [{ name: "bug" }, { name: "enhancement" }] });
      const result = plugin.buildTask(item);
      expect(result).toMatch(/#bug/);
      expect(result).toMatch(/#enhancement/);
    });

    it("appends labels with custom prefix", () => {
      plugin.settings.includeLabels = true;
      plugin.settings.labelPrefix = "@";
      const item = makeItem({ __typename: "Issue" }, { nodes: [{ name: "bug" }, { name: "urgent" }] });
      const result = plugin.buildTask(item);
      expect(result).toMatch(/@bug/);
      expect(result).toMatch(/@urgent/);
    });

    it("sanitizes labels with spaces into valid Obsidian tags", () => {
      plugin.settings.includeLabels = true;
      plugin.settings.labelPrefix = "#";
      const item = makeItem(
        { __typename: "Issue" },
        { nodes: [{ name: "bug fix" }, { name: "priority: high" }, { name: "good first issue" }] }
      );
      const result = plugin.buildTask(item);
      expect(result).toMatch(/#bug-fix/);
      expect(result).toMatch(/#priority-high/);
      expect(result).toMatch(/#good-first-issue/);
    });

    it("handles items with no labels gracefully", () => {
      plugin.settings.includeLabels = true;
      const item = makeItem({ __typename: "Issue" });
      const result = plugin.buildTask(item);
      expect(result).toBe("- [ ] Work on [owner/repo#42](https://github.com/owner/repo/issues/42) Test issue");
    });

    it("filters out duplicate items from multiple workflow sources", () => {
      const item1 = makeItem({ id: "dup-id", __typename: "Issue", title: "First" });
      const item2 = makeItem({ id: "dup-id", __typename: "PullRequest", title: "Second" });
      const item3 = makeItem({ id: "unique-id", __typename: "Issue", title: "Third" });

      const result = plugin.mergeItems([item1, item2, item3]);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("First");
      expect(result[1].title).toBe("Third");
    });

    it("fetches review-requested items when includeReviewRequested is true", async () => {
      const capturedBodies: string[] = [];

      requestUrl.setMock((params) => {
        if (typeof params.body === "string") {
          capturedBodies.push(params.body);
        }
        return {
          text: JSON.stringify({ data: { search: { nodes: [] } } }),
          status: 200,
          json: () => ({ data: { search: { nodes: [] } } }),
        };
      });

      plugin.settings.githubToken = "test-token";
      plugin.settings.username = "testuser";
      plugin.settings.includeReviewRequested = true;

      await plugin.fetchAssignments();

      const hasReviewRequested = capturedBodies.some((body) =>
        body.includes("review-requested:@me")
      );
      expect(hasReviewRequested).toBe(true);
    });

    it("filters out Issues when includeIssues is false", () => {
      plugin.settings.includeIssues = false;
      const item = makeItem({ __typename: "Issue", id: "1" });
      const result = plugin.filterItems([item]);
      expect(result).toHaveLength(0);
    });

    it("filters out PRs when includePullRequests is false", () => {
      plugin.settings.includePullRequests = false;
      const item = makeItem({ __typename: "PullRequest", id: "1" });
      const result = plugin.filterItems([item]);
      expect(result).toHaveLength(0);
    });

    it("filters by repo when includeRepos is set", () => {
      plugin.settings.includeRepos = "owner/repo2";
      const item1 = makeItem({ __typename: "Issue", id: "1", repository: { nameWithOwner: "owner/repo1" }, title: "in repo1" });
      const item2 = makeItem({ __typename: "Issue", id: "2", repository: { nameWithOwner: "owner/repo2" }, title: "in repo2" });
      const result = plugin.filterItems([item1, item2]);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("in repo2");
    });

    it("includes everything when all filters are at defaults", () => {
      const item1 = makeItem({ __typename: "Issue", id: "1" });
      const item2 = makeItem({ __typename: "PullRequest", id: "2" });
      const result = plugin.filterItems([item1, item2]);
      expect(result).toHaveLength(2);
    });
  });
});
