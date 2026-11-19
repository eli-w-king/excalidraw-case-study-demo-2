import TouchToolbar from "./touch";

import "./touch-shortcuts.css";

import type { ToolbarMeta, ToolbarProps } from "../types";

export const meta: ToolbarMeta = {
  name: "Labels + Shortcuts",
  idea: "Keep plain-language labels and reveal shortcut keys inside the existing buttons, without widening the dock.",
};

export default function TouchShortcutsToolbar(props: ToolbarProps) {
  return <TouchToolbar {...props} direction="shortcuts" />;
}
