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
import axios from "axios";
import { useEffect, useState } from "react";
import { useManuscriptController } from "../ManuscriptController";
import useParseObjectID from "../useParseObjectID";

export default function useManuscriptReader(publicView: boolean = false) {
  const cid = useParseObjectID();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useSetter();
  const { mode } = useNodeReader();

  const { setPrivCidMap, scrollToPage$ } = useManuscriptController([
    "scrollToPage$",
    "isAddingComponent",
    "isAddingSubcomponent",
    "showUploadPanel",
  ]);

  const loadDraft = async (cid: string) => {
    if (!publicView) {
      if (cid && cid !== "start") {
        __log("ManuscriptReader -> load", cid);
        // get research object id
        let ro = cid;
        const currentId = ro.substring(RESEARCH_OBJECT_NODES_PREFIX.length);
        if (ro) {
          dispatch(setIsNew(false));
          dispatch(setCurrentPdf(""));
          // turn off editor mode if we switch ROs
          if (mode !== "editor") {
            dispatch(toggleMode());
          }
          dispatch(setIsAnnotating(false));

          // setViewLoading(true);

          (async () => {
            let manifestUrl: string | undefined = undefined;
            try {
              const res: any = await getResearchObjectStub(ro);
              console.log(
                ["GET RESEARCH_OBJECT_STUB=====================>"],
                res
              );
              const manifestCidUri = res.uri || res.manifestUrl;
              // setManifestCid(manifestCidUri);
              dispatch(setManifestCid(manifestCidUri));
              // const parsed = JSON.parse(roData.restBody);
              // const pdf = parsed.links.pdf[0];

              const { privCids } = await getPublishStatus(
                manifestCidUri,
                currentId
              );
              if (!privCids) return;
              const cidMap: Record<string, boolean> = {};
              privCids.forEach((c: string) => (cidMap[c] = true));
              setPrivCidMap(cidMap);
              // debugger;

              manifestUrl = cleanupManifestUrl(manifestCidUri);
              let targetData = res.manifestData;
              if (targetData) {
                dispatch(setManifest(targetData));
              } else {
                const { data } = await axios.get(manifestUrl);
                dispatch(setManifest(data));
                targetData = data;
              }

              const firstNonDataComponent =
                getNonDataComponentsFromManifest(targetData)[0];

              dispatch(setComponentStack([firstNonDataComponent]));
              // __log(
              //   "ManuscriptReader::useEffect[params] Reset componentStack",
              //   JSON.stringify(firstNonDataComponent)
              // );
              localStorage.setItem("manifest-url", manifestUrl);
              triggerTooltips();
            } catch (err) {
              console.error("ManuscriptReader: manifest load err", manifestUrl);
            } finally {
              // setViewLoading(false);
            }
          })();
        } else {
          // load default data here
        }

        dispatch(setCurrentObjectId(currentId));
        dispatch(setResearchPanelTab(ResearchTabs.current));
      }
    }
  };

  const loadPublic = async (params: string) => {
    setIsLoading(true);
    const [uuid, firstParam, secondParam, thirdParam, ...rest] =
      params.split("/");
    __log(
      "[ManuscriptReader -> LOAD PUBLIC]:::::::==================>",
      uuid,
      firstParam,
      secondParam,
      thirdParam,
      rest
    );
    // get research object id
    console.log("PUBLIC UUID", uuid, firstParam);
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
            firstParam,
            secondParam
          );
          const res: ResearchObjectV1 = firstParam
            ? await resolvePublishedManifest(uuid, firstParam)
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

          if (secondParam) {
            const secondParamParsed = parseInt(secondParam);
            const target: ResearchObjectV1Component =
              targetData.components[secondParamParsed];

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
                    thirdParam &&
                    thirdParam.charAt(0).toLowerCase() === "a"
                  ) {
                    const thirdParamParsed = parseInt(thirdParam.substring(1));

                    if (target && target.payload) {
                      const targetAnnotations = (target as PdfComponent).payload
                        .annotations;
                      if (targetAnnotations) {
                        const targetAnnotation =
                          targetAnnotations[thirdParamParsed];
                        if (targetAnnotation) {
                          dispatch(
                            setSelectedAnnotationId(targetAnnotation.id)
                          );
                        }
                      }
                    }
                  } else {
                    // go to page
                    const thirdParamParsed = parseInt(thirdParam);

                    setTimeout(() => {
                      scrollToPage$.next(thirdParamParsed);
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
            firstParam,
            secondParam,
            thirdParam,
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
    if (publicView) {
      loadPublic(cid as string);
    } else {
      loadDraft(cid as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid, publicView]);

  return { isLoading, cid };
}
