import { QuestionMarkCircleIcon } from "@heroicons/react/solid";
import { uuid4 } from "@sentry/utils";
import React, { FC, useEffect } from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";
import ReactTooltip, { Offset } from "react-tooltip";

interface TooltipIconProps {
  tooltip: string;
  icon: ReactElement;
  id?: string;
  placement?: "top" | "left" | "right" | "bottom" | undefined;
  tooltipProps?: any;
  className?: string;
  tipClassName?: string;
  offset?: Offset;
  onClick?: (e: React.MouseEvent) => void;
}

export default function TooltipIcon(props: TooltipIconProps) {
  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);
  /**
   * To prevent layout errors when navigating between many tooltips,
   * generate a uuid and assign it to a specific tooltip renderer for this component
   */
  const id = uuid4();
  return (
    <>
      <ReactTooltip
        effect="solid"
        id={id}
        offset={props.offset}
        className={props.tipClassName}
      />
      <button
        data-tip={props.tooltip}
        data-place={props.placement}
        data-for={id}
        onClick={props.onClick}
        className="outline-none"
        {...(props.tooltipProps || { "data-background-color": "black" })}
        type="button"
      >
        {props.icon}
      </button>
    </>
  );
}
