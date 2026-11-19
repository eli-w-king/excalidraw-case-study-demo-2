import { getShortcutFromShortcutName } from "@excalidraw/excalidraw/actions/shortcuts";
import {
  LibraryIcon,
  LockedIcon,
  RedoIcon,
  UndoIcon,
  UnlockedIcon,
  searchIcon,
} from "@excalidraw/excalidraw/components/icons";
import { TOOLS } from "@excalidraw/excalidraw/components/Tools";
import { t } from "@excalidraw/excalidraw/i18n";
import { getShortcutKey } from "@excalidraw/excalidraw/shortcut";

import type { ReactNode } from "react";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Dense for power users",
  idea: "Every tool and its real shortcuts at a glance, with tool retention and everyday commands in the same compact strip.",
};

const groups = {
  Navigate: ["selection", "lasso", "hand"],
  Geometry: ["rectangle", "diamond", "ellipse", "arrow", "line"],
  Ink: ["freedraw", "autoshape", "eraser"],
  Insert: ["text", "stickynote", "image", "embeddable"],
  Canvas: ["frame", "bucketfill", "laser"],
} satisfies Record<string, ToolbarTool["type"][]>;

const shortLabels: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "Select",
  lasso: "Lasso",
  hand: "Pan",
  image: "Image",
  frame: "Frame",
  bucketfill: "Fill",
  laser: "Laser",
};

const styles = `
  /* The taller strip overlaps the stock welcome callouts. */
  .App-menu_top:has(.toolbar-dense) :is(
    .welcome-screen-decor-hint--toolbar,
    .welcome-screen-decor-hint--menu
  ) {
    display: none;
  }
  .toolbar-dense {
    display: grid;
    gap: 5px;
    inline-size: min(884px, calc(100vw - 224px));
    box-sizing: border-box;
    padding: 6px;
    border: 1px solid var(--sidebar-border-color);
    border-radius: 12px;
    background: var(--island-bg-color);
    color: var(--text-primary-color);
    box-shadow: var(--shadow-island);
  }
  .toolbar-dense .dense-row,
  .toolbar-dense .dense-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .toolbar-dense .dense-group {
    flex: 1 1 auto;
    min-inline-size: 0;
    padding: 4px;
    border-radius: 7px;
    background: var(--color-surface-low, var(--default-border-color));
  }
  .toolbar-dense .dense-heading {
    margin: 0 0 3px;
    padding-inline: 5px;
    font: 700 10px/13px system-ui, sans-serif;
    letter-spacing: .075em;
    text-transform: uppercase;
    color: var(--color-on-surface-variant, var(--text-primary-color));
  }
  .toolbar-dense .dense-button {
    flex: 1 0 auto;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 3px;
    min-inline-size: 40px;
    min-block-size: 39px;
    padding: 3px 4px;
    border: 1px solid transparent;
    border-radius: 5px;
    background: var(--island-bg-color);
    color: inherit;
    font: 600 11px/13px system-ui, sans-serif;
    white-space: nowrap;
    cursor: pointer;
  }
  .toolbar-dense .dense-button:hover:not(:disabled) {
    background: var(--button-hover-bg);
  }
  .toolbar-dense .dense-button[aria-pressed="true"] {
    background: var(--color-surface-primary-container);
    border-color: var(--color-brand-active, var(--color-primary));
  }
  .toolbar-dense .dense-button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
  .toolbar-dense .dense-button:disabled {
    opacity: .48;
    cursor: default;
  }
  .toolbar-dense .dense-symbols {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-block-size: 16px;
  }
  .toolbar-dense .dense-symbols svg {
    display: block;
    inline-size: 15px;
    block-size: 15px;
  }
  .toolbar-dense .dense-symbols kbd {
    min-inline-size: 9px;
    padding-inline: 2px;
    border: 1px solid var(--sidebar-border-color);
    border-radius: 3px;
    background: var(--island-bg-color);
    color: var(--text-primary-color);
    font: 600 10px/13px ui-monospace, monospace;
    text-align: center;
  }
  @media (min-width: 1108px) {
    .toolbar-dense .dense-row {
      display: grid;
      grid-template-columns: 1fr 1.9fr 1.45fr;
    }
    .toolbar-dense .dense-row + .dense-row {
      grid-template-columns: 1.65fr .9fr 2.45fr;
    }
  }
  @media (max-width: 760px) {
    .toolbar-dense {
      inline-size: calc(100vw - 124px);
    }
  }
`;

function Command({
  label,
  title = label,
  icon,
  keys = [],
  pressed,
  disabled,
  onClick,
  tool,
}: {
  label: string;
  title?: string;
  icon: ReactNode;
  keys?: string[];
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  tool?: ToolbarTool["type"];
}) {
  return (
    <button
      type="button"
      className="dense-button"
      data-tool={tool}
      title={keys.length ? `${title} (${keys.join(" / ")})` : title}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="dense-symbols">
        <span aria-hidden="true">{icon}</span>
        {keys.map((key) => (
          <kbd key={key}>{key}</kbd>
        ))}
      </span>
      <span>{label}</span>
    </button>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="dense-group" role="group" aria-label={label}>
      <p className="dense-heading" aria-hidden="true">
        {label}
      </p>
      <div className="dense-buttons">{children}</div>
    </div>
  );
}

function toolKeys(
  type: ToolbarTool["type"],
  preferred: ToolbarProps["appState"]["preferredSelectionTool"]["type"],
) {
  if ((type === "selection" || type === "lasso") && type !== preferred) {
    return [];
  }
  const { letterKey, shiftKey, numericKey } = TOOLS[
    type === "lasso" ? "selection" : type
  ];
  const letters = typeof letterKey === "string" ? [letterKey] : letterKey ?? [];
  const keys = letters.map((key) =>
    getShortcutKey(`${shiftKey ? "Shift+" : ""}${key.toUpperCase()}`),
  );
  return numericKey == null ? keys : [...keys, numericKey];
}

export default function DenseToolbar({
  tools,
  app,
  appState,
  locked,
  toggleLock,
  openLibrary,
  openCommandPalette,
  undo,
  redo,
  renderHint,
}: ToolbarProps) {
  const renderGroup = (group: keyof typeof groups) => (
    <Group label={group}>
      {groups[group].map((type) => {
        const tool = tools.find((entry) => entry.type === type);
        return (
          tool && (
            <Command
              key={type}
              tool={type}
              label={shortLabels[type] ?? tool.label}
              title={tool.label}
              icon={tool.icon}
              keys={toolKeys(type, appState.preferredSelectionTool.type)}
              pressed={tool.active}
              disabled={tool.disabled}
              onClick={tool.select}
            />
          )
        );
      })}
    </Group>
  );

  return (
    <div className="App-toolbar-content">
      <style>{styles}</style>
      <div className="toolbar-dense" role="region" aria-label={meta.name}>
        <div className="dense-row">
          {renderGroup("Navigate")}
          {renderGroup("Geometry")}
          {renderGroup("Ink")}
        </div>
        <div className="dense-row">
          {renderGroup("Insert")}
          {renderGroup("Canvas")}
          <Group label="Workflow">
            <Command
              label={t("toolBar.lockLabel")}
              title={t("toolBar.lock")}
              icon={locked ? LockedIcon : UnlockedIcon}
              keys={[getShortcutFromShortcutName("toolLock")]}
              pressed={locked}
              disabled={app.props.activeTool != null}
              onClick={toggleLock}
            />
            <Command
              label={t("buttons.undo")}
              icon={UndoIcon}
              keys={[getShortcutKey("CtrlOrCmd+Z")]}
              onClick={undo}
            />
            <Command
              label={t("buttons.redo")}
              icon={RedoIcon}
              keys={[getShortcutKey("CtrlOrCmd+Shift+Z")]}
              onClick={redo}
            />
            <Command
              label={t("toolBar.library")}
              icon={LibraryIcon}
              onClick={openLibrary}
            />
            <Command
              label="Commands"
              title={t("commandPalette.title")}
              icon={searchIcon}
              keys={[getShortcutFromShortcutName("commandPalette")]}
              onClick={openCommandPalette}
            />
          </Group>
        </div>
      </div>
      {renderHint()}
    </div>
  );
}
