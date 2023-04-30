import { SkeletonOrcid } from "@components/atoms/Skeleton";
import TooltipIcon from "@components/atoms/TooltipIcon";
import { useOrcidData } from "@src/state/preferences/hooks";

const WalletButton = ({ active, text, callback, onClick }: any) => {
  const { loading: orcidLoading } = useOrcidData();

  const Button = () => (
    <div
      // style={{color:'rgb(175, 204, 86)'}}
      // style={{ color: "rgb(87, 92, 128)" }}
      className="flex cursor-pointer font-extrabold w-30 text-gray-900 hover:bg-gray-400 bg-gray-300 py-0.5 px-4 border border-transparent rounded-md text-xs align-middle leading-7 tracking-wider"
    >
      {!active ? (
        <div className="bg-transparent text-center rounded-full h-6"></div>
      ) : (
        <></>
      )}
      {orcidLoading ? (
        <SkeletonOrcid className="mt-0.5 w-9" />
      ) : text ? (
        text
      ) : (
        "Connect Wallet"
      )}
    </div>
  );

  return !orcidLoading && !text ? (
    <TooltipIcon
      id="web3-wallet"
      tooltip={"Connect Wallet"}
      icon={<Button />}
    />
  ) : (
    <></>
  );
};

export default WalletButton;
