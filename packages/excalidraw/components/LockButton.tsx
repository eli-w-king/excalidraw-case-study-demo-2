import clsx from "clsx";

import { t } from "../i18n";

import { IconButton } from "./IconButton";
import { LockedIcon, UnlockedIcon } from "./icons";

type LockButtonProps = {
  title?: string;
  checked: boolean;
  onChange?(): void;
  isMobile?: boolean;
  disabled?: boolean;
};

export const LockButton = (props: LockButtonProps) => {
  const label = t("toolBar.lockLabel");

  return (
    <IconButton
      className={clsx("ToolIcon__lock", { "is-mobile": props.isMobile })}
      type="toggle"
      icon={
        <>
          {props.checked ? LockedIcon : UnlockedIcon}
          <span>{label}</span>
        </>
      }
      checked={props.checked}
      disabled={props.disabled}
      title={`${props.title} · Q`}
      aria-label={label}
      data-testid="toolbar-lock"
      onSelect={() => props.onChange?.()}
    />
  );
};
