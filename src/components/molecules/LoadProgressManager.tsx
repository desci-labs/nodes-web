import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useCallback, useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import { useLocation } from "react-router-dom";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setLoadState, setSelectedAnnotationId } from "@src/state/nodes/pdf";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

let onFirstLoad = false;
const LoadProgressManager = () => {
  const dispatch = useSetter();
  const {
    viewLoading,
    loadState: { loadPercent, loadProgressTaken },
  } = usePdfReader();
  const { scrollRef } = useManuscriptController(["scrollRef"]);

  const { componentStack } = useNodeReader();

  let query = useQuery();
  useEffect(() => {
    const a = query.get("a");
    if (!onFirstLoad) {
      // const p = window.location.pathname;
      // const s = p.match(/\0/\d+/)
      // if (.indexOf("/0/\d+") > -1)
    }
    if (a && !onFirstLoad) {
      const doIt = () => {
        if (scrollRef && scrollRef.current) {
          onFirstLoad = true;
          scrollRef!.current.scrollToIndex({
            index: 15,
          });

          setTimeout(() => {
            // Todo: why is this hardcoded ?
            dispatch(
              setSelectedAnnotationId("ba055c79-1cf0-4dab-bc72-465d7bb480fe")
            );
          }, 1000);
        } else {
          setTimeout(doIt, 1000);
        }
      };
      setTimeout(doIt, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdate = useCallback(
    debounce((pct) => {
      if (!loadProgressTaken && pct > loadPercent) {
        dispatch(setLoadState({ loadPercent: pct }));
      }
    }, 40),
    [loadProgressTaken, loadPercent]
  );
  useEffect(() => {
    /**
     * Don't display load indicator when switching to Drive view
     */
    if (!componentStack.length) {
      return;
    }
    if (!loadProgressTaken) {
      if (componentStack && componentStack.length) {
        if (viewLoading) {
          if (loadPercent < 50) {
            debounceUpdate(loadPercent + 0.3);
          }
        }
      } else {
        if (!viewLoading && loadPercent < 40) {
          debounceUpdate(loadPercent + 0.4);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentStack, loadPercent, viewLoading, loadProgressTaken]);

  return null;
};

export default LoadProgressManager;
