import axios from "axios";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import {
  PdfComponent,
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
  RESEARCH_OBJECT_NODES_PREFIX,
} from "@desci-labs/desci-models";
import {
  getPublishStatus,
  getRecentPublishedManifest,
  getResearchObjectStub,
  resolvePublishedManifest,
} from "@src/api";
import {
  cleanupManifestUrl,
  getNonDataComponentsFromManifest,
  triggerTooltips,
  __log,
} from "@src/components/utils";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  setCurrentPdf,
  setIsAnnotating,
  setSelectedAnnotationId,
} from "@src/state/nodes/pdf";
import {
  pushToComponentStack,
  ResearchTabs,
  setComponentStack,
  setCurrentObjectId,
  setIsNew,
  setManifest,
  setManifestCid,
  setResearchPanelTab,
  toggleMode,
} from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import useParseObjectID from "@src/components/organisms/ManuscriptReader/useParseObjectID";
import { manuscriptLoader } from "@src/components/screens/Nodes";

export default function useManuscriptReader(publicView: boolean = false) {
  const parsedManuscript = useLoaderData() as Awaited<
    ReturnType<typeof manuscriptLoader>
  >;
  const cid = useParseObjectID();
  console.log("Parsed loader Result", parsedManuscript, cid);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useSetter();
  const { mode } = useNodeReader();

  const { setPrivCidMap, scrollToPage$ } = useManuscriptController([
    "scrollToPage$",
    "isAddingComponent",
    "isAddingSubcomponent",
    "showUploadPanel",
  ]);

  // get manifest, cid, manifestUri, privCidMaps
  const loadDraft = async (cid: string) => {
    if (!publicView && "manifest" in parsedManuscript) {
      dispatch(setIsNew(false));
      dispatch(setCurrentPdf(""));

      dispatch(setCurrentObjectId(parsedManuscript.cid));
      dispatch(setResearchPanelTab(ResearchTabs.current));

      if (mode !== "editor") {
        dispatch(toggleMode());
      }
      dispatch(setIsAnnotating(false));

      if ("privateCids" in parsedManuscript) {
        const cidMap: Record<string, boolean> = {};
        parsedManuscript.privateCids.forEach((c: string) => (cidMap[c] = true));
        setPrivCidMap(cidMap);
      }

      dispatch(setManifest(parsedManuscript.manifest));

      const firstNonDataComponent = getNonDataComponentsFromManifest(
        parsedManuscript.manifest
      )[0];

      dispatch(setComponentStack([firstNonDataComponent]));

      localStorage.setItem("manifest-url", parsedManuscript.manifestUrl);
      triggerTooltips();
    }
  };

  const loadPublic = async (params: string) => {
    setIsLoading(true);
    const [uuid, version, componentIndex, annotationIndex, ...rest] =
      params.split("/");
    __log(
      "[ManuscriptReader -> LOAD PUBLIC]:::::::==================>",
      uuid,
      version,
      componentIndex,
      annotationIndex,
      rest
    );
    // get research object id
    console.log("PUBLIC UUID", uuid, version);
    if (uuid) {
      setCurrentPdf("");
      setIsNew(false);
      setIsAnnotating(false);
      const currentId = uuid;
      (async () => {
        try {
          console.log(
            "PRELOAD PULBIC::setManifestData",
            uuid,
            version,
            componentIndex
          );
          const res: ResearchObjectV1 = version
            ? await resolvePublishedManifest(uuid, version)
            : await getRecentPublishedManifest(uuid);

          // setManifestCid("tbd");
          dispatch(setManifestCid("tbd"));
          const targetData = res;
          console.log("LOAD PULBIC::setManifestData", targetData);

          const defaultComponent = targetData.components.find(
            (c) => c.type === ResearchObjectComponentType.PDF
          );
          let targetComponent = defaultComponent ?? targetData.components[0];
          console.log("targetComponent", targetComponent);
          dispatch(setManifest(targetData));

          setComponentStack([targetComponent]);
          // __log(
          //   "ManuscriptReader::useEffect[params] Reset componentStack",
          //   JSON.stringify(targetData.components[0])
          // );
          triggerTooltips();

          if (componentIndex) {
            const componentIndexParsed = parseInt(componentIndex);
            const target: ResearchObjectV1Component =
              targetData.components[componentIndexParsed];

            if (target) {
              console.log("TARGET ================>", target);
              switch (target.type) {
                case ResearchObjectComponentType.CODE:
                  console.log("TARGET COMPONENT SET ================>", target);
                  dispatch(pushToComponentStack(target));
                  break;
                case ResearchObjectComponentType.PDF:
                  setComponentStack([target]);

                  if (
                    annotationIndex &&
                    annotationIndex.charAt(0).toLowerCase() === "a"
                  ) {
                    const annotationIndexParsed = parseInt(
                      annotationIndex.substring(1)
                    );

                    if (target && target.payload) {
                      const targetAnnotations = (target as PdfComponent).payload
                        .annotations;
                      if (targetAnnotations) {
                        const targetAnnotation =
                          targetAnnotations[annotationIndexParsed];
                        if (targetAnnotation) {
                          dispatch(
                            setSelectedAnnotationId(targetAnnotation.id)
                          );
                        }
                      }
                    }
                  } else {
                    // go to page
                    const annotationIndexParsed = parseInt(annotationIndex);

                    setTimeout(() => {
                      scrollToPage$.next(annotationIndexParsed);
                    }, 1000);
                  }
                  break;
              }
            }
          }
          setIsLoading(false);
        } catch (err) {
          setIsLoading(false);
          console.error(
            "ManuscriptReader: manifest load err",
            uuid,
            version,
            componentIndex,
            annotationIndex,
            rest
          );
        } finally {
          dispatch(setCurrentObjectId(currentId));
          dispatch(setResearchPanelTab(ResearchTabs.current));
        }
      })();
    }
  };

  /**
   * Read the research object id from URL and make backend request
   */
  useEffect(() => {
    if ("error" in parsedManuscript) return;
    if (publicView && "uuid" in parsedManuscript) {
      loadPublic(cid as string);
    } else {
      loadDraft(cid as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid, publicView]);

  return { isLoading, cid };
}
