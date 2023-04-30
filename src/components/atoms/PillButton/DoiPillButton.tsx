import { IconDoi, IconViewLink } from "@icons";
import PillButton from "."
import OpenLinkPillButton from "./OpenLinkPillButton";

interface DoiPillButtonProps {
  link: string;
}

const DoiPillButton = (props: DoiPillButtonProps) => {
  const { link } = props
  return (
    <OpenLinkPillButton
      leftIcon={() => <IconDoi />}
      link={link}
    />
  )
}

export default DoiPillButton