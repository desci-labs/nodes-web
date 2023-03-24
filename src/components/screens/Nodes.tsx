import {
  ResearchObjectV1,
  RESEARCH_OBJECT_NODES_PREFIX,
} from "@desci-labs/desci-models";
import {
  getPublishStatus,
  getRecentPublishedManifest,
  getResearchObjectStub,
  resolvePublishedManifest,
} from "@src/api";
import axios from "axios";
import { LoaderFunctionArgs, Outlet, Params } from "react-router-dom";
import { cleanupManifestUrl } from "../utils";

export type ManuscriptLoaderData =
  | {
      cid: string;
      manifestUrl: string;
      privateCids: string[];
      manifest: ResearchObjectV1;
      mode: "editor";
      params: Params<string>;
    }
  | {
      mode: "reader";
      uuid: string;
      version: string;
      componentIndex: string;
      annotationIndex: string;
      manifest: ResearchObjectV1;
      params: Params<string>;
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
      const { privCids } = await getPublishStatus(cidUri, params.cid);
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
        privateCids: privCids ?? [],
        mode: "editor",
      };
    } else {
      if (!splet) throw Error("Couldn't parse route");

      const [uuid, version, componentIndex, annotationIndex] = splet.split("/");

      const manifest: ResearchObjectV1 = version
        ? await resolvePublishedManifest(uuid, version)
        : await getRecentPublishedManifest(uuid);

      return {
        uuid,
        version,
        manifest,
        componentIndex,
        annotationIndex,
        mode: "reader",
        params,
      };
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
