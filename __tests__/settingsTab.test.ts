/**
 * Tests for the declarative (Obsidian 1.13.0) settings layer of
 * GitHubAssignmentsSettingTab: getSettingDefinitions / getControlValue /
 * setControlValue. The settings tab is instantiated against the mock Obsidian
 * PluginSettingTab via the vitest "obsidian" alias (see vitest.config.ts).
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { GitHubAssignmentsSettingTab } from "../src/settingsTab";
import { DEFAULT_SETTINGS, GitHubAssignmentsSettings } from "../src/settings";
import GitHubAssignmentsPlugin from "../src/main";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Which control key maps to which rendered control type.
const EXPECTED_TYPES: Record<string, string> = {
  githubToken: "text",
  username: "text",
  issueVerb: "text",
  pullRequestVerb: "text",
  taskSuffix: "text",
  addCreatedDate: "toggle",
  inProgressCheckbox: "toggle",
  includeLabels: "toggle",
  labelPrefix: "text",
  includeReviewRequested: "toggle",
  includeAuthored: "toggle",
  includeMentioned: "toggle",
  includeIssues: "toggle",
  includePullRequests: "toggle",
  includeRepos: "text",
};

// Flatten top-level definitions and nested group items into control records.
function flattenControls(
  tab: GitHubAssignmentsSettingTab,
): Array<{ key: string; type: string }> {
  const out: Array<{ key: string; type: string }> = [];
  for (const def of tab.getSettingDefinitions() as any[]) {
    if (def && typeof def.control?.key === "string") {
      out.push({ key: def.control.key, type: def.control.type as string });
    } else if (def && def.type === "group" && Array.isArray(def.items)) {
      for (const item of def.items as any[]) {
        if (item && typeof item.control?.key === "string") {
          out.push({ key: item.control.key, type: item.control.type as string });
        }
      }
    }
  }
  return out;
}

describe("GitHubAssignmentsSettingTab (declarative)", () => {
  let tab: GitHubAssignmentsSettingTab;
  let settings: GitHubAssignmentsSettings;
  let saveData: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Default settings fresh per test.
    settings = { ...DEFAULT_SETTINGS };
    saveData = vi.fn(async () => {});

    const plugin = { settings, saveData } as unknown as GitHubAssignmentsPlugin;
    tab = new GitHubAssignmentsSettingTab({} as any, plugin);
  });

  describe("getSettingDefinitions", () => {
    it("defines every available control, keyed to a settings property", () => {
      const controls = flattenControls(tab);
      const keys = new Set(controls.map((c) => c.key));

      expect(keys.size).toBe(Object.keys(EXPECTED_TYPES).length);
      // Every control key is a real settings property name.
      for (const key of keys) {
        expect(key in settings).toBe(true);
      }
      // No duplicates, no an empty-control definition.
      expect(keys).toEqual(new Set(Object.keys(EXPECTED_TYPES)));
    });

    it("groups controls under the expected headings", () => {
      const definitions = tab.getSettingDefinitions() as any[];
      const headings = definitions
        .filter((d) => d && d.type === "group" && typeof d.heading === "string")
        .map((d) => d.heading as string);

      expect(headings).toEqual(["Task formatting", "Workflows & filtering"]);
    });

    it("uses text controls for string settings and toggle controls for boolean settings", () => {
      const controls = flattenControls(tab);
      const byKey = Object.fromEntries(controls.map((c) => [c.key, c.type]));

      for (const [key, expectedType] of Object.entries(EXPECTED_TYPES)) {
        expect(byKey[key]).toBe(expectedType);
      }
    });

    it("labels the GitHub token text control with a secret-style placeholder", () => {
      const token = flattenControls(tab).find(
        (c) => c.key === "githubToken",
      );
      expect(token).toBeDefined();

      const tokenDef = (tab.getSettingDefinitions() as any[])[0];
      expect(tokenDef.control?.placeholder).toBe("Ghp_...");
    });
  });

  describe("getControlValue / setControlValue", () => {
    it("reads the live settings value for a key", () => {
      settings.githubToken = "ghp_abc123";
      expect(tab.getControlValue("githubToken")).toBe("ghp_abc123");
    });

    it("returns undefined for unknown keys", () => {
      expect(tab.getControlValue("not-a-real-key")).toBeUndefined();
    });

    it("persists a text value to settings and calls saveData", async () => {
      tab.setControlValue("issueVerb", "Implement");

      expect(settings.issueVerb).toBe("Implement");
      expect(tab.getControlValue("issueVerb")).toBe("Implement");
      expect(saveData).toHaveBeenCalledTimes(1);
      expect(saveData).toHaveBeenCalledWith(settings);
    });

    it("reads back a boolean toggle round-trip", () => {
      expect(tab.getControlValue("inProgressCheckbox")).toBe(false);
      tab.setControlValue("inProgressCheckbox", true);
      expect(tab.getControlValue("inProgressCheckbox")).toBe(true);
      expect(settings.inProgressCheckbox).toBe(true);
    });

    it("persisting the includeLabels re-render toggle updates settings and saves", () => {
      tab.setControlValue("includeLabels", true);

      expect(settings.includeLabels).toBe(true);
      expect(saveData).toHaveBeenCalledTimes(1);
    });
  });
});