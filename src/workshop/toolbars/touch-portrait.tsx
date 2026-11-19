import { useEffect, useId, useRef } from "react";

import {
  DotsHorizontalIcon,
  LockedIcon,
  UnlockedIcon,
} from "@excalidraw/excalidraw/components/icons";

import "./touch-portrait.css";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Portrait Dock",
  idea: "A two-row dock keeps everyday tools within thumb reach, with a second layer that names the active tool even when closed.",
};

const primary: readonly ToolbarTool["type"][] = [
  "selection",
  "hand",
  "image",
  "rectangle",
  "arrow",
  "text",
];

const labels: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "Select",
  hand: "Pan",
  image: "Insert image",
  freedraw: "Draw",
};

const purposes: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "objects",
  hand: "canvas",
};

const repeatDescription =
  "Keep the selected tool after drawing so you can draw again.";

export default function PortraitDock({
  app,
  tools,
  locked,
  toggleLock,
  renderHint,
}: ToolbarProps) {
  const dockRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const activeLabelId = useId();
  const secondary = tools.filter((tool) => !primary.includes(tool.type));
  const activeSecondary = secondary.find((tool) => tool.active);

  useEffect(() => {
    const doc = app.ownerDocument;
    const dismissOutside = (event: Event) => {
      const more = moreRef.current;
      if (more?.open && !dockRef.current?.contains(event.target as Node)) {
        more.open = false;
      }
    };

    doc.addEventListener("pointerdown", dismissOutside, true);
    doc.addEventListener("focusin", dismissOutside, true);
    return () => {
      doc.removeEventListener("pointerdown", dismissOutside, true);
      doc.removeEventListener("focusin", dismissOutside, true);
    };
  }, [app]);

  const closeMore = (returnFocus = false) => {
    if (moreRef.current?.open) {
      moreRef.current.open = false;
      if (returnFocus) {
        summaryRef.current?.focus();
      }
    }
  };

  const renderTool = (tool: ToolbarTool, inMore = false) => {
    const label = labels[tool.type] ?? tool.label;
    const purpose = purposes[tool.type];
    const name = purpose ? `${label} ${purpose}` : label;
    return (
      <button
        key={tool.type}
        className="portrait-control"
        type="button"
        data-tool={tool.type}
        aria-pressed={tool.active}
        disabled={tool.disabled}
        title={tool.shortcut ? `${name} (${tool.shortcut})` : name}
        onClick={() => {
          tool.select();
          closeMore(inMore);
        }}
      >
        <span aria-hidden="true">{tool.icon}</span>
        <span>
          {label}
          {purpose && <span className="portrait-detail"> {purpose}</span>}
        </span>
      </button>
    );
  };

  return (
    <div
      ref={dockRef}
      className="toolbar-touch-portrait"
      role="group"
      aria-label="Portrait Dock"
      onKeyDown={(event) => {
        if (event.key === "Escape" && moreRef.current?.open) {
          event.preventDefault();
          event.stopPropagation();
          closeMore(true);
        } else if (event.key === "Enter" || event.key === " ") {
          // Keep native control activation from also editing or panning the canvas.
          event.stopPropagation();
        }
      }}
    >
      {primary.map((type) => {
        const tool = tools.find((item) => item.type === type);
        return tool && renderTool(tool);
      })}
      <button
        className="portrait-control"
        type="button"
        data-tool="repeat"
        aria-pressed={locked}
        aria-description={repeatDescription}
        title={repeatDescription}
        onClick={() => {
          toggleLock();
          closeMore();
        }}
      >
        <span aria-hidden="true">{locked ? LockedIcon : UnlockedIcon}</span>
        <span>
          Repeat tool
          <span className="portrait-detail" aria-hidden="true">
            {locked ? "On" : "Off"}
          </span>
        </span>
      </button>
      <details ref={moreRef} className="portrait-more">
        <summary
          ref={summaryRef}
          className="portrait-control"
          data-tool="more"
          data-active-tool={activeSecondary?.type}
          aria-label="More tools"
          aria-describedby={activeSecondary ? activeLabelId : undefined}
          onClick={(event) => event.currentTarget.focus()}
        >
          <span aria-hidden="true">{DotsHorizontalIcon}</span>
          <span>
            More tools
            {activeSecondary && (
              <span id={activeLabelId} className="portrait-detail">
                Active: {labels[activeSecondary.type] ?? activeSecondary.label}
              </span>
            )}
          </span>
        </summary>
        <div
          className="portrait-sheet"
          role="group"
          aria-label="Secondary tools"
        >
          {secondary.map((tool) => renderTool(tool, true))}
        </div>
      </details>
      <div className="portrait-hint">{renderHint()}</div>
    </div>
  );
}
