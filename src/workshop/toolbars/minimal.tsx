import {
  hideTooltip,
  showTooltip,
} from "@excalidraw/excalidraw/components/Tooltip";
import { useEffect, useId, useRef, useState } from "react";

import type { ButtonHTMLAttributes } from "react";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Minimal and calm",
  idea: "Four labeled essentials stay visible; More tools holds the rest, and Repeat tool makes retention explicit.",
};

const essentials: ToolbarTool["type"][] = [
  "selection",
  "rectangle",
  "arrow",
  "text",
];

const toolLabel = (tool: ToolbarTool) => {
  switch (tool.type) {
    case "selection":
      return "Select";
    case "hand":
      return "Pan canvas";
    default:
      return tool.label;
  }
};

const tooltip = (
  name: string,
  shortcut = "Enter or Space when focused",
): ButtonHTMLAttributes<HTMLButtonElement> => {
  const label = `${name} (${shortcut})`;
  return {
    "aria-description": shortcut,
    onPointerEnter: (event) => {
      if (event.pointerType !== "touch") {
        showTooltip(event.currentTarget, label, { delay: true });
      }
    },
    onPointerLeave: hideTooltip,
    onFocus: (event) => {
      if (event.currentTarget.matches(":focus-visible")) {
        showTooltip(event.currentTarget, label);
      }
    },
    onBlur: hideTooltip,
    onPointerDown: hideTooltip,
  };
};

const styles = `
  .toolbar-minimal {
    color: var(--text-primary-color);
    font-size: 0.8125rem;
  }
  .toolbar-minimal :is(.minimal-bar, .minimal-panel) {
    box-sizing: border-box;
    background: var(--island-bg-color);
    border: 1px solid var(--color-surface-low);
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px #0000000c;
  }
  .toolbar-minimal .minimal-bar {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem;
  }
  .toolbar-minimal button {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2.375rem;
    padding: 0.25rem 0.625rem;
    border: 0;
    border-radius: 0.5rem;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 500;
    text-align: start;
    white-space: nowrap;
    cursor: pointer;
  }
  .toolbar-minimal button:not(:disabled):hover {
    background: var(--color-surface-mid);
  }
  .toolbar-minimal button:is([aria-pressed="true"], [aria-expanded="true"], [data-current]):not(:disabled) {
    background: var(--color-surface-high);
    box-shadow: inset 0 0 0 1px var(--color-surface-primary-container);
  }
  .toolbar-minimal button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
  .toolbar-minimal button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .toolbar-minimal .minimal-icon {
    display: inline-flex;
    flex-shrink: 0;
  }
  .toolbar-minimal .minimal-icon svg {
    width: 1rem;
    height: 1rem;
  }
  .toolbar-minimal .minimal-divider {
    border-inline-start: 1px solid var(--color-surface-low);
    padding-inline-start: 0.25rem;
  }
  .toolbar-minimal .minimal-repeat-state {
    min-width: 1.75rem;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    background: var(--color-surface-mid);
    font-size: 0.6875rem;
    text-align: center;
  }
  .toolbar-minimal [aria-pressed="true"] .minimal-repeat-state {
    background: var(--color-surface-primary-container);
  }
  .toolbar-minimal .minimal-panel {
    position: absolute;
    z-index: 1;
    inset-inline: 0;
    top: calc(100% + 0.375rem);
    max-height: min(20rem, 55vh);
    overflow: auto;
    padding: 0.5rem;
  }
  .toolbar-minimal .minimal-panel-label {
    margin: 0.25rem 0.625rem 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .toolbar-minimal .minimal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 0.125rem;
  }
  .toolbar-minimal .minimal-grid button {
    white-space: normal;
  }
  .toolbar-minimal .minimal-current {
    padding-top: 0.375rem;
    text-align: center;
    font-size: 0.75rem;
  }
  @media (max-width: 700px) {
    .toolbar-minimal .minimal-bar {
      flex-wrap: wrap;
      justify-content: center;
      max-width: calc(100vw - 5rem);
    }
  }
`;

export default function MinimalToolbar({
  app,
  tools,
  locked,
  toggleLock,
  renderHint,
}: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const repeatDescriptionId = useId();
  const extraTools = tools.filter((tool) => !essentials.includes(tool.type));
  const image = extraTools.find((tool) => tool.type === "image");
  const activeExtra = extraTools.find((tool) => tool.active);
  const ownerDocument = app.ownerDocument;

  useEffect(() => {
    if (!open) {
      return;
    }
    const dismissOutside = (event: Event) => {
      if (!barRef.current?.contains(event.target as Node)) {
        hideTooltip();
        setOpen(false);
      }
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        hideTooltip();
        setOpen(false);
        moreRef.current?.focus();
      }
    };
    ownerDocument.addEventListener("pointerdown", dismissOutside, true);
    ownerDocument.addEventListener("focusin", dismissOutside);
    ownerDocument.addEventListener("keydown", dismissOnEscape, true);
    return () => {
      ownerDocument.removeEventListener("pointerdown", dismissOutside, true);
      ownerDocument.removeEventListener("focusin", dismissOutside);
      ownerDocument.removeEventListener("keydown", dismissOnEscape, true);
    };
  }, [open, ownerDocument]);

  const renderTool = (tool: ToolbarTool, disclosed = false) => {
    const label = toolLabel(tool);
    return (
      <button
        {...tooltip(label, tool.shortcut ?? undefined)}
        key={tool.type}
        type="button"
        aria-pressed={tool.active}
        disabled={tool.disabled}
        onClick={() => {
          hideTooltip();
          if (disclosed) {
            moreRef.current?.focus();
          }
          setOpen(false);
          tool.select();
        }}
      >
        <span className="minimal-icon" aria-hidden="true">
          {tool.icon}
        </span>
        {label}
      </button>
    );
  };

  return (
    <div className="toolbar-minimal">
      <style>{styles}</style>
      <div
        ref={barRef}
        className="minimal-bar"
        role="group"
        aria-label="Drawing tools"
      >
        {essentials.map((type) => {
          const tool = tools.find((candidate) => candidate.type === type);
          return tool && renderTool(tool);
        })}
        <div className="minimal-divider">
          <button
            {...tooltip("More tools")}
            ref={moreRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            data-current={activeExtra ? "" : undefined}
            onClick={() => {
              hideTooltip();
              setOpen(!open);
            }}
          >
            More tools
            <svg
              aria-hidden="true"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              style={{ transform: open ? "rotate(180deg)" : undefined }}
            >
              <path
                d="m3 4.5 3 3 3-3"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div
            id={panelId}
            className="minimal-panel"
            role="group"
            aria-label="More tools"
            hidden={!open}
          >
            <p className="minimal-panel-label" aria-hidden="true">
              More tools
            </p>
            <div className="minimal-grid">
              {image && renderTool(image, true)}
              {extraTools
                .filter((tool) => tool.type !== "image")
                .map((tool) => renderTool(tool, true))}
            </div>
          </div>
        </div>
        {app.props.activeTool == null && (
          <div className="minimal-divider">
            <button
              {...tooltip("Repeat tool", "Q")}
              type="button"
              aria-pressed={locked}
              aria-describedby={repeatDescriptionId}
              onClick={() => {
                hideTooltip();
                toggleLock();
              }}
            >
              Repeat tool
              <span className="minimal-repeat-state" aria-hidden="true">
                {locked ? "On" : "Off"}
              </span>
            </button>
            <span id={repeatDescriptionId} hidden>
              Keep the selected tool active after drawing. Shortcut: Q.
            </span>
          </div>
        )}
      </div>
      {activeExtra && (
        <div className="minimal-current" role="status">
          Active tool: {toolLabel(activeExtra)}
        </div>
      )}
      {renderHint()}
    </div>
  );
}
