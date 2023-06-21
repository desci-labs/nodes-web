import {
  ResearchObjectV1,
  RESEARCH_OBJECT_NODES_PREFIX,
} from "@desci-labs/desci-models";
import {
  getPublishedVersions,
  getRecentPublishedManifest,
  getResearchObjectStub,
  resolvePrivateResearchObjectStub,
  resolvePublishedManifest,
  verifyPrivateShareLink,
} from "@src/api";
import axios from "axios";
import { LoaderFunctionArgs, Outlet, Params } from "react-router-dom";
import { cleanupManifestUrl, convertHexToCID } from "../utils";
import { ReaderMode } from "@src/state/nodes/nodeReader";

export type ManuscriptLoaderData =
  | {
      cid: string;
      manifestUrl: string;
      manifest: ResearchObjectV1;
      mode: ReaderMode;
      params: Params<string>;
      shareId?: string;
    }
  | {
      mode: "reader";
      uuid: string;
      version: string;
      componentIndex: string;
      annotationIndex: string;
      manifest: ResearchObjectV1;
      params: Params<string>;
      manifestUrl: string;
    }
  | {
      error: boolean;
      reason: string;
      data?: string;
    };

export const manuscriptLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<ManuscriptLoaderData> => {
  const splet = params["*"];
  try {
    if (!!params.cid) {
      if (params.cid.includes("start"))
        throw Error("New Research object detected.");
      let researchObject = `${RESEARCH_OBJECT_NODES_PREFIX}${params.cid}`;
      const res: any = await getResearchObjectStub(researchObject);
      const cidUri = res.uri || res.manifestUrl;
      const manifestUrl = cleanupManifestUrl(cidUri);
      let manifest = res.manifestData;
      if (!manifest) {
        const { data } = await axios.get(manifestUrl);
        manifest = data;
      }
      return {
        cid: params.cid,
        manifest,
        manifestUrl,
        params,
        mode: "editor",
      };
    } else if (params.shareId) {
      let shareId = params.shareId; // TODO: store in session storage
      const data: any = await verifyPrivateShareLink(shareId);
      const privateShare = data?.share;

      if (!privateShare) {
        throw new Error("Cannot resolve share link");
      }
      const nodeUUID = privateShare.nodeUUID;
      let cid = nodeUUID.substring(0, nodeUUID.length - 1);
      let researchObject = `${RESEARCH_OBJECT_NODES_PREFIX}${cid}`;
      const res: any = await resolvePrivateResearchObjectStub(
        researchObject,
        shareId
      );
      const cidUri = res.uri || res.manifestUrl;
      const manifestUrl = cleanupManifestUrl(cidUri);
      let manifest = res.manifestData;
      if (!manifest) {
        const { data } = await axios.get(manifestUrl);
        manifest = data;
      }
      return {
        cid,
        manifest,
        manifestUrl,
        params,
        mode: "reader",
        shareId,
      };
    } else if (splet) {
      const [uuid, version, componentIndex, annotationIndex] = splet.split("/");

      const manifest: ResearchObjectV1 = version
        ? await resolvePublishedManifest(uuid, version)
        : await getRecentPublishedManifest(uuid);

      // Resolve manifest cid
      const versions = await getPublishedVersions(uuid);
      const reversedVersions = versions.versions.reverse();
      const specificVersion = version
        ? reversedVersions[version]
        : reversedVersions[reversedVersions.length - 1];
      const manifestCid = convertHexToCID(specificVersion.cid);

      return {
        uuid,
        manifestUrl: manifestCid,
        version,
        manifest,
        componentIndex,
        annotationIndex,
        mode: "reader",
        params,
      };
    } else {
      throw Error("Couldn't parse route");
    }
  } catch (e) {
    let err = e as unknown as any;
    return {
      error: true,
      reason: "Couldn't load private node data",
      data: err.toString(),
    };
  }
};

export default function Nodes() {
  return (
    <>
      <Outlet />
    </>
  );
}
