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

  useEffect(() => {
    setLoading(true);
    setLastManifest(undefined);

    (async () => {
      try {
        if (currentObjectId) {
          const versionData = await getPublishedVersions(currentObjectId!);
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
    if (lastManifest && currentObjectId && (publicView || versions)) {
      const versionCount = numVersions;
      body = (
        <div className="font-inter">
          <FlexRowCentered className="mb-5">
            <NodeMetadataPreview
              uuid={currentObjectId}
              version={versionCount}
              dpidLink={dpidLinkLatest}
            />
          </FlexRowCentered>
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
