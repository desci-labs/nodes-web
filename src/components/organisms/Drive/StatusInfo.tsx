import { useEffect } from "react";
import ReactTooltip from "react-tooltip";
import { AccessStatus } from "./types";

export function pubStatusTooltip(accessStatus: AccessStatus) {
  switch (accessStatus) {
    case AccessStatus.PUBLIC:
      return "Committed node component. Published publicly on IPFS";
    case AccessStatus.PRIVATE:
      return "Uncommitted node component. Uploaded privately on IPFS";
    case AccessStatus.PARTIAL:
      return "Node or folder includes public and private components";
  }
}

export default function StatusInfo() {
  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);

  return (
    <ReactTooltip
      id="status"
      place="bottom"
      backgroundColor="black"
      // effect="solid"
    >
      <strong>Public:</strong> {pubStatusTooltip(AccessStatus.PUBLIC)}
      <br />
      <strong>Private:</strong> {pubStatusTooltip(AccessStatus.PRIVATE)} <br />
      <strong>Partial:</strong> {pubStatusTooltip(AccessStatus.PARTIAL)}
    </ReactTooltip>
  );
}
