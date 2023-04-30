import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import {
  PdfComponent,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import {
  cleanupManifestUrl,
  getNonDataComponentsFromManifest,
  triggerTooltips,
} from "@src/components/utils";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  setCurrentPdf,
  setIsAnnotating,
  setSelectedAnnotationId,
} from "@src/state/nodes/pdf";
import {
  getDefaultComponentForView,
  pushToComponentStack,
  ResearchTabs,
  resetNodeViewer,
  setComponentStack,
  setCurrentObjectId,
  setCurrentShareId,
  setIsNew,
  setManifest,
  setManifestCid,
  setResearchPanelTab,
  toggleMode,
} from "@src/state/nodes/nodeReader";
import { useSetter } from "@src/store/accessors";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import useParseObjectID from "@src/components/organisms/ManuscriptReader/useParseObjectID";
import { manuscriptLoader } from "@src/components/screens/Nodes";
import { setCurrentVersion } from "@src/state/nodes/history";

export default function useManuscriptReader(publicView: boolean = false) {
  const parsedManuscript = useLoaderData() as Awaited<
    ReturnType<typeof manuscriptLoader>
  >;
  const cid = useParseObjectID();
  const dispatch = useSetter();
  const { mode } = useNodeReader();

  const { scrollToPage$ } = useManuscriptController([
    "scrollToPage$",
    "isAddingComponent",
    "isAddingSubcomponent",
  ]);

  console.log("Parsed Manuscript", parsedManuscript);
  const initPrivateReader = async (cid: string) => {
    if (
      !publicView &&
      "manifest" in parsedManuscript &&
      "cid" in parsedManuscript
    ) {
      // update shareId
      if ("shareId" in parsedManuscript) {
        dispatch(setCurrentShareId(parsedManuscript.shareId!));
      } else {
        dispatch(setCurrentShareId(""));
      }

      dispatch(setIsNew(false));
      dispatch(setCurrentPdf(""));
      dispatch(setManifest(parsedManuscript.manifest));
      dispatch(setCurrentObjectId(parsedManuscript.cid));
      dispatch(setResearchPanelTab(ResearchTabs.current));

      // TODO: remove line to support reader mode in private share
      if (mode !== parsedManuscript.mode) {
        dispatch(toggleMode());
      }
      dispatch(setIsAnnotating(false));

      const manifestUrlCleaned = cleanupManifestUrl(
        parsedManuscript.manifestUrl
      );
      const manifestCidOnly = manifestUrlCleaned.substring(
        (process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE || "").length + 1
      );
      dispatch(setManifestCid(manifestCidOnly));

      const firstNonDataComponent = getDefaultComponentForView(
        parsedManuscript.manifest
      );

      dispatch(setComponentStack([firstNonDataComponent]));
      triggerTooltips();

      if ("manifestUrl" in parsedManuscript)
        localStorage.setItem("manifest-url", parsedManuscript.manifestUrl);
    }
  };

  const initPublicViewer = async (cid: string) => {
    if ("uuid" in parsedManuscript && !!parsedManuscript.uuid) {
      const { uuid } = parsedManuscript;

      dispatch(setCurrentPdf(""));
      setIsNew(false);
      setIsAnnotating(false);
      const currentId = uuid;

      if ("manifest" in parsedManuscript && !!parsedManuscript.manifest) {
        const defaultComponent = getDefaultComponentForView(
          parsedManuscript.manifest
        );
        let targetComponent =
          defaultComponent ?? parsedManuscript.manifest.components[0];
        dispatch(setManifest(parsedManuscript.manifest));

        // trigger tootipes
        triggerTooltips();

        // assign component index
        if (
          "componentIndex" in parsedManuscript &&
          parsedManuscript.componentIndex !== undefined
        ) {
          const componentIndex = parsedManuscript.componentIndex;

          const componentIndexParsed = parseInt(componentIndex);
          const target: ResearchObjectV1Component =
            parsedManuscript.manifest.components[componentIndexParsed];

          if (target) {
            switch (target.type) {
              case ResearchObjectComponentType.DATA:
                dispatch(setComponentStack([]));
                break;
              case ResearchObjectComponentType.CODE:
                dispatch(pushToComponentStack(target));
                break;
              case ResearchObjectComponentType.PDF:
                dispatch(setComponentStack([target]));

                if (
                  "annotationIndex" in parsedManuscript &&
                  !!parsedManuscript.annotationIndex
                ) {
                  const annotationIndex = parsedManuscript.annotationIndex;

                  if (annotationIndex.charAt(0).toLowerCase() === "a") {
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
                }
                break;
            }
          } else {
            dispatch(setComponentStack([targetComponent]));
          }
        } else {
          dispatch(setComponentStack([targetComponent]));
        }
      }
      dispatch(setCurrentObjectId(currentId));
      dispatch(setResearchPanelTab(ResearchTabs.current));
    } else {
      dispatch(resetNodeViewer());
      dispatch(setCurrentObjectId(cid));
    }
  };

  /**
   * Read the research object id from URL and make backend request
   */
  useEffect(() => {
    if (publicView) {
      const uuid = "uuid" in parsedManuscript ? parsedManuscript.uuid : "";
      initPublicViewer(uuid || (cid?.split("/")[0] as string));
    } else {
      const parsedCid = "cid" in parsedManuscript ? parsedManuscript.cid : "";
      initPrivateReader(parsedCid ?? (cid as string));
    }
    if ("version" in parsedManuscript) {
      dispatch(setCurrentVersion(parsedManuscript.version));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid, parsedManuscript, publicView]);

  return { isLoading: false, cid };
}
