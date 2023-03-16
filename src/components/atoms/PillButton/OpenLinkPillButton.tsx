import { IconViewLink } from "@icons";
import { useEffect } from "react";
import ReactTooltip from "react-tooltip";
import PillButton from ".";

interface OpenLinkPillButtonProps {
  leftIcon: React.FC;
  link: string;
  tooltip?: any;
  tooltipOptions?: any;
}

const OpenLinkPillButton = (props: OpenLinkPillButtonProps) => {
  const { leftIcon, link, tooltip, tooltipOptions } = props;
  const handleClick = () => {
    window.open(link);
  };
  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);
  return (
    <>
      <a
        href={link}
        rel="noreferrer"
        onClick={handleClick}
        target="_blank"
        data-tip={tooltip}
        {...tooltipOptions}
      >
        <PillButton
          leftIcon={leftIcon}
          rightIcon={() => <IconViewLink />}
          // onClick={handleClick}
        />
      </a>
    </>
  );
};

export default OpenLinkPillButton