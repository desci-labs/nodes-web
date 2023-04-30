import cx from "classnames";
import { __log } from "@components/utils";
import SkeletonOrcid from "@components/atoms/SkeletonOrcid";

import OrcidLogo from "@images/orcid.png";
import { IconCircleCheck } from "@icons";
import { useSetter } from "@src/store/accessors";
import { setOrcid } from "@src/state/preferences/preferencesSlice";
import useCheckOrcid from "@src/hooks/useCheckOrcid";
import { useUser } from "@src/state/user/hooks";

const getBaseOrcIdButtonClass = ({ isConnected }: { isConnected: boolean }) =>
  cx(
    "flex w-full align-middle bg-neutrals-gray-1 py-2 px-[18px] border border-[#3C3C3C] rounded-lg text-base dark:text-neutrals-white ",
    {
      "hover:cursor-pointer hover:bg-gray-500": !isConnected,
      "hover:cursor-default": isConnected,
    }
  );

const OrcIdAuthButton = ({
  callback,
  action,
}: {
  callback?: any;
  onClick?: any;
  action?: "CONNECT" | "AUTH";
  active?: boolean;
  text?: any;
}) => {
  const userProfile = useUser();
  const dispatch = useSetter();
  const { orcidData, loading: orcidLoading } = useCheckOrcid();
  const handleClick = () => {
    if (orcidLoading) {
      return;
    }

    const nodesOrcEndpoint = action === "AUTH" ? "auth" : "connect";
    const baseUrl = `https://sandbox.orcid.org/oauth/authorize?client_id=${process.env.REACT_APP_ORCID_CLIENT_ID}&response_type=code&scope=/authenticate`;
    const redirectUri = `&redirect_uri=${process.env.REACT_APP_NODES_API}/v1/auth/orcid/${nodesOrcEndpoint}`;
    const url = `${baseUrl}${redirectUri}`;

    const popup = window.open(
      `${url}/close`,
      undefined,
      "height=600,width=600,status=yes,toolbar=no,menubar=no,location=no"
    );

    dispatch(setOrcid({ checking: true }));

    if (!popup) {
      window.open(url);
    } else {
      __log("URL", url + "/close");
      const timer = setInterval(async () => {
        if (popup.closed) {
          clearInterval(timer);
          dispatch(setOrcid({ checking: true }));
          // window.location.reload();
          // const res = await checkOrcid();
          callback && callback(orcidData);
        }
      }, 500);
    }
  };

  const isConnected = Boolean(userProfile?.profile.orcid);

  const AuthOrConnectButton = () =>
    action === "AUTH" ? (
      <AuthButton onClick={handleClick} isLoading={orcidLoading} />
    ) : (
      <ConnectButton onClick={handleClick} isLoading={orcidLoading} />
    );

  return isConnected ? <ConnectedButton /> : <AuthOrConnectButton />;
};

const ConnectedButton = () => (
  <button
    type="button"
    className={getBaseOrcIdButtonClass({ isConnected: true })}
  >
    <img
      alt="orcid logo"
      className="h-7 mr-2 align-text-bottom"
      src={OrcidLogo}
    />
    {/*
     ** NOTE: As discussed, we don't need to add disconnecting the ORCID for now
     */}
    <span className="mt-1">ORCID Connected</span>
    <div className="flex grow justify-end">
      <IconCircleCheck color={"#00A180"} className="w-8 h-8" fill={"#00A180"} />
    </div>
  </button>
);

const ConnectButton = ({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) => (
  <button
    type="button"
    onClick={() => {
      onClick();
    }}
    className={getBaseOrcIdButtonClass({ isConnected: false })}
  >
    <img
      alt="orcid logo"
      className="h-6 mr-2 inline-block align-text-bottom"
      src={OrcidLogo}
    />
    {isLoading ? <SkeletonOrcid className="mt-0.5 w-full" /> : "ORCID Connect"}
  </button>
);

const AuthButton = ({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) => (
  <button
    type="button"
    onClick={() => {
      onClick();
    }}
    className={getBaseOrcIdButtonClass({ isConnected: false })}
  >
    <img
      alt="orcid logo"
      className="h-6 mr-2 inline-block align-text-bottom"
      src={OrcidLogo}
    />
    {isLoading ? (
      <SkeletonOrcid className="mt-0.5 w-full" />
    ) : (
      "Login with OrcId"
    )}
  </button>
);

export default OrcIdAuthButton;
