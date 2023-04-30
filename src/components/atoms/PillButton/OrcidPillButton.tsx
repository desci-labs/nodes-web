import { IconOrcid } from "@icons";
import OpenLinkPillButton from "./OpenLinkPillButton";

interface OrcidPillButtonProps {
  link: string;
}

const OrcidPillButton = (props: OrcidPillButtonProps) => {
  const { link } = props
  return (
    <OpenLinkPillButton
      leftIcon={() => <IconOrcid />}
      link={link}
    />
  )
}

export default OrcidPillButton