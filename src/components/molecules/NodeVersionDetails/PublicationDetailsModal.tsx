import PopOver from "@components/organisms/PopOver";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { BytesToHumanFileSize } from "@components/utils";
import { IconX } from "@icons";
import { ReactNode } from "react";
import Copier from "../Copier";
import useVersionDetails from "./useVersionDetails";
import { CHAINS } from "@connectors/../chains";
import { DEFAULT_CHAIN } from "../ConnectWithSelect";
import { useNodeReader, useNodeVersionHistory } from "@src/state/nodes/hooks";

const ACTIVE_CHAIN = CHAINS[DEFAULT_CHAIN] as any;
const BLOCK_EXPLORER_URL = ACTIVE_CHAIN && ACTIVE_CHAIN.blockExplorerUrls[0];

export default function PublicationDetailsModal(props: any) {
  const { showPublicationDetails, setShowPublicationDetails } =
    useManuscriptController(["showPublicationDetails"]);
  const { manifest: manifestData } = useNodeReader();
  const { selectedHistory } = useNodeVersionHistory();

  const { size, copies, node } = useVersionDetails(
    selectedHistory?.data?.transaction?.id ?? ""
  );

  const onClose = () => {
    setShowPublicationDetails(false);
  };

  const dpidLink = `https://${
    manifestData?.dpid?.prefix ? manifestData?.dpid?.prefix + "." : ""
  }dpid.org/${manifestData?.dpid?.id}/v${selectedHistory?.index || 1}`;

  const transactionReceiptUrl = `${
    BLOCK_EXPLORER_URL || "https://etherscan.io"
  }/tx/${selectedHistory?.data.transaction?.id}`;
  return (
    <PopOver
      {...props}
      zIndex={999999}
      containerStyle={{
        backgroundColor: "#3A3A3ABF",
      }}
      onClose={onClose}
      isVisible={showPublicationDetails}
      displayCloseIcon={true}
      className="transition-all rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-x-hidden max-w-[450px]"
    >
      <div className="px-6 py-5 text-white" style={{ maxWidth: 600 }}>
        <div className="flex flex-row justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold">Publication details</p>
            <p className="text-neutrals-gray-5 text-sm">
              Publication date:{" "}
              {selectedHistory &&
                new Date(
                  (() => {
                    // debugger;
                    return false;
                  })() || (selectedHistory.data as any).date
                ).toLocaleString()}{" "}
            </p>
          </div>
          <IconX
            fill="white"
            width={20}
            height={20}
            className="cursor-pointer absolute top-5 right-5"
            onClick={onClose}
          />
        </div>
        <div className="py-4 flex flex-col gap-5">
          <Details
            title="Node Size"
            subTitle="Size of the stored data published on this version of your node."
            detail={BytesToHumanFileSize(size)}
          />
          <Details
            title="Data Copies"
            subTitle="We've made several copies of your node so that you can always access your data."
            detail={(copies || 6).toString()}
          />
        </div>
        <Divider />
        <div className="py-4 flex flex-col gap-5">
          <Details
            title="Storage Service"
            subTitle={<Link href="https://estuary.tech" />}
          />
        </div>
        <Divider />
        <div className="py-4 flex flex-col gap-5">
          <Details
            title="Node Root CID"
            subTitle={
              <Link href={`https://ipfs.io/ipfs/${node?.manifestUrl}`} />
            }
            copy={`https://ipfs.io/ipfs/${node?.manifestUrl}`}
          />
          <Details
            title="Transaction Receipt"
            subTitle={<Link href={transactionReceiptUrl} />}
            copy={transactionReceiptUrl}
          />
          <Details
            title="Node dPID"
            subTitle={<Link href={dpidLink} />}
            copy={dpidLink}
          />
        </div>
      </div>
    </PopOver>
  );
}

const Divider = () => (
  <div className="w-full bg-neutrals-gray-3 h-[1px] my-5"></div>
);

function Link(props: { href: string }) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noreferrer"
      className="text-primary text-sm block w-[100%] truncate max-w-[500px] w-full"
    >
      {props.href}
    </a>
  );
}

function Details(props: {
  title: string;
  subTitle: string | ReactNode;
  detail?: string;
  copy?: string;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-2">
      <span className="text-lg font-bold">{props.title}</span>
      <div className="flex flex-col-reverse items-start md:flex-row lg:items-center justify-between gap-2 md:gap-4 w-full">
        {typeof props.subTitle === "string" ? (
          <span className="inline-block text-neutrals-gray-5 text-sm">
            {props.subTitle}
          </span>
        ) : (
          props.subTitle
        )}
        <div className="flex gap-2 flex-none">
          {props.detail && (
            <div className="flex-none text-xs text-white text-center font-bold border-2 border-neutrals-gray-3 bg-black min-w-16 w-24 px-2 py-2 rounded-xl">
              {props.detail}
            </div>
          )}
          {props.copy && <Copier text={props.copy} />}
        </div>
      </div>
    </div>
  );
}
