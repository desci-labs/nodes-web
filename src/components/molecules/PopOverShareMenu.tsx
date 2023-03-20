import { getPublishedVersions, resolvePublishedManifest } from "@api/index";
import PaneInfo from "@components/atoms/PaneInfo";
import PopOverBasic from "@components/atoms/PopOverBasic";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import {
  ResearchObjectComponentType,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import {
  IconCode,
  IconCodeBracket,
  IconDocument,
  IconFile,
  IconNetwork,
} from "@icons";
import {
  ButtonHTMLAttributes,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SpinnerCircular } from "spinners-react";
import PerfectScrollbar from "react-perfect-scrollbar";
import toast from "react-hot-toast";
// import InputInsetLabelIcon from "@components/atoms/InputInsetLabelIcon";
import { useParams } from "react-router-dom";
import { useCopier } from "./Copier";
import { CheckIcon } from "@heroicons/react/outline";
import { useGetNodesQuery } from "@src/state/api/nodes";
import { useNodeReader, useNodeVersions } from "@src/state/nodes/hooks";

function CopyButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
    label: string;
  }
) {
  const { handleCopy, copied } = useCopier();

  return (
    <button
      {...props}
      className="text-sm font-bold text-white hover:text-tint-primary-hover disabled:text-neutrals-gray-4"
      onClick={() => handleCopy(props.value)}
    >
      {copied ? (
        <CheckIcon stroke="#28AAC4" strokeWidth={4} width={20} height={15} />
      ) : (
        props.label
      )}
    </button>
  );
}

function LinkCopier(
  props: PropsWithChildren<{ icon: JSX.Element; label: string; value: string }>
) {
  return (
    <div className="relative flex gap-2 p-2 w-full bg-white dark:bg-[#272727] border border-transparent border-b border-b-[#969696] rounded-md shadow-sm text-left focus:outline-none sm:text-sm">
      {props.icon}
      <div className="grow">
        <span className="block text-xs dark:text-gray-400">{props.label}</span>
        <span className="block text-xs">{props.value}</span>
      </div>
      <CopyButton label="Copy" value={props.value} disabled={!props.value} />
    </div>
  );
}

const PopOverShareMenu = () => {
  const {
    manifest: manifestData,
    currentObjectId,
    publicView,
  } = useNodeReader();
  const versions = useNodeVersions(currentObjectId);
  const { showShareMenu, setShowShareMenu } = useManuscriptController([
    "showShareMenu",
  ]);
  const [lastManifest, setLastManifest] = useState<
    ResearchObjectV1 | undefined
  >();

  // needed to refresh share popup after first publish
  const { data: nodeCollection } = useGetNodesQuery();
  const [numVersions, setNumVersions] = useState(-1);
  const [loading, setLoading] = useState(true);
  let params = useParams<any>();
  const versionParam = params[0]?.split("/")[1];
  const [requestedVersion, setRequestedVersion] = useState<number | undefined>(
    undefined
  );

  const versionForLink =
    publicView && versionParam ? versionParam : requestedVersion;

  const manifest = lastManifest ?? manifestData;
  const isDpidSupported = !!manifest?.dpid;
  const dpidLink = useMemo(
    () =>
      isDpidSupported
        ? `https://${
            manifest?.dpid?.prefix ? manifest?.dpid?.prefix + "." : ""
          }dpid.org/${manifest?.dpid?.id}/v${versionForLink || 1}`
        : `${window.location.protocol}//${window.location.host}/${currentObjectId}/${versionForLink}`,
    [
      currentObjectId,
      isDpidSupported,
      manifest?.dpid?.id,
      manifest?.dpid?.prefix,
      versionForLink,
    ]
  );
  const dpidSplit = dpidLink.split("/");
  const dpidLinkLatest = dpidSplit.slice(0, 4).join("/");
  console.log("CITE::", dpidLink, dpidSplit, dpidLinkLatest);

  useEffect(() => {
    setLoading(true);
    setLastManifest(undefined);
    // if (publishMap["force"]) {
    //   /**
    //    * Trigger share link update after publish
    //    */
    //   setRequestedVersion(undefined);
    //   const newPubMap = Object.assign({}, publishMap);
    //   delete newPubMap.force;
    //   setPublishMap(newPubMap);
    //   return;
    // }

    (async () => {
      try {
        console.log("Get Versions", currentObjectId);
        if (currentObjectId) {
          const versionData = await getPublishedVersions(currentObjectId!);
          console.log("published versions", versionData);
          setNumVersions(versionData.versions.length);
          if (requestedVersion === undefined) {
            setRequestedVersion(versionData.versions.length - 1);
          }
          const manifest = await resolvePublishedManifest(
            currentObjectId!,
            `${
              publicView && versionParam
                ? versionParam
                : versionData.versions.length - 1
            }`
          );
          setLastManifest(manifest);
        }
      } catch (e) {
        if (publicView) {
          toast.error("Not found please check URL", {
            position: "top-center",
            duration: 500000,
            style: {
              marginTop: 55,
              borderRadius: "10px",
              background: "#111",
              color: "#fff",
            },
          });
        }
        console.error("public version", e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentObjectId, nodeCollection, publicView, versions]);

  let body = (
    <div className="flex items-center justify-center h-full flex-grow">
      <SpinnerCircular color="white" secondaryColor="transparent" />
    </div>
  );
  if (!loading) {
    // debugger;
    if (lastManifest && currentObjectId && (publicView || versions)) {
      const versionCount = numVersions;
      body = (
        <PerfectScrollbar className="flex items-center w-full h-full flex-grow flex-col justify-evenly">
          {/* <div className="">Your Node is public</div> */}
          <div className="my-4 w-full">
            <LinkCopier
              icon={<IconNetwork height={15} stroke={"white"} width={15} />}
              label="Public Share Link (always points to latest version)"
              value={dpidLinkLatest}
            />
          </div>
          <div className="my-4 w-full">
            <LinkCopier
              icon={<IconNetwork height={15} stroke={"white"} width={15} />}
              label="Public Share Link (always points to latest version)"
              value={dpidLink}
            />
          </div>
          {versionCount ? (
            <div className="pb-4 w-full">
              {manifestData?.components.map((c, index: number) => {
                const fqi = isDpidSupported
                  ? `${lastManifest?.dpid?.id}/${versionForLink}/${index}`
                  : `${currentObjectId.replaceAll(
                      ".",
                      ""
                    )}/${versionForLink}/${index}`;

                const link = isDpidSupported
                  ? `${dpidLink}/${index}`
                  : `${window.location.protocol}//${window.location.host}/${fqi}`;

                switch (c.type) {
                  case ResearchObjectComponentType.CODE:
                    return (
                      <div className="my-2" key={`component-share-${c.id}`}>
                        <LinkCopier
                          icon={
                            <IconCodeBracket
                              height={12}
                              fill={"white"}
                              width={12}
                            />
                          }
                          label={`${c.name} Share Link`}
                          value={`${window.location.protocol}//${window.location.host}/${fqi}`}
                        />
                        <div className="mt-2 w-[90%] -right-[10%] relative">
                          <LinkCopier
                            icon={
                              <IconCode height={12} fill={"white"} width={12} />
                            }
                            label={`Import ${c.name} via desci-fetch`}
                            value={`with desci.fetch([('${c.name}.py', '${c.name}')], "${fqi}"):`}
                          />
                        </div>
                        <div className="mt-2 w-[90%] -right-[10%] relative">
                          <LinkCopier
                            icon={
                              <IconDocument
                                height={12}
                                fill={"white"}
                                width={12}
                              />
                            }
                            label={`Browse ${c.name} via HTTP`}
                            value={`${process.env.REACT_APP_NODES_API}/${fqi}/master/README.md?g=${process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE}`}
                          />
                        </div>
                      </div>
                    );
                  default:
                    return (
                      <div className="my-2" key={`component-share-${c.id}`}>
                        <LinkCopier
                          icon={
                            <IconFile height={12} fill={"white"} width={12} />
                          }
                          label={`${c.name} Share Link`}
                          value={link}
                        />
                      </div>
                    );
                }
              })}
            </div>
          ) : null}
        </PerfectScrollbar>
      );
    } else {
      body = (
        <div className="flex items-center h-full flex-grow flex-col justify-evenly">
          This Node is not published and cannot yet be shared
          <PaneInfo>Sharing unpublished Nodes is coming soon</PaneInfo>
        </div>
      );
    }
  }

  return (
    <PopOverBasic
      isVisible={showShareMenu}
      title="Share Node"
      onClose={() => {
        setShowShareMenu(false);
      }}
    >
      {body}
    </PopOverBasic>
  );
};

export default PopOverShareMenu;
