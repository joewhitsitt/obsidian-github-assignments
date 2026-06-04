import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.js',
						'manifest.json'
					]
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json']
			},
		},
	},
	// CRITICAL: This must come BEFORE obsidianmd.configs.recommended
	// The plugin applies typed rules (no-plugin-as-component, etc.) to ALL files including JSON
	// but those rules require type info that only exists in .ts files.
	// By placing this override first, we disable the problematic rules for JSON before they
	// are ever applied to JSON files.
	{
		files: ['**/*.json'],
		rules: {
			// Typed rules - these require type information that only exists in .ts files
			// They fail at rule loading time on JSON because JSON has no type info
			'obsidianmd/no-plugin-as-component': 'off',
			'obsidianmd/no-view-references-in-plugin': 'off',
			'obsidianmd/no-unsupported-api': 'off',
			'obsidianmd/prefer-instanceof': 'off',
			'obsidianmd/prefer-file-manager-trash-file': 'off',
			// Non-typed rules that may also cause issues
			'obsidianmd/no-forbidden-elements': 'off',
			'obsidianmd/no-global-this': 'off',
			'obsidianmd/no-sample-code': 'off',
			'obsidianmd/no-tfile-tfolder-cast': 'off',
			'obsidianmd/no-static-styles-assignment': 'off',
			'obsidianmd/object-assign': 'off',
			'obsidianmd/platform': 'off',
			'obsidianmd/prefer-get-language': 'off',
			'obsidianmd/prefer-abstract-input-suggest': 'off',
			'obsidianmd/prefer-window-timers': 'off',
			'obsidianmd/prefer-active-doc': 'off',
			'obsidianmd/regex-lookbehind': 'off',
			'obsidianmd/sample-names': 'off',
			'obsidianmd/validate-manifest': 'off',
			'obsidianmd/validate-license': 'off',
			'obsidianmd/ui/sentence-case': 'off',
			// Commands rules
			'obsidianmd/commands/no-command-in-command-id': 'off',
			'obsidianmd/commands/no-command-in-command-name': 'off',
			'obsidianmd/commands/no-default-hotkeys': 'off',
			'obsidianmd/commands/no-plugin-id-in-command-id': 'off',
			'obsidianmd/commands/no-plugin-name-in-command-name': 'off',
			// Settings tab rules
			'obsidianmd/settings-tab/no-manual-html-headings': 'off',
			'obsidianmd/settings-tab/no-problematic-settings-headings': 'off',
			// Other rules
			'obsidianmd/vault/iterate': 'off',
			'obsidianmd/detach-leaves': 'off',
			'obsidianmd/editor-drop-paste': 'off',
			'obsidianmd/hardcoded-config-path': 'off',
			'obsidianmd/ui/sentence-case-json': 'off',
			'obsidianmd/ui/sentence-case-locale-module': 'off',
		},
	},
	...obsidianmd.configs.recommended,
	globalIgnores([
		"node_modules",
		"dist",
		"coverage",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
		"__tests__",
		"vitest.config.ts",
	]),
);