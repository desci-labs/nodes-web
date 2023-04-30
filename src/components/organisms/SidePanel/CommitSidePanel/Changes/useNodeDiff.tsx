import { useEffect, useState } from "react";
import DeepDiff from "deep-diff";
import {
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { getRecentPublishedManifest } from "@src/api";
import { useNodeReader } from "@src/state/nodes/hooks";

const DUMMY_DIFF_OBJ: ResearchObjectV1 = {
  contributors: [],
  history: [],
  components: [],
  // stuff: 'and things',
  version: 1,
};

export default function useNodeDiff() {
  const {
    manifest: manifestData,
    currentObjectId,
    isCommitPanelOpen,
  } = useNodeReader();
  const [diff, setDiff] = useState<DeepDiff.Diff<any>[]>();
  const [changes, setChanges] = useState<string[]>([]);
  const [diffRoot, setDiffRoot] = useState<ResearchObjectV1>(DUMMY_DIFF_OBJ);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!currentObjectId) {
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const newRoot = await getRecentPublishedManifest(currentObjectId!);
        console.log("NEW ROOT", newRoot);
        setDiffRoot(newRoot);
        setError(false);
      } catch (err: any) {
        // if we have an RPC failure, dont allow user to continue
        const newRoot = err.response.data;
        if (!newRoot.networkFail) {
          setError(false);
        }
        // otherwise this is a first time publish
      } finally {
        setLoading(false);
      }
    })();
  }, [currentObjectId, isCommitPanelOpen]);

  /**
   * Construct a simple human-readable string to represent each change to the
   * manifestData object
   */
  useEffect(() => {
    // DO NOT DEEP DIFF THE straight manifestData, it will reverse the component order by accident
    // also need to do custom diff rules
    const processForDiff = (src: ResearchObjectV1) => {
      const ret = Object.assign({}, src);
      const components: { [key: string]: ResearchObjectV1Component } = {};
      const version = ret?.version;
      ret?.components?.forEach((c) => {
        components[c.id] = c;
      });
      return { components, version };
    };
    const srcOld = processForDiff(diffRoot);
    const srcNew = processForDiff(manifestData!);

    const objDiff = DeepDiff.diff(srcOld, srcNew || {}) || [];
    setDiff(objDiff);
    const changes = [];
    for (let item of objDiff) {
      let changeStr = "";
      switch (true) {
        case item.path?.includes("components"):
          changeStr += "Component";
          break;
        case item.path?.includes("contributors"):
          changeStr += "Contributor";
          break;
        case item.path?.includes("validations"):
          changeStr += "Validation";
          break;
        case item.path?.includes("attributes"):
          changeStr += "Attribute";
          break;
        case item.path?.includes("tags"):
          changeStr += "Tag";
          break;
        case item.path?.includes("organizations"):
          changeStr += "Organization";
          break;
        default:
          changeStr +=
            item.path && item.path[0]
              ? item.path[0].toString()[0].toUpperCase() +
                item.path[0].toString().slice(1)
              : "Field";
      }
      switch (item.kind) {
        case "A":
          switch ((item as any).item.kind) {
            case "D":
              changeStr += " Deleted";
              break;
            case "E":
              changeStr += " Updated";
              break;
            case "N":
              changeStr += " Created";
              break;
          }
          break;
        case "D":
          changeStr += " Deleted";
          break;
        case "E":
          changeStr += " Updated";
          break;
        case "N":
          changeStr += " Created";
          break;
      }
      if (item!.path![0] !== "history") {
        changes.push(changeStr);
      }
    }
    setChanges(changes);
  }, [manifestData, diffRoot]);

  return { changes, diffRoot, diff, isLoading: loading, isError: error };
}
