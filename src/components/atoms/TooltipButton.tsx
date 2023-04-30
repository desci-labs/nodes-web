import {
  Side,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@components/atoms/tooltip";

interface TooltipButtonProps extends React.ComponentPropsWithRef<"button"> {
  tooltipContent: React.ReactNode;
  side?: Side
}

const TooltipButton = (props: TooltipButtonProps) => {
  const { tooltipContent, children, ...buttonProps } = props;
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger>
        <button {...buttonProps}>{children}</button>
      </TooltipTrigger>
        <TooltipContent side={props.side}>
            {tooltipContent}
            <TooltipArrow height={5} />
        </TooltipContent>
    </Tooltip>
  );
};

export default TooltipButton;
