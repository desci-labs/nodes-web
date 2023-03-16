// import { manuscriptController$ } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { setCurrentPage } from "@src/state/nodes/pdf";
import { useSetter } from "@src/store/accessors";
import maxBy from "lodash.maxby";
import { useEffect, useState } from "react";
import { viewportTarget$ } from "..";

export const INTERSECTION_RATIOS: any = {};

const isCurrentPage = (pageNumber: number) => {
  const highestRatio = maxBy(
    Object.entries(INTERSECTION_RATIOS) as any,
    (o: any) => o[1]
  );
  return highestRatio[0] === pageNumber.toString();
};

const useCustomIntersection = (
  pageNumber: number,
  pageRefCurrent: any,
  disabled: boolean = false
) => {
  const dispatch = useSetter();
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);

  useEffect(() => {
    const pageTarget = pageRefCurrent;
    if (!disabled) {
      const subscription = viewportTarget$.subscribe((viewportTarget: any) => {
        if (viewportTarget && pageTarget) {
          if (
            pageTarget.offsetTop <=
              viewportTarget.scrollTop + viewportTarget.offsetHeight &&
            viewportTarget.scrollTop <=
              pageTarget.offsetTop + pageTarget.offsetHeight
          ) {
            setIsIntersecting(true);

            const topMarginPercent =
              Math.max(pageTarget.offsetTop - viewportTarget.scrollTop, 0) /
              viewportTarget.offsetHeight;
            const bottomMarginPercent =
              Math.max(
                viewportTarget.scrollTop +
                  viewportTarget.offsetHeight -
                  (pageTarget.offsetTop + pageTarget.offsetHeight),
                0
              ) / viewportTarget.offsetHeight;

            const percentOfViewport =
              1 - topMarginPercent - bottomMarginPercent;

            INTERSECTION_RATIOS[pageNumber] = percentOfViewport;
            if (isCurrentPage(pageNumber)) {
              dispatch(setCurrentPage(pageNumber));
            }
          } else {
            setIsIntersecting(false);
            delete INTERSECTION_RATIOS[pageNumber];
          }
        } else {
          setIsIntersecting(false);
          delete INTERSECTION_RATIOS[pageNumber];
        }
      });
      return () => subscription.unsubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageRefCurrent, disabled, pageNumber]);

  return isIntersecting;
};

export default useCustomIntersection;
