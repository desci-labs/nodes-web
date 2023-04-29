import React from "react";
import { CheckIcon, SwitchHorizontalIcon } from "@heroicons/react/solid";
import OrcidLogo from "../../../images/orcid.png";
import Logo from "../../../images/desci.png";
import Ethereum from "../../../images/eth-diamond-purple.png";

type Props = {
  wallet?: boolean;
};

const UserStatus = (props: Props) => {
  return (
    <div>
      <div className="flex justify-between">
        <img src={Logo} className="h-40" />
        <SwitchHorizontalIcon color="#ccc" className="w-10" />
        <img src={OrcidLogo} className="h-40" />
      </div>
      
      <img src={Logo} />
      <img src={Ethereum} />
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
      </div>
    </div>
  );
};

export default UserStatus;
