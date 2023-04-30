import { Tooltip, TooltipContent, TooltipTrigger } from "@components/atoms/tooltip";

interface TooltipButtonProps extends React.ComponentPropsWithRef<"button"> {
  tooltipContent: React.ReactNode;
}

const TooltipButton = (props: TooltipButtonProps) => {
  const { tooltipContent, children, ...buttonProps } = props;
  return (
    <Tooltip>
      <TooltipTrigger>
        <button {...buttonProps}>{children}</button>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
};

export default TooltipButton;
