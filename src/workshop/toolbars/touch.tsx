import { useId, useRef, useState } from "react";

import {
  DotsHorizontalIcon,
  LockedIcon,
  UnlockedIcon,
} from "@excalidraw/excalidraw/components/icons";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Big and touch friendly",
  idea: "A thumb-reachable dock separates Select from Pan and keeps Insert image one tap away.",
};

const labels: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "Select",
  hand: "Pan",
  freedraw: "Draw",
  image: "Insert image",
};

const descriptions: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "Select and move objects",
  hand: "Pan the canvas",
};

const navigationTargets: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "Objects",
  hand: "Canvas",
};

const styles = `
  /* The stock welcome arrows assume a top toolbar and a clear lower corner. */
  .excalidraw:has(.toolbar-touch) .welcome-screen-decor-hint--toolbar,
  .excalidraw:has(.toolbar-touch) .welcome-screen-decor-hint--help {
    display: none;
  }
  .toolbar-touch {
    /* Leave the footer and the lab pill (64px from the bottom, 38px tall) clear. */
    position: fixed;
    inset-inline: 12px;
    bottom: max(116px, calc(env(safe-area-inset-bottom) + 52px));
    width: fit-content;
    max-width: calc(100% - 24px);
    margin-inline: auto;
    color: var(--text-primary-color);
    font: 600 14px/1.15 var(--ui-font);
    pointer-events: var(--ui-pointerEvents);
  }
  .toolbar-touch .touch-dock,
  .toolbar-touch .touch-more {
    box-sizing: border-box;
    background: var(--island-bg-color);
    border: 1px solid var(--default-border-color);
    border-radius: 20px;
    box-shadow: var(--shadow-island);
  }
  .toolbar-touch .touch-dock {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    padding: 8px;
  }
  .toolbar-touch .touch-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    padding: 4px;
    border-radius: 13px;
    background: var(--color-surface-low);
  }
  .toolbar-touch button {
    box-sizing: border-box;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 62px;
    min-height: 68px;
    padding: 7px 8px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: var(--island-bg-color);
    color: inherit;
    font: inherit;
    white-space: nowrap;
    cursor: pointer;
    touch-action: manipulation;
  }
  .toolbar-touch button svg {
    display: block;
    width: 22px;
    height: 22px;
  }
  .toolbar-touch .touch-target {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.8;
  }
  .toolbar-touch button[data-tool="image"] {
    min-width: 106px;
    color: var(--color-on-primary-container);
    border-color: var(--color-primary);
  }
  .toolbar-touch button:hover:not(:disabled),
  .toolbar-touch button[aria-expanded="true"] {
    border-color: var(--color-primary);
  }
  .toolbar-touch button[aria-pressed="true"] {
    background: var(--color-surface-primary-container);
    color: var(--color-on-primary-container);
    border-color: var(--color-primary);
  }
  .toolbar-touch button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  .toolbar-touch button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .toolbar-touch .touch-more {
    position: absolute;
    z-index: 1;
    inset-inline-end: 0;
    bottom: calc(100% + 10px);
    width: max-content;
    max-width: 100%;
    max-height: min(320px, max(110px, calc(100dvh - 310px)));
    overflow: auto;
    padding: 12px;
  }
  .toolbar-touch .touch-more-heading {
    margin: 0 0 8px 4px;
  }
  .toolbar-touch .touch-hint .HintViewer {
    top: auto;
    bottom: calc(100% + 8px);
    margin: 0;
  }
  @media (max-width: 600px) {
    .toolbar-touch button {
      padding-inline: 6px;
    }
  }
`;

export default function TouchToolbar({
  tools,
  locked,
  toggleLock,
  renderHint,
}: ToolbarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreId = useId();
  const moreButton = useRef<HTMLButtonElement>(null);

  const objectSelection = tools.find((tool) => tool.type === "selection");
  const pan = tools.find((tool) => tool.type === "hand");
  const image = tools.find((tool) => tool.type === "image");
  const drawing = tools.filter(
    (tool) =>
      tool.group === "main" &&
      tool !== objectSelection &&
      tool !== pan &&
      tool.type !== "eraser",
  );
  const extra = tools.filter(
    (tool) =>
      tool.type === "eraser" || (tool.group === "more" && tool !== image),
  );

  const toolButton = (tool: ToolbarTool, inMore = false) => {
    const label = labels[tool.type] ?? tool.label;
    const description = descriptions[tool.type] ?? label;
    return (
      <button
        key={tool.type}
        type="button"
        data-tool={tool.type}
        title={
          tool.shortcut ? `${description} (${tool.shortcut})` : description
        }
        aria-description={descriptions[tool.type]}
        aria-pressed={tool.active}
        disabled={tool.disabled}
        onClick={() => {
          tool.select();
          setMoreOpen(false);
          if (inMore) {
            moreButton.current?.focus();
          }
        }}
      >
        <span aria-hidden="true">{tool.icon}</span>
        {label}
        {navigationTargets[tool.type] && (
          <span className="touch-target" aria-hidden="true">
            {navigationTargets[tool.type]}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className="toolbar-touch"
      role="group"
      aria-label="Touch tools"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setMoreOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && moreOpen) {
          event.stopPropagation();
          setMoreOpen(false);
          moreButton.current?.focus();
        }
      }}
    >
      <style>{styles}</style>
      <div className="touch-dock">
        <div className="touch-group" role="group" aria-label="Navigate">
          {objectSelection && toolButton(objectSelection)}
          {pan && toolButton(pan)}
        </div>
        <div className="touch-group" role="group" aria-label="Draw">
          {drawing.map((tool) => toolButton(tool))}
        </div>
        <div
          className="touch-group"
          role="group"
          aria-label="Insert and options"
        >
          {image && toolButton(image)}
          <button
            type="button"
            title="Keep the current tool selected after drawing"
            aria-pressed={locked}
            onClick={toggleLock}
          >
            <span aria-hidden="true">{locked ? LockedIcon : UnlockedIcon}</span>
            Keep tool
          </button>
          <button
            ref={moreButton}
            type="button"
            aria-expanded={moreOpen}
            aria-controls={moreOpen ? moreId : undefined}
            onClick={() => setMoreOpen(!moreOpen)}
          >
            <span aria-hidden="true">{DotsHorizontalIcon}</span>
            More tools
          </button>
        </div>
      </div>
      {moreOpen ? (
        <div
          id={moreId}
          className="touch-more"
          role="group"
          aria-label="More tools"
        >
          <p className="touch-more-heading" aria-hidden="true">
            More tools
          </p>
          <div className="touch-group">
            {extra.map((tool) => toolButton(tool, true))}
          </div>
        </div>
      ) : (
        <div className="touch-hint">{renderHint()}</div>
      )}
    </div>
  );
}
