import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useCallback, useEffect, useRef } from "react";
import { viewportTarget$ } from "@components/organisms/Paper";

export default function useScroll() {
  const { setScrollRef } = useManuscriptController(["scrollRef"]);

  const scrollContainerRef = useRef<any>(document.documentElement);
  document.documentElement.style.touchAction = "none";
  const onScroll = useCallback((e: MouseEvent) => {
    viewportTarget$.next(document.scrollingElement);
  }, []);

  useEffect(() => {
    viewportTarget$.next(document.scrollingElement);

    document.body.onscroll = (e: any) => {
      onScroll(e);
    };
    setScrollRef(scrollContainerRef);
  }, [onScroll, setScrollRef]);

  useEffect(() => {
    viewportTarget$.next(document.scrollingElement);
    setScrollRef(scrollContainerRef);
  }, [setScrollRef]);
}
