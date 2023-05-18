import PopOver from "@components/organisms/PopOver";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { BytesToHumanFileSize } from "@components/utils";
import { IconCopyLink, IconX } from "@icons";
import { ReactNode, useEffect, useState } from "react";
import Copier from "../Copier";
import useVersionDetails from "./useVersionDetails";
import { CHAINS } from "@connectors/../chains";
import { DEFAULT_CHAIN } from "../ConnectWithSelect";
import { useHistoryReader, useNodeReader } from "@src/state/nodes/hooks";
import { LinkIcon } from "@heroicons/react/solid";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import SlideDown from "react-slidedown";
import AdvancedSlideDown from "@src/components/atoms/AdvancedSlideDown";

const ACTIVE_CHAIN = CHAINS[DEFAULT_CHAIN] as any;
const BLOCK_EXPLORER_URL = ACTIVE_CHAIN && ACTIVE_CHAIN.blockExplorerUrls[0];

export default function PublicationDetailsModal(props: any) {
  const { showPublicationDetails, setShowPublicationDetails } =
    useManuscriptController(["showPublicationDetails"]);
  const { manifest: manifestData } = useNodeReader();
  const { selectedHistory } = useHistoryReader();

  const { size, copies, node, mirrors, loading } = useVersionDetails(
    selectedHistory?.data?.transaction?.id ?? ""
  );

  const [closed, setClosed] = useState(false);
  const onClose = () => {
    setClosed(false);
    setShowPublicationDetails(false);
  };

  const dpidLink = `https://${
    manifestData?.dpid?.prefix ? manifestData?.dpid?.prefix + "." : ""
  }dpid.org/${manifestData?.dpid?.id}/v${selectedHistory?.index || 1}`;

  const transactionReceiptUrl = `${
    BLOCK_EXPLORER_URL || "https://etherscan.io"
  }/tx/${selectedHistory?.data.transaction?.id}`;
  // debugger;

  const PRELOAD_CACHE: { [k: string]: any } = {
    "46": {
      2: { size: 265440000 },
      3: { size: 877960000 },
      4: { size: 877960000 },
      5: { size: 877960000 },
      6: { size: 877960000 },
      7: { size: 877960000 },
    },
  };

  const preloadCacheResult =
    manifestData &&
    manifestData.dpid &&
    manifestData.dpid.id &&
    selectedHistory &&
    selectedHistory.index &&
    PRELOAD_CACHE[manifestData!.dpid.id]?.[selectedHistory?.index]?.size;

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
      className="transition-all rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-x-hidden max-w-[450px] select-none px-4"
    >
      <div className="px-6 py-5 text-white" style={{ maxWidth: 600 }}>
        <div className="flex flex-row justify-between items-center mb-6">
          <div>
            <p className="text-lg font-bold">Publication details</p>
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
            title="Node dPID"
            subTitle={<Link href={dpidLink} />}
            copy={dpidLink}
            gradient={true}
          />
          <Details
            title="Node Size"
            subTitle="Size of the stored data published on this version of your node."
            detail={BytesToHumanFileSize(preloadCacheResult || size)}
            isLoading={loading}
          />
          <Details
            title="Data Copies"
            subTitle="Multiple archival copies of your Node are kept with automated integrity verification. "
            detail={(6).toString()}
            isLoading={loading}
          />
        </div>
        {/* <Divider />
        <div className="py-4 flex flex-col gap-5">
          <Details
            title="Storage Service"
            subTitle={<Link href="https://estuary.tech" />}
          />
        </div> */}
        <AdvancedSlideDown
          closed={closed}
          setClosed={setClosed}
          className="overflow-hidden"
        >
          <Divider />
          {loading ? (
            <>
              <DefaultSpinner size={32} color="white" />
            </>
          ) : (
            <div className="py-4 flex flex-col gap-5 select-none">
              <Details
                title="Node Metadata"
                subTitle={
                  <Link
                    href={`https://ipfs.io/ipfs/${selectedHistory?.data?.transaction?.cid}`}
                  />
                }
                copy={`https://ipfs.io/ipfs/${selectedHistory?.data?.transaction?.cid}`}
              />
              <Details
                title="Transaction Receipt"
                subTitle={<Link href={transactionReceiptUrl} />}
                copy={transactionReceiptUrl}
              />
            </div>
          )}
        </AdvancedSlideDown>
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
      className="text-tint-primary text-sm block w-[100%] truncate max-w-[500px] w-full"
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
  isLoading?: boolean;
  gradient?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-start justify-between ${
        props.gradient
          ? "bg-gradient-to-r from-black to-neutrals-gray-1 rounded-[4px] px-4 py-2 -my-2 -mx-4 pseudo-border mb-0"
          : "gap-1"
      }`}
    >
      <span className="text-lg font-bold">{props.title}</span>
      <div className="flex flex-col-reverse items-start md:flex-row lg:items-center justify-between gap-2 w-full">
        {typeof props.subTitle === "string" ? (
          <span
            className={`inline-block max-w-[400px] text-neutrals-gray-5 ${
              props.gradient ? "text-sm" : "text-xs"
            }`}
          >
            {props.subTitle}
          </span>
        ) : (
          props.subTitle
        )}
        <div className="flex gap-2 flex-none">
          {props.detail && (
            <div className="flex-none select-text -mt-6 items-center justify-center font-mono text-[10px] text-white text-center font-bold border-2 border-neutrals-gray-2 bg-black min-w-[80px] w-fit px-1 py-1 rounded-xl">
              {props.isLoading ? (
                <DefaultSpinner
                  height={16}
                  color="white"
                  className="w-[16px]"
                />
              ) : (
                props.detail
              )}
            </div>
          )}
          {props.copy && (
            <div className="flex -mt-4 items-center justify-center text-center border-none w-8 bg-black text-sm rounded-xl p-2">
              <Copier
                text={props.copy}
                icon={(props) => (
                  <IconCopyLink
                    className="w-8 cursor-pointer fill-white h-4"
                    {...props}
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
