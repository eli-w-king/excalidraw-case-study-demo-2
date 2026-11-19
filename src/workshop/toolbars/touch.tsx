import { useId, useRef, useState } from "react";

import {
  DotsHorizontalIcon,
  LockedIcon,
  UnlockedIcon,
} from "@excalidraw/excalidraw/components/icons";
import {
  hideTooltip,
  showTooltip,
} from "@excalidraw/excalidraw/components/Tooltip";

import "./touch.css";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Big and touch friendly",
  idea: "A thumb-reachable dock keeps Select, Pan, Insert image, and Repeat tool visible above a labeled drawing grid on narrow screens.",
};

const repeatDescription =
  "Keep using the same tool after drawing so you can draw again without reselecting it.";

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

type TouchDockProps = ToolbarProps & {
  direction?: "repeat" | "shortcuts";
};

export default function TouchToolbar({
  appState,
  tools,
  locked,
  toggleLock,
  renderHint,
  direction,
}: TouchDockProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const moreId = useId();
  const repeatId = useId();
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
  const repeatTool = drawing.find(
    (tool) => tool.active && !tool.disabled && tool.type !== "freedraw",
  );
  const isFreeDrawing = appState.activeTool.type === "freedraw";
  const repeatLabel = repeatTool && (labels[repeatTool.type] ?? repeatTool.label);
  const selectionLabel =
    appState.preferredSelectionTool.type === "lasso" ? "Lasso" : "Select";

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
        aria-description={
          direction === "shortcuts"
            ? [
                descriptions[tool.type],
                tool.shortcut && `Shortcut: ${tool.shortcut}`,
              ]
                .filter(Boolean)
                .join(". ") || undefined
            : descriptions[tool.type]
        }
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
        {direction === "shortcuts" && showKeys && tool.keyHint && (
          <kbd className="touch-key-hint" aria-hidden="true">
            {tool.keyHint}
          </kbd>
        )}
      </button>
    );
  };

  return (
    <div
      className={
        direction ? `toolbar-touch toolbar-touch-${direction}` : "toolbar-touch"
      }
      role="group"
      aria-label={
        direction === "repeat"
          ? "Draw Again tools"
          : direction === "shortcuts"
          ? "Labels and Shortcuts tools"
          : "Touch tools"
      }
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
      <div className="touch-dock">
        <div className="touch-group" role="group" aria-label="Navigate">
          {objectSelection && toolButton(objectSelection)}
          {pan && toolButton(pan)}
        </div>
        <div
          className="touch-group"
          role="group"
          aria-label="Insert and options"
        >
          {image && toolButton(image)}
          {direction !== "repeat" && (
            <button
              type="button"
              aria-description={repeatDescription}
              aria-pressed={locked}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") {
                  showTooltip(event.currentTarget, repeatDescription, {
                    delay: true,
                    long: true,
                    position: "top",
                  });
                }
              }}
              onPointerLeave={hideTooltip}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) {
                  showTooltip(event.currentTarget, repeatDescription, {
                    long: true,
                    position: "top",
                  });
                }
              }}
              onBlur={hideTooltip}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  hideTooltip();
                }
              }}
              onPointerDown={hideTooltip}
              onClick={toggleLock}
            >
              <span aria-hidden="true">{locked ? LockedIcon : UnlockedIcon}</span>
              Repeat tool
              <span className="touch-repeat-state" aria-hidden="true">
                {locked ? "On" : "Off"}
              </span>
            </button>
          )}
          {direction === "shortcuts" && (
            <button
              type="button"
              data-option="shortcut-hints"
              aria-pressed={showKeys}
              onClick={() => setShowKeys(!showKeys)}
            >
              <span className="touch-keys-icon" aria-hidden="true">
                A
              </span>
              Shortcut hints
            </button>
          )}
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
        <div className="touch-group touch-draw" role="group" aria-label="Draw">
          {drawing.map((tool) => toolButton(tool))}
        </div>
        {direction === "repeat" && (
          <div
            className="touch-repeat-row"
            role="group"
            aria-label="After drawing"
          >
            <p id={repeatId}>
              {repeatLabel ? (
                <>
                  <strong>After drawing with {repeatLabel}</strong>
                  <span>
                    {locked
                      ? `Stay on ${repeatLabel}.`
                      : `Switch back to ${selectionLabel}.`}
                  </span>
                </>
              ) : (
                <>
                  <strong>After drawing</strong>
                  <span>
                    {isFreeDrawing
                      ? "Draw stays active without this option."
                      : "Pick a shape or text tool to set what happens next."}
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              data-option="draw-again"
              aria-pressed={locked}
              aria-describedby={repeatId}
              disabled={!repeatTool && !locked}
              onClick={toggleLock}
            >
              Draw again
              <span className="touch-repeat-state" aria-hidden="true">
                {locked ? "On" : "Off"}
              </span>
            </button>
          </div>
        )}
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
