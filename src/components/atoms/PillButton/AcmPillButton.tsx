import { IconAcm } from "@icons";
import OpenLinkPillButton from "./OpenLinkPillButton";

interface AcmPillButtonProps {
  link: string;
}

const AcmPillButton = (props: AcmPillButtonProps) => {
  const { link } = props
  return (
    <OpenLinkPillButton
      leftIcon={() => <img src={IconAcm} style={{width: 22}} />}
      link={link}
    />
  )
}

export default AcmPillButton