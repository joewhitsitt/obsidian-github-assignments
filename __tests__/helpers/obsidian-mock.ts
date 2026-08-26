/**
 * Obsidian API mocks for testing.
 *
 * Provides minimal implementations of the Obsidian classes/functions used
 * by this plugin, so tests can run outside of the Obsidian app environment.
 */

// ----- Types / Interfaces -----

export interface App {
  workspace: {
    getActiveFile: () => TFile | null;
  };
  vault: {
    read: (file: TFile) => Promise<string>;
    modify: (file: TFile, content: string) => Promise<void>;
  };
}

// ----- Plugin -----

let _pluginInstanceCount = 0;

export class Plugin {
  app: App;
  private _commands: Array<{ id: string; name: string }> = [];
  private _settingTabs: unknown[] = [];

  constructor(app?: App, _plugins?: unknown) {
    _pluginInstanceCount++;
    this.app = app ?? createMockApp();
  }

  addCommand(cmd: { id: string; name: string; callback?: () => void }) {
    this._commands.push(cmd);
  }

  addSettingTab(tab: unknown) {
    this._settingTabs.push(tab);
  }

  async loadData(): Promise<unknown> {
    return {};
  }

  async saveData(_data: unknown): Promise<void> {
    // no-op
  }

  registerEvent(_event: unknown): void {}
  registerDomEvent(..._args: unknown[]): void {}
  registerInterval(_id: number): number {
    return _id;
  }

  // Test helpers
  getCommands() {
    return this._commands;
  }
  getSettingTabs() {
    return this._settingTabs;
  }
}

// ----- TFile -----

export class TFile {
  path: string;
  basename: string;
  extension: string;
  name: string;
  parent: unknown | null;

  constructor(path: string) {
    this.path = path;
    this.name = path.split("/").pop() ?? path;
    this.basename = this.name.includes(".")
      ? this.name.slice(0, this.name.lastIndexOf("."))
      : this.name;
    this.extension = this.name.includes(".")
      ? this.name.slice(this.name.lastIndexOf(".") + 1)
      : "";
    this.parent = null;
  }
}

// ----- Notice -----

export class Notice {
  message: string;
  private static _instances: Notice[] = [];

  constructor(message: string) {
    this.message = message;
    Notice._instances.push(this);
  }

  /** Return all notices created since last reset */
  static getNotices(): Notice[] {
    return Notice._instances;
  }

  /** Clear notice history */
  static resetNotices(): void {
    Notice._instances = [];
  }
}

// ----- requestUrl -----

export type RequestUrlParam = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export type RequestUrlResponse = {
  text: string;
  status: number;
  json: () => unknown;
};

let _requestUrlImpl: (
  params: RequestUrlParam,
) => RequestUrlResponse | Promise<RequestUrlResponse> = (
  _params: RequestUrlParam,
) => ({
  text: "{}",
  status: 200,
  json: () => ({}),
});

export function requestUrl(
  params: RequestUrlParam,
): Promise<RequestUrlResponse> {
  const result = _requestUrlImpl(params);
  return Promise.resolve(result);
}

/** Override requestUrl behaviour in tests */
requestUrl.setMock = (fn: typeof _requestUrlImpl) => {
  _requestUrlImpl = fn;
};

/** Reset requestUrl to default no-op */
requestUrl.resetMock = () => {
  _requestUrlImpl = (_params: RequestUrlParam) => ({
    text: "{}",
    status: 200,
    json: () => ({}),
  });
};

// ----- PluginSettingTab -----

export class PluginSettingTab {
  app: App;
  plugin: Plugin;
  containerEl: HTMLElement;

  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
    // Guard against the missing DOM globals in a Node test environment.
    this.containerEl =
      typeof document !== "undefined" && typeof document.createElement === "function"
        ? document.createElement("div")
        : ({ tagName: "DIV" } as unknown as HTMLElement);
  }

  // Declarative (Obsidian 1.13.0) API stubs — overridden by subclasses.
  getSettingDefinitions(): unknown[] {
    return [];
  }

  getControlValue(_key: string): unknown {
    return undefined;
  }

  setControlValue(_key: string, _value: unknown): void {
    // no-op
  }

  update(): void {
    // no-op
  }

  display(): void {
    // override in subclass
  }
}

// ----- Setting -----

export class Setting {
  private _name = "";
  private _desc = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-unknown
  private _components: unknown[] = [];
  containerEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.containerEl = containerEl;
  }

  setName(name: string): this {
    this._name = name;
    return this;
  }

  setDesc(desc: string): this {
    this._desc = desc;
    return this;
  }

  addText(
    cb: (text: {
      setPlaceholder: (v: string) => typeof text;
      setValue: (v: string) => typeof text;
      onChange: (cb: (v: string) => void) => typeof text;
    }) => void,
  ): this {
    const textComponent = {
      setPlaceholder: (_v: string) => textComponent,
      setValue: (_v: string) => textComponent,
      onChange: (_cb: (v: string) => void) => textComponent,
    };
    cb(textComponent);
    this._components.push(textComponent);
    return this;
  }

  addToggle(
    cb: (toggle: {
      setValue: (v: boolean) => typeof toggle;
      onChange: (cb: (v: boolean) => void) => typeof toggle;
    }) => void,
  ): this {
    const toggleComponent = {
      setValue: (_v: boolean) => toggleComponent,
      onChange: (_cb: (v: boolean) => void) => toggleComponent,
    };
    cb(toggleComponent);
    this._components.push(toggleComponent);
    return this;
  }
}

// ----- Helpers -----

function createMockApp(): App {
  return {
    workspace: {
      getActiveFile: () => null,
    },
    vault: {
      read: async () => "",
      modify: async () => {},
    },
  };
}

/** Reset all global mock state (notices, requestUrl, plugin counters) */
export function resetMockState(): void {
  Notice.resetNotices();
  requestUrl.resetMock();
  _pluginInstanceCount = 0;
}
