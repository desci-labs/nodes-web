import { getPublishedVersions, resolvePublishedManifest } from "@api/index";
import PaneInfo from "@components/atoms/PaneInfo";
import { ResearchObjectV1 } from "@desci-labs/desci-models";
import React, { useEffect, useMemo, useState } from "react";
import { SpinnerCircular } from "spinners-react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetNodesQuery } from "@src/state/api/nodes";
import { useNodeReader, useNodeVersions } from "@src/state/nodes/hooks";
import Copier from "@src/components/molecules/Copier";
import { FlexColumnCentered, FlexRowCentered } from "@src/components/styled";
import { IconCopyLink, IconTwitter } from "@src/icons";
import NodeMetadataPreview from "@src/components/molecules/NodeMetadataPreview";

// function CopyButton(
//   props: ButtonHTMLAttributes<HTMLButtonElement> & {
//     value: string;
//     label: string;
//   }
// ) {
//   const { handleCopy, copied } = useCopier();

//   return (
//     <button
//       {...props}
//       className="text-sm font-bold text-white hover:text-tint-primary-hover disabled:text-neutrals-gray-4"
//       onClick={() => handleCopy(props.value)}
//     >
//       {copied ? (
//         <CheckIcon stroke="#28AAC4" strokeWidth={4} width={20} height={15} />
//       ) : (
//         props.label
//       )}
//     </button>
//   );
// }

// function LinkCopier(
//   props: PropsWithChildren<{ icon: JSX.Element; label: string; value: string }>
// ) {
//   return (
//     <div className="relative flex gap-2 p-2 w-full bg-white dark:bg-[#272727] border border-transparent border-b border-b-[#969696] rounded-md shadow-sm text-left focus:outline-none sm:text-sm">
//       {props.icon}
//       <div className="grow">
//         <span className="block text-xs dark:text-gray-400">{props.label}</span>
//         <span className="block text-xs">{props.value}</span>
//       </div>
//       <CopyButton label="Copy" value={props.value} disabled={!props.value} />
//     </div>
//   );
// }

const shareCaption = "Check out this research:";
const getTwitterShareLink = (text: string) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

const SharePublished = React.memo(() => {
  const {
    manifest: manifestData,
    currentObjectId,
    publicView,
  } = useNodeReader();
  const versions = useNodeVersions(currentObjectId);
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
  // const [showAdvanced, setShowAdvanced] = useState(false);

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
  // console.log("CITE::", dpidLink, dpidSplit, dpidLinkLatest);

  useEffect(() => {
    setLoading(true);
    setLastManifest(undefined);

    (async () => {
      try {
        // console.log("Get Versions", currentObjectId);
        if (currentObjectId) {
          const versionData = await getPublishedVersions(currentObjectId!);
          // console.log("published versions", versionData);
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
        if (publicView && currentObjectId !== "drafts") {
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
        <div className="font-inter">
          {/* <div className="">Your Node is public</div> */}
          {/* <div className="my-4 w-full">
            <LinkCopier
              icon={<IconNetwork height={15} stroke={"white"} width={15} />}
              label="Public Share Link (always points to latest version)"
              value={dpidLinkLatest}
            />
          </div>
          <div className="my-4 w-full">
            <LinkCopier
              icon={<IconNetwork height={15} stroke={"white"} width={15} />}
              label="Public Share Link (always points to this version)"
              value={dpidLink}
            />
          </div> */}

          <FlexRowCentered className="mb-5">
            <NodeMetadataPreview
              uuid={currentObjectId}
              version={versionCount}
              dpidLink={dpidLinkLatest}
            />
          </FlexRowCentered>
          {/* <p className="text-center text-sm my-3">
            Share the published version of your Node.
          </p> */}
          <FlexRowCentered className="justify-center mt-8 mb-4">
            <FlexColumnCentered className="gap-1 max-w-[150px]">
              <a
                href={getTwitterShareLink(
                  `${shareCaption} ${manifest?.title} \n${dpidLinkLatest}`
                )}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full border border-social-twitter"
              >
                <IconTwitter className="fill-social-twitter" width={25} />
              </a>
              <p className="text-sm">Twitter</p>
            </FlexColumnCentered>
            <FlexColumnCentered className="gap-1 max-w-[150px]">
              <div className="flex items-center justify-center text-center border border-social-twitter text-sm rounded-full p-2">
                <Copier
                  text={dpidLinkLatest}
                  icon={(props) => (
                    <IconCopyLink
                      className="w-5 cursor-pointer fill-white h-5"
                      {...props}
                    />
                  )}
                />
              </div>
              <p className="text-sm">Copy dPID Link</p>
            </FlexColumnCentered>
          </FlexRowCentered>
          {/* <AdvancedSlideDown
            closed={showAdvanced}
            setClosed={setShowAdvanced}
            className="overflow-hidden mt-5"
          >

            <PerfectScrollbar className="overflow-auto h-full max-h-96">
              {versionCount ? (
                <div className="pb-4 w-full">
                  {manifestData?.components.map(
                    (c: ResearchObjectV1Component, index: number) => {
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
                            <div
                              className="my-2"
                              key={`component-share-${c.id}`}
                            >
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
                                    <IconCode
                                      height={12}
                                      fill={"white"}
                                      width={12}
                                    />
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
                            <div
                              className="my-2"
                              key={`component-share-${c.id}`}
                            >
                              <LinkCopier
                                icon={
                                  <IconFile
                                    height={12}
                                    fill={"white"}
                                    width={12}
                                  />
                                }
                                label={`${c.name} Share Link`}
                                value={link}
                              />
                            </div>
                          );
                      }
                    }
                  )}
                </div>
              ) : null}
            </PerfectScrollbar>
          </AdvancedSlideDown> */}
        </div>
      );
    } else {
      body = (
        <div className="flex items-center h-96 flex-grow flex-col justify-evenly">
          This Node is not published and cannot yet be shared
          <PaneInfo>Sharing unpublished Nodes is coming soon</PaneInfo>
        </div>
      );
    }
  }

  return body;
});

export default SharePublished;
